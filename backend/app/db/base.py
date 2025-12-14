"""
SQLAlchemy declarative base.

Import all models here to make them available for Alembic auto-generation.
Example:
    from app.models.user import User
    from app.models.survey import Survey
"""

from sqlalchemy.orm import declarative_base

# Create the declarative base
Base = declarative_base()

# Import all models here for Alembic
# from app.models import ...
