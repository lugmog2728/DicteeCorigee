import enum
from datetime import datetime
from sqlalchemy import Integer, String, Text, DateTime, Enum, func
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class NiveauEnum(str, enum.Enum):
    CP  = "CP"
    CE1 = "CE1"
    CE2 = "CE2"
    CM1 = "CM1"
    CM2 = "CM2"


class PeriodeEnum(str, enum.Enum):
    present = "Présent"
    passe   = "Passé"
    futur   = "Futur"


class Dictee(Base):
    __tablename__ = "dictees"

    id:          Mapped[int]      = mapped_column(Integer, primary_key=True, autoincrement=True)
    titre:       Mapped[str]      = mapped_column(String(255), nullable=False)
    niveau:      Mapped[NiveauEnum]  = mapped_column(Enum(NiveauEnum), nullable=False)
    periode:     Mapped[PeriodeEnum] = mapped_column(Enum(PeriodeEnum), nullable=False)
    tag:         Mapped[str | None]  = mapped_column(String(255), nullable=True)
    duree:       Mapped[int]      = mapped_column(Integer, nullable=False, default=15)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    texte:       Mapped[str]      = mapped_column(Text, nullable=False)

    # Compteurs d'erreurs
    err_conjugaison:  Mapped[int] = mapped_column(Integer, default=0)
    err_homophone:    Mapped[int] = mapped_column(Integer, default=0)
    err_accord:       Mapped[int] = mapped_column(Integer, default=0)
    err_majuscule:    Mapped[int] = mapped_column(Integer, default=0)
    err_ponctuation:  Mapped[int] = mapped_column(Integer, default=0)
    err_infinitif:    Mapped[int] = mapped_column(Integer, default=0)
    err_orthographe:  Mapped[int] = mapped_column(Integer, default=0)
    err_non_present:  Mapped[int] = mapped_column(Integer, default=0)
    err_son:          Mapped[int] = mapped_column(Integer, default=0)

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
