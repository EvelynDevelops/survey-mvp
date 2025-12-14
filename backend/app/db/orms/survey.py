"""Survey ORM model."""

import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import String, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base

if TYPE_CHECKING:
    from app.db.orms.user import User
    from app.db.orms.question import Question
    from app.db.orms.response import Response


class Survey(Base):
    __tablename__ = "surveys"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    owner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String, nullable=False, default="draft")
    slug: Mapped[str | None] = mapped_column(String, unique=True, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    owner: Mapped["User"] = relationship("User", back_populates="surveys")
    questions: Mapped[list["Question"]] = relationship(
        "Question", back_populates="survey", cascade="all, delete-orphan"
    )
    responses: Mapped[list["Response"]] = relationship(
        "Response", back_populates="survey", cascade="all, delete-orphan"
    )
