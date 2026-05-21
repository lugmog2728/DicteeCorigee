from fastapi import APIRouter, UploadFile, File, HTTPException
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
async def detect(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail='Le fichier doit être une image')

    image_bytes = await file.read()
    try:
        letters = detect_letters(image_bytes)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    return DetectionResult(letters=letters, count=len(letters))
