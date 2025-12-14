"""Survey admin routes (requires authentication)."""

import uuid
import secrets
import string
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import func

from app.db import get_db
from app.db.orms.user import User
from app.db.orms.survey import Survey
from app.db.orms.question import Question
from app.db.orms.response import Response
from app.core.deps import get_current_user
from app.schemas.survey import (
    CreateSurveyRequest,
    SurveyResponse,
    CreateQuestionRequest,
    QuestionResponse,
    PublishSurveyResponse,
)
from app.schemas.dashboard import SurveyDashboardResponse

router = APIRouter(prefix="/surveys", tags=["surveys"])


def generate_slug(length: int = 8) -> str:
    """Generate a random alphanumeric slug."""
    chars = string.ascii_lowercase + string.digits
    return ''.join(secrets.choice(chars) for _ in range(length))


@router.post("", response_model=SurveyResponse, status_code=status.HTTP_201_CREATED)
def create_survey(
    request: CreateSurveyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new draft survey owned by the current user.
    """
    survey = Survey(
        owner_id=current_user.id,
        title=request.title,
        description=request.description,
        status="draft"
    )

    db.add(survey)
    db.commit()
    db.refresh(survey)

    return survey


@router.post("/{survey_id}/questions", response_model=QuestionResponse, status_code=status.HTTP_201_CREATED)
def create_question(
    survey_id: uuid.UUID,
    request: CreateQuestionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add a question to a survey. Only the survey owner can add questions.
    """
    # Get survey and verify ownership
    survey = db.query(Survey).filter(Survey.id == survey_id).first()
    if not survey:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Survey not found"
        )

    if survey.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this survey"
        )

    # Validate question type
    valid_types = {"single", "multi", "text", "image"}
    if request.type not in valid_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid question type. Must be one of: {valid_types}"
        )

    # Build options_json based on type
    options_json = None
    if request.type in {"single", "multi"}:
        if not request.options:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Question type '{request.type}' requires options"
            )
        options_json = {"options": request.options}

    # Create question
    question = Question(
        survey_id=survey_id,
        type=request.type,
        title=request.title,
        required=request.required,
        position=request.position,
        options_json=options_json,
        max_images=request.max_images if request.type == "image" else None
    )

    db.add(question)
    db.commit()
    db.refresh(question)

    return question


@router.post("/{survey_id}/publish", response_model=PublishSurveyResponse)
def publish_survey(
    survey_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Publish a survey. Only the survey owner can publish.
    Generates a unique slug and sets status to 'published'.
    """
    # Get survey and verify ownership
    survey = db.query(Survey).filter(Survey.id == survey_id).first()
    if not survey:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Survey not found"
        )

    if survey.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to publish this survey"
        )

    if survey.status == "published":
        # Already published, return existing slug
        return PublishSurveyResponse(
            id=survey.id,
            status=survey.status,
            slug=survey.slug
        )

    # Generate unique slug with retry logic
    max_retries = 10
    for attempt in range(max_retries):
        slug = generate_slug()
        survey.slug = slug
        survey.status = "published"

        try:
            db.commit()
            db.refresh(survey)
            return PublishSurveyResponse(
                id=survey.id,
                status=survey.status,
                slug=survey.slug
            )
        except IntegrityError:
            db.rollback()
            if attempt == max_retries - 1:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to generate unique slug after multiple attempts"
                )
            continue

    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Failed to publish survey"
    )


@router.get("/{survey_id}/dashboard", response_model=SurveyDashboardResponse)
def get_survey_dashboard(
    survey_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get dashboard summary for a survey.

    Returns completed response count and last submission time.
    Only the survey owner can view dashboard stats.
    """
    # Get survey and verify ownership
    survey = db.query(Survey).filter(Survey.id == survey_id).first()
    if not survey:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Survey not found"
        )

    if survey.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this survey's dashboard"
        )

    # Query aggregate stats for submitted responses
    stats = db.query(
        func.count(Response.id).label("completed"),
        func.max(Response.submitted_at).label("last_submission_at")
    ).filter(
        Response.survey_id == survey_id,
        Response.status == "submitted"
    ).first()

    return SurveyDashboardResponse(
        survey_id=survey_id,
        completed=stats.completed or 0,
        last_submission_at=stats.last_submission_at
    )
