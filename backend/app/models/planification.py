from datetime import date, datetime
from sqlalchemy import Integer, Date, ForeignKey, DateTime, Text, func
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class Planification(Base):
    __tablename__ = "planifications"

    id:                 Mapped[int]      = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id:            Mapped[int]      = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    classe_id:          Mapped[int]      = mapped_column(Integer, ForeignKey("classes.id", ondelete="CASCADE"), nullable=False, index=True)
    dictee_id:          Mapped[int]      = mapped_column(Integer, ForeignKey("dictees.id", ondelete="CASCADE"), nullable=False, index=True)
    date_prevue:        Mapped[date]     = mapped_column(Date, nullable=False)
    nb_corriges:        Mapped[int]      = mapped_column(Integer, nullable=False, default=0)
    types_neutralises:  Mapped[str]      = mapped_column(Text, nullable=False, default="[]")
    created_at:         Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at:         Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
