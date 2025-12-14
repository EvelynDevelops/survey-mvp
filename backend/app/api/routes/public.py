"""Public survey routes (no authentication required)."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db import get_db
from app.db.orms.survey import Survey
from app.schemas.survey import PublicSurveyResponse, PublicQuestionResponse

router = APIRouter(prefix="/public", tags=["public"])


@router.get("/surveys/{slug}", response_model=PublicSurveyResponse)
def get_survey_by_slug(slug: str, db: Session = Depends(get_db)):
    """
    Get a published survey by its slug.

    Returns survey metadata and questions ordered by position.
    Returns 404 if survey not found or not published.
    """
    survey = db.query(Survey).filter(
        Survey.slug == slug,
        Survey.status == "published"
    ).first()

    if not survey:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Survey not found"
        )

    # Get questions ordered by position
    questions = sorted(survey.questions, key=lambda q: q.position)

    # Build response
    return PublicSurveyResponse(
        id=survey.id,
        title=survey.title,
        description=survey.description,
        questions=[
            PublicQuestionResponse(
                id=q.id,
                type=q.type,
                title=q.title,
                required=q.required,
                position=q.position,
                options_json=q.options_json,
                max_images=q.max_images
            )
            for q in questions
        ]
    )
