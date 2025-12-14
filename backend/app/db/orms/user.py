"""User ORM model."""

import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base

if TYPE_CHECKING:
    from app.db.orms.survey import Survey


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    email: Mapped[str] = mapped_column(
        String, unique=True, index=True, nullable=False
    )
    password_hash: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    surveys: Mapped[list["Survey"]] = relationship(
        "Survey", back_populates="owner", cascade="all, delete-orphan"
    )
