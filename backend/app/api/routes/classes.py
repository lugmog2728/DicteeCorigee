from collections import defaultdict
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database import get_db
from app.models.classe import Classe
from app.models.eleve import Eleve
from app.models.correction import Correction
from app.models.planification import Planification
from app.models.user import User
from app.schemas.classe import ClasseCreate, ClasseUpdate, ClasseRead
from app.api.deps import get_current_user


class EleveStatItem(BaseModel):
    id:                    int
    prenom:                str
    initiale:              str
    dispositif:            str | None
    moyenne:               float | None
    trend:                 float | None
    derniere_dictee_score: int | None
    total_corrections:     int
    derniere_date:         datetime | None


class ClasseStatsRead(BaseModel):
    total_eleves:             int
    moyenne_generale:         float | None
    total_dictees_planifiees: int
    eleves_en_difficulte:     int
    eleves:                   list[EleveStatItem]

router = APIRouter(prefix="/api/classes", tags=["classes"])


def _linear_trend(scores: list[float]) -> float | None:
    """Slope of the least-squares line through the scores (oldest → newest).
    Unit: points per dictée. None when fewer than 2 data points."""
    n = len(scores)
    if n < 2:
        return None
    x_mean = (n - 1) / 2
    y_mean = sum(scores) / n
    num = sum((i - x_mean) * (scores[i] - y_mean) for i in range(n))
    den = sum((i - x_mean) ** 2 for i in range(n))
    if den == 0:
        return None
    return round(num / den, 1)


@router.get("", response_model=list[ClasseRead])
async def list_classes(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Sous-requête : moyenne par élève
    eleve_avg = (
        select(
            Eleve.classe_id,
            func.avg(Correction.score).label("eleve_moy"),
        )
        .join(Correction, Correction.eleve_id == Eleve.id)
        .group_by(Eleve.id)
        .subquery()
    )
    # Requête principale : moyenne des moyennes par classe
    stmt = (
        select(Classe, func.avg(eleve_avg.c.eleve_moy).label("moyenne"))
        .outerjoin(eleve_avg, eleve_avg.c.classe_id == Classe.id)
        .where(Classe.user_id == current_user.id)
        .group_by(Classe.id)
        .order_by(Classe.created_at.desc())
    )
    rows = (await db.execute(stmt)).all()
    return [
        ClasseRead(
            id=cls.id,
            user_id=cls.user_id,
            nom=cls.nom,
            niveau=cls.niveau,
            annee_scolaire=cls.annee_scolaire,
            nb_eleves=cls.nb_eleves,
            created_at=cls.created_at,
            updated_at=cls.updated_at,
            moyenne=round(float(moy), 1) if moy is not None else None,
        )
        for cls, moy in rows
    ]


@router.get("/{classe_id}/stats", response_model=ClasseStatsRead)
async def get_classe_stats(
    classe_id:    int,
    db:           AsyncSession = Depends(get_db),
    current_user: User         = Depends(get_current_user),
):
    classe = await db.get(Classe, classe_id)
    if not classe or classe.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Classe introuvable")

    eleves_res = await db.execute(
        select(Eleve).where(Eleve.classe_id == classe_id).order_by(Eleve.prenom)
    )
    eleves = eleves_res.scalars().all()
    eleve_ids = [e.id for e in eleves]

    by_eleve: dict[int, list[Correction]] = defaultdict(list)
    if eleve_ids:
        corr_res = await db.execute(
            select(Correction).where(Correction.eleve_id.in_(eleve_ids))
        )
        for c in corr_res.scalars().all():
            if c.eleve_id is not None:
                by_eleve[c.eleve_id].append(c)
        for lst in by_eleve.values():
            lst.sort(key=lambda c: c.created_at, reverse=True)

    planif_count_res = await db.execute(
        select(func.count(Planification.id)).where(Planification.classe_id == classe_id)
    )
    total_planifications = planif_count_res.scalar() or 0

    eleve_stats: list[EleveStatItem] = []
    for eleve in eleves:
        corrections = by_eleve.get(eleve.id, [])
        if corrections:
            moyenne = round(sum(c.score for c in corrections) / len(corrections), 1)
            scores_asc = [c.score for c in reversed(corrections)]  # oldest first
            trend = _linear_trend(scores_asc)
            derniere_score = corrections[0].score
            derniere_date  = corrections[0].created_at
        else:
            moyenne = trend = derniere_score = derniere_date = None

        eleve_stats.append(EleveStatItem(
            id=eleve.id,
            prenom=eleve.prenom,
            initiale=eleve.initiale,
            dispositif=eleve.dispositif,
            moyenne=moyenne,
            trend=trend,
            derniere_dictee_score=derniere_score,
            total_corrections=len(corrections),
            derniere_date=derniere_date,
        ))

    moyennes = [e.moyenne for e in eleve_stats if e.moyenne is not None]
    moyenne_generale = round(sum(moyennes) / len(moyennes), 2) if moyennes else None
    eleves_en_difficulte = sum(1 for e in eleve_stats if e.moyenne is not None and e.moyenne <= 40)

    return ClasseStatsRead(
        total_eleves=classe.nb_eleves,
        moyenne_generale=moyenne_generale,
        total_dictees_planifiees=total_planifications,
        eleves_en_difficulte=eleves_en_difficulte,
        eleves=eleve_stats,
    )


@router.get("/{classe_id}", response_model=ClasseRead)
async def get_classe(
    classe_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    classe = await db.get(Classe, classe_id)
    if not classe or classe.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Classe introuvable")
    return classe


@router.post("", response_model=ClasseRead, status_code=status.HTTP_201_CREATED)
async def create_classe(
    body: ClasseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    classe = Classe(
        user_id=current_user.id,
        nom=body.nom,
        niveau=body.niveau,
        annee_scolaire=body.annee_scolaire,
    )
    db.add(classe)
    await db.commit()
    await db.refresh(classe)
    return classe


@router.put("/{classe_id}", response_model=ClasseRead)
async def update_classe(
    classe_id: int,
    body: ClasseUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    classe = await db.get(Classe, classe_id)
    if not classe or classe.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Classe introuvable")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(classe, field, value)
    await db.commit()
    await db.refresh(classe)
    return classe


@router.delete("/{classe_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_classe(
    classe_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    classe = await db.get(Classe, classe_id)
    if not classe or classe.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Classe introuvable")
    await db.delete(classe)
    await db.commit()
