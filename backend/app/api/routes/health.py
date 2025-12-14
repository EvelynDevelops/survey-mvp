"""
Health check routes demonstrating database dependency injection.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.db import get_db

router = APIRouter(prefix="/health", tags=["health"])


@router.get("")
async def health_check():
    """Basic health check without database."""
    return {"status": "healthy"}


@router.get("/db")
async def health_check_db(db: Session = Depends(get_db)):
    """
    Health check with database connection test.

    Demonstrates:
    - Using Depends(get_db) to inject a database session
    - The session is automatically closed after the request
    - Executing a simple SQL query to verify connectivity
    """
    try:
        # Execute a simple query to verify database connection
        result = db.execute(text("SELECT 1 as health_check"))
        row = result.fetchone()

        return {
            "status": "healthy",
            "database": "connected",
            "check": row[0] if row else None
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }
