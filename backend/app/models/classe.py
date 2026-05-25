from datetime import datetime
from sqlalchemy import Integer, String, DateTime, Enum, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base
from app.models.dictee import NiveauEnum


class Classe(Base):
    __tablename__ = "classes"

    id:             Mapped[int]         = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id:        Mapped[int]         = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    nom:            Mapped[str]         = mapped_column(String(100), nullable=False)
    niveau:         Mapped[NiveauEnum]  = mapped_column(Enum(NiveauEnum), nullable=False)
    annee_scolaire: Mapped[str]         = mapped_column(String(9), nullable=False, default="2025-2026")
    nb_eleves:      Mapped[int]         = mapped_column(Integer, nullable=False, default=0)
    created_at:     Mapped[datetime]    = mapped_column(DateTime, server_default=func.now())
    updated_at:     Mapped[datetime]    = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
