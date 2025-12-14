"""Answer ORM model."""

import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Any

from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB

from app.db.base import Base

if TYPE_CHECKING:
    from app.db.orms.response import Response
    from app.db.orms.question import Question


class Answer(Base):
    __tablename__ = "answers"
    __table_args__ = (
        UniqueConstraint("response_id", "question_id", name="uq_response_question"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    response_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("responses.id"), nullable=False
    )
    question_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("questions.id"), nullable=False
    )
    answer_json: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    response: Mapped["Response"] = relationship("Response", back_populates="answers")
    question: Mapped["Question"] = relationship("Question", back_populates="answers")
