from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database import get_db
from app.models.dictee import Dictee
from app.models.user import User
from app.schemas.dictee import DicteeCreate, DicteeUpdate, DicteeRead
from app.api.deps import get_current_user

router = APIRouter(prefix="/api/dictees", tags=["dictees"])


def _apply_errors(obj: Dictee, errors) -> None:
    obj.err_conjugaison = errors.conjugaison
    obj.err_homophone   = errors.homophone
    obj.err_accord      = errors.accord
    obj.err_majuscule   = errors.majuscule
    obj.err_ponctuation = errors.ponctuation
    obj.err_infinitif   = errors.infinitif
    obj.err_orthographe = errors.orthographe
    obj.err_non_present = errors.non_present
    obj.err_son         = errors.son


@router.get("", response_model=list[DicteeRead])
async def list_dictees(
    niveau:  str | None = None,
    periode: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(Dictee).where(Dictee.user_id == current_user.id).order_by(Dictee.created_at.desc())
    if niveau:
        query = query.where(Dictee.niveau == niveau)
    if periode:
        query = query.where(Dictee.periode == periode)
    result = await db.execute(query)
    dictees = result.scalars().all()
    return [DicteeRead.from_orm_with_errors(d) for d in dictees]


@router.get("/stats")
async def get_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total = (await db.execute(
        select(func.count(Dictee.id)).where(Dictee.user_id == current_user.id)
    )).scalar()
    return {"total": total}


@router.get("/{dictee_id}", response_model=DicteeRead)
async def get_dictee(
    dictee_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    dictee = await db.get(Dictee, dictee_id)
    if not dictee or dictee.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dictée introuvable")
    return DicteeRead.from_orm_with_errors(dictee)


@router.post("", response_model=DicteeRead, status_code=status.HTTP_201_CREATED)
async def create_dictee(
    body: DicteeCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    dictee = Dictee(
        user_id=current_user.id,
        titre=body.titre,
        niveau=body.niveau,
        periode=body.periode,
        temps=body.temps,
        tag=body.tag,
        texte=body.texte,
    )
    _apply_errors(dictee, body.errors)
    db.add(dictee)
    await db.commit()
    await db.refresh(dictee)
    return DicteeRead.from_orm_with_errors(dictee)


@router.put("/{dictee_id}", response_model=DicteeRead)
async def update_dictee(
    dictee_id: int,
    body: DicteeUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    dictee = await db.get(Dictee, dictee_id)
    if not dictee or dictee.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dictée introuvable")
    for field, value in body.model_dump(exclude_none=True, exclude={"errors"}).items():
        setattr(dictee, field, value)
    if body.errors:
        _apply_errors(dictee, body.errors)
    await db.commit()
    await db.refresh(dictee)
    return DicteeRead.from_orm_with_errors(dictee)


@router.delete("/{dictee_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_dictee(
    dictee_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    dictee = await db.get(Dictee, dictee_id)
    if not dictee or dictee.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dictée introuvable")
    await db.delete(dictee)
    await db.commit()
