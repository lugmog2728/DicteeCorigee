import os
import uuid
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.correction import Correction
from app.models.planification import Planification
from app.models.user import User
from app.schemas.correction import CorrectionRead
from app.api.deps import get_current_user

router = APIRouter(prefix="/api/corrections", tags=["corrections"])

UPLOADS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "uploads", "corrections")


async def _save_image(image: UploadFile) -> str:
    os.makedirs(UPLOADS_DIR, exist_ok=True)
    ext = (image.filename or "jpg").rsplit(".", 1)[-1].lower()
    filename = f"{uuid.uuid4()}.{ext}"
    dest = os.path.join(UPLOADS_DIR, filename)
    content = await image.read()
    with open(dest, "wb") as f:
        f.write(content)
    return f"uploads/corrections/{filename}"


@router.post("", response_model=CorrectionRead, status_code=status.HTTP_201_CREATED)
async def create_correction(
    dictee_id:        int          = Form(...),
    score:            int          = Form(...),
    nb_errors:        int          = Form(...),
    student_name:     str          = Form(""),
    planification_id: int | None   = Form(None),
    eleve_id:         int | None   = Form(None),
    err_conjugaison:  int          = Form(0),
    err_homophone:    int          = Form(0),
    err_accord:       int          = Form(0),
    err_majuscule:    int          = Form(0),
    err_ponctuation:  int          = Form(0),
    err_infinitif:    int          = Form(0),
    err_orthographe:  int          = Form(0),
    err_non_present:  int          = Form(0),
    err_son:          int          = Form(0),
    image:            UploadFile | None = File(None),
    db:               AsyncSession = Depends(get_db),
    current_user:     User         = Depends(get_current_user),
):
    image_path: str | None = None
    if image and image.filename:
        image_path = await _save_image(image)

    correction = Correction(
        user_id=current_user.id,
        planification_id=planification_id,
        dictee_id=dictee_id,
        eleve_id=eleve_id,
        student_name=student_name,
        image_path=image_path,
        score=score,
        nb_errors=nb_errors,
        err_conjugaison=err_conjugaison,
        err_homophone=err_homophone,
        err_accord=err_accord,
        err_majuscule=err_majuscule,
        err_ponctuation=err_ponctuation,
        err_infinitif=err_infinitif,
        err_orthographe=err_orthographe,
        err_non_present=err_non_present,
        err_son=err_son,
    )
    db.add(correction)

    if planification_id:
        planif = await db.get(Planification, planification_id)
        if planif and planif.user_id == current_user.id:
            planif.nb_corriges = planif.nb_corriges + 1

    await db.commit()
    await db.refresh(correction)
    return correction


@router.get("", response_model=list[CorrectionRead])
async def list_corrections(
    db:           AsyncSession = Depends(get_db),
    current_user: User         = Depends(get_current_user),
):
    from sqlalchemy import select
    result = await db.execute(
        select(Correction)
        .where(Correction.user_id == current_user.id)
        .order_by(Correction.created_at.desc())
    )
    return result.scalars().all()


@router.get("/{correction_id}", response_model=CorrectionRead)
async def get_correction(
    correction_id: int,
    db:            AsyncSession = Depends(get_db),
    current_user:  User         = Depends(get_current_user),
):
    correction = await db.get(Correction, correction_id)
    if not correction or correction.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Correction introuvable")
    return correction
