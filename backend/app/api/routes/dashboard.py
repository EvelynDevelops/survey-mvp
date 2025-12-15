"""Dashboard routes (requires authentication)."""

import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db import get_db
from app.db.orms.user import User
from app.db.orms.survey import Survey
from app.db.orms.response import Response
from app.core.deps import get_current_user
from app.schemas.dashboard import UserDashboardResponse, SurveyDashboardSummary

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("", response_model=UserDashboardResponse)
def get_user_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get dashboard summary for the current authenticated user.

    Returns all surveys owned by the user along with their stats:
    - total_submissions: Number of submitted responses
    - last_submitted_at: Timestamp of the most recent submission (null if no submissions)
    - slug: Survey slug for building public link (null if not published)

    Authentication required via Bearer token.
    """
    # Get all surveys owned by the current user
    surveys = db.query(Survey).filter(Survey.owner_id == current_user.id).all()

    # Build survey summaries with stats
    survey_summaries = []
    for survey in surveys:
        # Query aggregate stats for submitted responses
        stats = db.query(
            func.count(Response.id).label("total_submissions"),
            func.max(Response.submitted_at).label("last_submitted_at")
        ).filter(
            Response.survey_id == survey.id,
            Response.status == "submitted"
        ).first()

        survey_summaries.append(
            SurveyDashboardSummary(
                id=survey.id,
                title=survey.title,
                status=survey.status,
                slug=survey.slug,
                total_submissions=stats.total_submissions or 0,
                last_submitted_at=stats.last_submitted_at
            )
        )

    return UserDashboardResponse(
        user_id=current_user.id,
        surveys=survey_summaries
    )
