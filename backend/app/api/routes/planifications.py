import json
from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.planification import Planification
from app.models.classe import Classe
from app.models.dictee import Dictee
from app.models.user import User
from app.schemas.planification import (
    PlanificationCreate,
    PlanificationUpdate,
    PlanificationRead,
    PlanificationDetail,
    PlanificationStats,
    Statut,
)
from app.api.deps import get_current_user

router = APIRouter(prefix="/api/planifications", tags=["planifications"])


def _statut(nb_corriges: int, nb_eleves: int) -> Statut:
    if nb_corriges == 0:
        return "planifiee"
    if nb_eleves > 0 and nb_corriges >= nb_eleves:
        return "terminee"
    return "en_cours"


def _parse_types(raw: str) -> list[str]:
    try:
        return json.loads(raw or "[]")
    except (ValueError, TypeError):
        return []


async def _fetch_rows(db: AsyncSession, user_id: int):
    stmt = (
        select(Planification, Classe, Dictee)
        .join(Classe, Planification.classe_id == Classe.id)
        .join(Dictee, Planification.dictee_id == Dictee.id)
        .where(Planification.user_id == user_id)
        .order_by(Planification.date_prevue.asc())
    )
    result = await db.execute(stmt)
    return result.all()


@router.get("/stats", response_model=PlanificationStats)
async def get_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rows = await _fetch_rows(db, current_user.id)

    today = date.today()
    monday = today - timedelta(days=today.weekday())
    sunday = monday + timedelta(days=6)

    cette_semaine = sum(1 for p, c, d in rows if monday <= p.date_prevue <= sunday)
    en_attente = sum(1 for p, c, d in rows if p.nb_corriges == 0)
    classes_actives = len({p.classe_id for p, c, d in rows})

    rates = [
        (p.nb_corriges / c.nb_eleves * 100) if c.nb_eleves > 0 else 0.0
        for p, c, d in rows
    ]
    taux_completion = round(sum(rates) / len(rates), 1) if rates else 0.0

    return PlanificationStats(
        cette_semaine=cette_semaine,
        en_attente=en_attente,
        classes_actives=classes_actives,
        taux_completion=taux_completion,
    )


@router.get("", response_model=list[PlanificationDetail])
async def list_planifications(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rows = await _fetch_rows(db, current_user.id)
    return [
        PlanificationDetail(
            id=p.id,
            date_prevue=p.date_prevue,
            nb_corriges=p.nb_corriges,
            statut=_statut(p.nb_corriges, c.nb_eleves),
            types_neutralises=_parse_types(p.types_neutralises),
            dictee_id=p.dictee_id,
            dictee_titre=d.titre,
            dictee_tag=d.tag,
            dictee_niveau=d.niveau.value,
            dictee_temps=d.temps,
            classe_id=p.classe_id,
            classe_nom=c.nom,
            classe_niveau=c.niveau.value,
            nb_eleves=c.nb_eleves,
        )
        for p, c, d in rows
    ]


@router.post("", response_model=PlanificationRead, status_code=status.HTTP_201_CREATED)
async def create_planification(
    body: PlanificationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    classe = await db.get(Classe, body.classe_id)
    if not classe or classe.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Classe introuvable")

    dictee = await db.get(Dictee, body.dictee_id)
    if not dictee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dictée introuvable")

    planif = Planification(
        user_id=current_user.id,
        classe_id=body.classe_id,
        dictee_id=body.dictee_id,
        date_prevue=body.date_prevue,
        types_neutralises=json.dumps(body.types_neutralises),
    )
    db.add(planif)
    await db.commit()
    await db.refresh(planif)

    return PlanificationRead(
        id=planif.id,
        user_id=planif.user_id,
        classe_id=planif.classe_id,
        dictee_id=planif.dictee_id,
        date_prevue=planif.date_prevue,
        nb_corriges=planif.nb_corriges,
        types_neutralises=_parse_types(planif.types_neutralises),
        created_at=planif.created_at,
        updated_at=planif.updated_at,
    )


@router.put("/{planif_id}", response_model=PlanificationRead)
async def update_planification(
    planif_id: int,
    body: PlanificationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    planif = await db.get(Planification, planif_id)
    if not planif or planif.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Planification introuvable")

    data = body.model_dump(exclude_none=True)
    if "types_neutralises" in data:
        data["types_neutralises"] = json.dumps(data["types_neutralises"])
    for field, value in data.items():
        setattr(planif, field, value)

    await db.commit()
    await db.refresh(planif)

    return PlanificationRead(
        id=planif.id,
        user_id=planif.user_id,
        classe_id=planif.classe_id,
        dictee_id=planif.dictee_id,
        date_prevue=planif.date_prevue,
        nb_corriges=planif.nb_corriges,
        types_neutralises=_parse_types(planif.types_neutralises),
        created_at=planif.created_at,
        updated_at=planif.updated_at,
    )


@router.delete("/{planif_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_planification(
    planif_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    planif = await db.get(Planification, planif_id)
    if not planif or planif.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Planification introuvable")
    await db.delete(planif)
    await db.commit()
