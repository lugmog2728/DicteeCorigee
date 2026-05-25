from collections import Counter
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.eleve import Eleve
from app.models.classe import Classe
from app.models.user import User
from app.schemas.eleve import EleveBatchCreate, EleveRead
from app.api.deps import get_current_user

router = APIRouter(prefix="/api/eleves", tags=["eleves"])


@router.get("", response_model=list[EleveRead])
async def list_eleves(
    classe_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    classe = await db.get(Classe, classe_id)
    if not classe or classe.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Classe introuvable")
    result = await db.execute(
        select(Eleve)
        .where(Eleve.classe_id == classe_id)
        .order_by(Eleve.created_at.asc())
    )
    return result.scalars().all()


@router.post("/batch", response_model=list[EleveRead], status_code=status.HTTP_201_CREATED)
async def create_eleves_batch(
    body: EleveBatchCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not body.eleves:
        return []

    classe_ids = {e.classe_id for e in body.eleves}
    for cid in classe_ids:
        classe = await db.get(Classe, cid)
        if not classe or classe.user_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Classe {cid} introuvable")

    new_eleves = []
    for e in body.eleves:
        eleve = Eleve(
            classe_id=e.classe_id,
            user_id=current_user.id,
            prenom=e.prenom,
            initiale=e.initiale,
            dispositif=e.dispositif,
        )
        db.add(eleve)
        new_eleves.append(eleve)

    counts = Counter(e.classe_id for e in body.eleves)
    for cid, count in counts.items():
        classe = await db.get(Classe, cid)
        classe.nb_eleves = (classe.nb_eleves or 0) + count

    await db.commit()
    for e in new_eleves:
        await db.refresh(e)
    return new_eleves


@router.delete("/{eleve_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_eleve(
    eleve_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    eleve = await db.get(Eleve, eleve_id)
    if not eleve or eleve.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Élève introuvable")

    classe = await db.get(Classe, eleve.classe_id)
    if classe and classe.nb_eleves > 0:
        classe.nb_eleves -= 1

    await db.delete(eleve)
    await db.commit()
