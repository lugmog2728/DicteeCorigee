from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
from pydantic import BaseModel
from app.ml.detector import detect_letters

router = APIRouter(prefix='/api/detection', tags=['detection'])


class DetectedLetter(BaseModel):
    letter: str
    confidence: float
    x: int
    y: int
    w: int
    h: int


class DetectionResult(BaseModel):
    letters: list[DetectedLetter]
    count: int


@router.post('/detect', response_model=DetectionResult)
async def detect(
    file: UploadFile = File(...),
    target_h: Optional[float] = Form(None),
    target_s: Optional[float] = Form(None),
    target_v: Optional[float] = Form(None),
):
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail='Le fichier doit être une image')

    target_hsv = (target_h, target_s, target_v) if all(x is not None for x in (target_h, target_s, target_v)) else None

    image_bytes = await file.read()
    try:
        letters = detect_letters(image_bytes, target_hsv=target_hsv)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    return DetectionResult(letters=letters, count=len(letters))
