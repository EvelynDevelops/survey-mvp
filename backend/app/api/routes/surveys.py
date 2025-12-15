"""Survey admin routes (requires authentication)."""

import uuid
import secrets
import string
import csv
import io
import re
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import func

from app.db import get_db
from app.db.orms.user import User
from app.db.orms.survey import Survey
from app.db.orms.question import Question
from app.db.orms.response import Response
from app.db.orms.answer import Answer
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


def slugify_title(title: str) -> str:
    """
    Convert survey title to a safe filename slug.
    - Lowercase
    - Replace spaces with underscores
    - Remove special characters (keep only alphanumeric and underscores)
    """
    slug = title.lower()
    slug = re.sub(r'\s+', '_', slug)  # Replace whitespace with underscores
    slug = re.sub(r'[^a-z0-9_]', '', slug)  # Remove special characters
    return slug or 'survey'  # Fallback if title becomes empty


def extract_answer_value(answer_json: dict, question_type: str) -> str:
    """
    Extract the answer value from answer_json based on question type.

    Returns:
    - text: answer_json["text"]
    - single: answer_json["value"]
    - multi: join answer_json["values"] with "|"
    - image: join answer_json["files"] with "|"
    - empty string if data is missing
    """
    if not answer_json:
        return ""

    if question_type == "text":
        return str(answer_json.get("text", ""))
    elif question_type == "single":
        return str(answer_json.get("value", ""))
    elif question_type == "multi":
        values = answer_json.get("values", [])
        return "|".join(str(v) for v in values) if values else ""
    elif question_type == "image":
        files = answer_json.get("files", [])
        return "|".join(str(f) for f in files) if files else ""

    return ""


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

    Returns:
    - total_submissions: Number of submitted responses
    - last_submitted_at: Timestamp of the most recent submission (null if no submissions)
    - slug: Survey slug for building public link (null if not published)

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
        func.count(Response.id).label("total_submissions"),
        func.max(Response.submitted_at).label("last_submitted_at")
    ).filter(
        Response.survey_id == survey_id,
        Response.status == "submitted"
    ).first()

    return SurveyDashboardResponse(
        survey_id=survey_id,
        slug=survey.slug,
        total_submissions=stats.total_submissions or 0,
        last_submitted_at=stats.last_submitted_at
    )


@router.get("/{survey_id}/responses/export")
def export_survey_responses(
    survey_id: uuid.UUID,
    format: str = "csv",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Export survey responses as CSV.

    Only the survey owner can export responses.
    Only submitted responses are included.

    Query Parameters:
    - format: Export format (currently only "csv" is supported)

    Returns:
    - CSV file with response_id, submitted_at, and one column per question
    """
    # Validate format
    if format != "csv":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only CSV format is currently supported"
        )

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
            detail="Not authorized to export this survey's responses"
        )

    # Get all questions ordered by position
    questions = (
        db.query(Question)
        .filter(Question.survey_id == survey_id)
        .order_by(Question.position)
        .all()
    )

    # Get all submitted responses with their answers
    responses = (
        db.query(Response)
        .filter(
            Response.survey_id == survey_id,
            Response.status == "submitted"
        )
        .order_by(Response.submitted_at)
        .all()
    )

    # Build CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)

    # Write header row
    header = ["response_id", "submitted_at"]
    for question in questions:
        header.append(question.title)
    writer.writerow(header)

    # Write data rows
    for response in responses:
        # Create a map of question_id -> answer for this response
        answer_map = {}
        for answer in response.answers:
            answer_map[answer.question_id] = answer

        row = [
            str(response.id),
            response.submitted_at.isoformat() if response.submitted_at else ""
        ]

        # Add answer for each question (in position order)
        for question in questions:
            answer = answer_map.get(question.id)
            if answer:
                value = extract_answer_value(answer.answer_json, question.type)
                row.append(value)
            else:
                row.append("")  # Missing answer

        writer.writerow(row)

    # Prepare filename
    title_slug = slugify_title(survey.title)
    today = datetime.now().strftime("%Y-%m-%d")
    filename = f"survey_{title_slug}_{today}.csv"

    # Return CSV as streaming response
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )
