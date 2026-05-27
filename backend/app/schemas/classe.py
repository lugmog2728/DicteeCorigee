from datetime import datetime
from pydantic import BaseModel
from app.models.dictee import NiveauEnum


class ClasseCreate(BaseModel):
    nom:            str
    niveau:         NiveauEnum
    annee_scolaire: str = "2025-2026"


class ClasseUpdate(BaseModel):
    nom:            str | None = None
    niveau:         NiveauEnum | None = None
    annee_scolaire: str | None = None
    nb_eleves:      int | None = None


class ClasseRead(BaseModel):
    id:             int
    user_id:        int
    nom:            str
    niveau:         NiveauEnum
    annee_scolaire: str
    nb_eleves:      int
    moyenne:        float | None = None
    created_at:     datetime
    updated_at:     datetime

    model_config = {"from_attributes": True}
