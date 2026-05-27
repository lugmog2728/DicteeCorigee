from datetime import datetime
from sqlalchemy import Integer, String, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class Correction(Base):
    __tablename__ = "corrections"

    id:               Mapped[int]       = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id:          Mapped[int]       = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    planification_id: Mapped[int|None]  = mapped_column(Integer, ForeignKey("planifications.id", ondelete="SET NULL"), nullable=True, index=True)
    dictee_id:        Mapped[int]       = mapped_column(Integer, ForeignKey("dictees.id", ondelete="CASCADE"), nullable=False)
    eleve_id:         Mapped[int|None]  = mapped_column(Integer, ForeignKey("eleves.id", ondelete="SET NULL"), nullable=True)
    student_name:     Mapped[str]       = mapped_column(String(200), nullable=False, default="")
    image_path:       Mapped[str|None]  = mapped_column(String(500), nullable=True)
    score:            Mapped[int]       = mapped_column(Integer, nullable=False)
    nb_errors:        Mapped[int]       = mapped_column(Integer, nullable=False, default=0)
    err_conjugaison:  Mapped[int]       = mapped_column(Integer, nullable=False, default=0)
    err_homophone:    Mapped[int]       = mapped_column(Integer, nullable=False, default=0)
    err_accord:       Mapped[int]       = mapped_column(Integer, nullable=False, default=0)
    err_majuscule:    Mapped[int]       = mapped_column(Integer, nullable=False, default=0)
    err_ponctuation:  Mapped[int]       = mapped_column(Integer, nullable=False, default=0)
    err_infinitif:    Mapped[int]       = mapped_column(Integer, nullable=False, default=0)
    err_orthographe:  Mapped[int]       = mapped_column(Integer, nullable=False, default=0)
    err_non_present:  Mapped[int]       = mapped_column(Integer, nullable=False, default=0)
    err_son:          Mapped[int]       = mapped_column(Integer, nullable=False, default=0)
    created_at:       Mapped[datetime]  = mapped_column(DateTime, server_default=func.now())
