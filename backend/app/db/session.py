"""
Database session management.

Creates a single global engine and SessionLocal factory.
Provides get_db() dependency for FastAPI route injection.
"""

import os
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

# Read DATABASE_URL from environment
DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql+psycopg://survey:survey@localhost:5432/survey_mvp"
)

# Create a single engine with connection pooling
engine = create_engine(
    DATABASE_URL,
    pool_size=5,
    max_overflow=20,
    pool_recycle=1000,
    pool_timeout=30,
    echo=False,  # Set to True for SQL query logging
)

# Create SessionLocal class for generating sessions
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that provides a database session.

    Usage:
        @app.get("/items")
        def read_items(db: Session = Depends(get_db)):
            items = db.query(Item).all()
            return items

    The session is automatically closed after the request completes.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
