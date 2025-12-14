"""Response ORM model."""

import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base

if TYPE_CHECKING:
    from app.db.orms.survey import Survey
    from app.db.orms.answer import Answer


class Response(Base):
    __tablename__ = "responses"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    survey_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("surveys.id"), nullable=False
    )
    status: Mapped[str] = mapped_column(
        String, nullable=False, default="in_progress"
    )
    respondent_key: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), nullable=True
    )
    started_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(timezone.utc)
    )
    submitted_at: Mapped[datetime | None] = mapped_column(nullable=True)

    # Relationships
    survey: Mapped["Survey"] = relationship("Survey", back_populates="responses")
    answers: Mapped[list["Answer"]] = relationship(
        "Answer", back_populates="response", cascade="all, delete-orphan"
    )
