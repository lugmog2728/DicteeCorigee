from datetime import datetime
from pydantic import BaseModel


class EleveCreate(BaseModel):
    classe_id:  int
    prenom:     str
    initiale:   str
    dispositif: str | None = None


class EleveBatchCreate(BaseModel):
    eleves: list[EleveCreate]


class EleveRead(BaseModel):
    id:         int
    classe_id:  int
    user_id:    int
    prenom:     str
    initiale:   str
    dispositif: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
