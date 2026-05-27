from datetime import date, datetime
from typing import Literal
from pydantic import BaseModel

Statut = Literal["planifiee", "en_cours", "terminee"]


class PlanificationCreate(BaseModel):
    classe_id:         int
    dictee_id:         int
    date_prevue:       date
    types_neutralises: list[str] = []


class PlanificationUpdate(BaseModel):
    date_prevue:       date | None = None
    nb_corriges:       int | None = None
    types_neutralises: list[str] | None = None


class PlanificationRead(BaseModel):
    id:                int
    user_id:           int
    classe_id:         int
    dictee_id:         int
    date_prevue:       date
    nb_corriges:       int
    types_neutralises: list[str]
    created_at:        datetime
    updated_at:        datetime

    model_config = {"from_attributes": True}


class PlanificationDetail(BaseModel):
    id:                int
    date_prevue:       date
    nb_corriges:       int
    statut:            Statut
    types_neutralises: list[str]
    dictee_id:         int
    dictee_titre:      str
    dictee_tag:        str | None
    dictee_niveau:     str
    dictee_temps:      str | None
    classe_id:         int
    classe_nom:        str
    classe_niveau:     str
    nb_eleves:         int


class PlanificationStats(BaseModel):
    cette_semaine:   int
    en_attente:      int
    classes_actives: int
    taux_completion: float
