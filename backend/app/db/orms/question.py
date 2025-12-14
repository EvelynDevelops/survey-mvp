"""Question ORM model."""

import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Any

from sqlalchemy import String, Text, Boolean, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB

from app.db.base import Base

if TYPE_CHECKING:
    from app.db.orms.survey import Survey
    from app.db.orms.answer import Answer


class Question(Base):
    __tablename__ = "questions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    survey_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("surveys.id"), nullable=False
    )
    type: Mapped[str] = mapped_column(String, nullable=False)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    required: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False)
    options_json: Mapped[dict[str, Any] | None] = mapped_column(
        JSONB, nullable=True
    )
    max_images: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    survey: Mapped["Survey"] = relationship("Survey", back_populates="questions")
    answers: Mapped[list["Answer"]] = relationship(
        "Answer", back_populates="question", cascade="all, delete-orphan"
    )
