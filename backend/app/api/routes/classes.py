from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.classe import Classe
from app.models.user import User
from app.schemas.classe import ClasseCreate, ClasseUpdate, ClasseRead
from app.api.deps import get_current_user

router = APIRouter(prefix="/api/classes", tags=["classes"])


@router.get("", response_model=list[ClasseRead])
async def list_classes(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Classe)
        .where(Classe.user_id == current_user.id)
        .order_by(Classe.created_at.desc())
    )
    return result.scalars().all()


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
