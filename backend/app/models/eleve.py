from datetime import datetime
from sqlalchemy import Integer, String, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class Eleve(Base):
    __tablename__ = "eleves"

    id:         Mapped[int]      = mapped_column(Integer, primary_key=True, autoincrement=True)
    classe_id:  Mapped[int]      = mapped_column(Integer, ForeignKey("classes.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id:    Mapped[int]      = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    prenom:     Mapped[str]      = mapped_column(String(100), nullable=False)
    initiale:   Mapped[str]      = mapped_column(String(5), nullable=False)
    dispositif: Mapped[str|None] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
