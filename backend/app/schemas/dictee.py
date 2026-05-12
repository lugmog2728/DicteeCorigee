from datetime import datetime
from pydantic import BaseModel, Field
from app.models.dictee import NiveauEnum, PeriodeEnum


class ErrorCounts(BaseModel):
    conjugaison: int = 0
    homophone:   int = 0
    accord:      int = 0
    majuscule:   int = 0
    ponctuation: int = 0
    infinitif:   int = 0
    orthographe: int = 0
    non_present: int = Field(0, alias="nonPresent")
    son:         int = 0

    model_config = {"populate_by_name": True}


class DicteeCreate(BaseModel):
    titre:       str
    niveau:      NiveauEnum
    periode:     PeriodeEnum
    tag:         str | None = None
    duree:       int = 15
    description: str | None = None
    texte:       str
    errors:      ErrorCounts = Field(default_factory=ErrorCounts)


class DicteeUpdate(BaseModel):
    titre:       str | None = None
    niveau:      NiveauEnum | None = None
    periode:     PeriodeEnum | None = None
    tag:         str | None = None
    duree:       int | None = None
    description: str | None = None
    texte:       str | None = None
    errors:      ErrorCounts | None = None


class DicteeRead(BaseModel):
    id:          int
    titre:       str
    niveau:      NiveauEnum
    periode:     PeriodeEnum
    tag:         str | None
    duree:       int
    description: str | None
    texte:       str
    errors:      ErrorCounts
    created_at:  datetime
    updated_at:  datetime

    model_config = {"from_attributes": True}

    @classmethod
    def from_orm_with_errors(cls, obj) -> "DicteeRead":
        errors = ErrorCounts(
            conjugaison=obj.err_conjugaison,
            homophone=obj.err_homophone,
            accord=obj.err_accord,
            majuscule=obj.err_majuscule,
            ponctuation=obj.err_ponctuation,
            infinitif=obj.err_infinitif,
            orthographe=obj.err_orthographe,
            nonPresent=obj.err_non_present,
            son=obj.err_son,
        )
        return cls(
            id=obj.id,
            titre=obj.titre,
            niveau=obj.niveau,
            periode=obj.periode,
            tag=obj.tag,
            duree=obj.duree,
            description=obj.description,
            texte=obj.texte,
            errors=errors,
            created_at=obj.created_at,
            updated_at=obj.updated_at,
        )
