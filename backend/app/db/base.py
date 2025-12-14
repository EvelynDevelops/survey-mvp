"""
SQLAlchemy declarative base.

Import all models here to make them available for Alembic auto-generation.
"""

from sqlalchemy.orm import declarative_base

# Create the declarative base
Base = declarative_base()

# Import all models for Alembic auto-generation and table creation
from app.db.orms.user import User  # noqa: F401, E402
from app.db.orms.survey import Survey  # noqa: F401, E402
from app.db.orms.question import Question  # noqa: F401, E402
from app.db.orms.response import Response  # noqa: F401, E402
from app.db.orms.answer import Answer  # noqa: F401, E402
