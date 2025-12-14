"""Public survey routes (no authentication required)."""

import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.db import get_db
from app.db.orms.survey import Survey
from app.db.orms.question import Question
from app.db.orms.response import Response
from app.db.orms.answer import Answer
from app.schemas.survey import PublicSurveyResponse, PublicQuestionResponse
from app.schemas.response import (
    CreateResponseRequest,
    CreateResponseResponse,
    SubmitAnswersRequest,
    SubmitAnswersResponse,
    SubmitResponseResponse,
)

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


@router.post("/surveys/{slug}/responses", response_model=CreateResponseResponse, status_code=status.HTTP_201_CREATED)
def create_response(
    slug: str,
    request: CreateResponseRequest,
    db: Session = Depends(get_db)
):
    """
    Create a new response for a published survey.

    Generates a respondent_key if not provided.
    Returns response_id and respondent_key.
    """
    # Verify survey exists and is published
    survey = db.query(Survey).filter(
        Survey.slug == slug,
        Survey.status == "published"
    ).first()

    if not survey:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Survey not found"
        )

    # Generate respondent_key if not provided
    respondent_key = request.respondent_key or uuid.uuid4()

    # Create response
    response = Response(
        survey_id=survey.id,
        status="in_progress",
        respondent_key=respondent_key,
        started_at=datetime.now(timezone.utc)
    )

    db.add(response)
    db.commit()
    db.refresh(response)

    return CreateResponseResponse(
        response_id=response.id,
        respondent_key=response.respondent_key
    )


@router.put("/responses/{response_id}/answers", response_model=SubmitAnswersResponse)
def submit_answers(
    response_id: uuid.UUID,
    request: SubmitAnswersRequest,
    db: Session = Depends(get_db)
):
    """
    Upsert answers for multiple questions.

    Validates question types and options.
    Updates existing answers or creates new ones.
    """
    # Verify response exists
    response = db.query(Response).filter(Response.id == response_id).first()
    if not response:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Response not found"
        )

    # Get survey for validation
    survey = db.query(Survey).filter(Survey.id == response.survey_id).first()
    if not survey:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Survey not found"
        )

    # Get all questions for this survey
    question_map = {q.id: q for q in survey.questions}

    updated_count = 0

    for answer_input in request.answers:
        # Validate question exists and belongs to this survey
        question = question_map.get(answer_input.question_id)
        if not question:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Question {answer_input.question_id} not found in this survey"
            )

        # Validate answer based on question type
        _validate_answer(question, answer_input.answer)

        # Check if answer already exists
        existing_answer = db.query(Answer).filter(
            Answer.response_id == response_id,
            Answer.question_id == answer_input.question_id
        ).first()

        if existing_answer:
            # Update existing answer
            existing_answer.answer_json = answer_input.answer
            updated_count += 1
        else:
            # Create new answer
            new_answer = Answer(
                response_id=response_id,
                question_id=answer_input.question_id,
                answer_json=answer_input.answer
            )
            db.add(new_answer)
            updated_count += 1

    db.commit()

    return SubmitAnswersResponse(updated=updated_count)


@router.post("/responses/{response_id}/submit", response_model=SubmitResponseResponse)
def submit_response(
    response_id: uuid.UUID,
    db: Session = Depends(get_db)
):
    """
    Submit a response.

    Validates all required questions have answers.
    Sets status to 'submitted' and records submission time.
    """
    # Verify response exists
    response = db.query(Response).filter(Response.id == response_id).first()
    if not response:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Response not found"
        )

    # Get survey and questions
    survey = db.query(Survey).filter(Survey.id == response.survey_id).first()
    if not survey:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Survey not found"
        )

    # Get all required questions
    required_questions = [q for q in survey.questions if q.required]

    # Get all answered question IDs for this response
    answered_question_ids = {
        answer.question_id
        for answer in db.query(Answer).filter(Answer.response_id == response_id).all()
    }

    # Check all required questions are answered
    missing_questions = []
    for question in required_questions:
        if question.id not in answered_question_ids:
            missing_questions.append(str(question.id))

    if missing_questions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Missing required questions: {', '.join(missing_questions)}"
        )

    # Mark as submitted
    response.status = "submitted"
    response.submitted_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(response)

    return SubmitResponseResponse(
        response_id=response.id,
        status=response.status,
        submitted_at=response.submitted_at
    )


def _validate_answer(question: Question, answer: dict):
    """Validate answer format based on question type."""
    question_type = question.type

    if question_type == "single":
        # Validate single choice: answer.value must be in options
        if "value" not in answer:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Single choice question requires 'value' field"
            )

        options = question.options_json.get("options", []) if question.options_json else []
        if answer["value"] not in options:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Value '{answer['value']}' not in valid options"
            )

    elif question_type == "multi":
        # Validate multi choice: answer.values must be subset of options
        if "values" not in answer:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Multi choice question requires 'values' field"
            )

        if not isinstance(answer["values"], list):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Multi choice 'values' must be a list"
            )

        options = question.options_json.get("options", []) if question.options_json else []
        for value in answer["values"]:
            if value not in options:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Value '{value}' not in valid options"
                )

    elif question_type == "text":
        # Validate text: answer.text must be string
        if "text" not in answer:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Text question requires 'text' field"
            )

        if not isinstance(answer["text"], str):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Text answer must be a string"
            )

    elif question_type == "image":
        # Validate image: answer.files must be list of strings
        if "files" not in answer:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Image question requires 'files' field"
            )

        if not isinstance(answer["files"], list):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Image 'files' must be a list"
            )

        for file_key in answer["files"]:
            if not isinstance(file_key, str):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Each file must be a string (storage key)"
                )
