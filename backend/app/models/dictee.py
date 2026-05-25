import enum
from datetime import datetime
from sqlalchemy import Integer, String, Text, DateTime, Enum, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class NiveauEnum(str, enum.Enum):
    CP  = "CP"
    CE1 = "CE1"
    CE2 = "CE2"
    CM1 = "CM1"
    CM2 = "CM2"


class PeriodeEnum(str, enum.Enum):
    P1 = "P1"
    P2 = "P2"
    P3 = "P3"
    P4 = "P4"
    P5 = "P5"


class TempsEnum(str, enum.Enum):
    present   = "Présent"
    imparfait = "Imparfait"
    passe     = "Passé"
    futur     = "Futur"


class Dictee(Base):
    __tablename__ = "dictees"

    id:          Mapped[int]         = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id:     Mapped[int | None]  = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    titre:       Mapped[str]         = mapped_column(String(255), nullable=False)
    niveau:      Mapped[NiveauEnum]  = mapped_column(Enum(NiveauEnum), nullable=False)
    periode:     Mapped[str]         = mapped_column(String(10), nullable=False)
    temps:       Mapped[str | None]  = mapped_column(String(50), nullable=True)
    tag:         Mapped[str | None]  = mapped_column(String(255), nullable=True)
    texte:       Mapped[str]         = mapped_column(Text, nullable=False)

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
