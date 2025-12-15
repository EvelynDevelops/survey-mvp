"""Response and Answer schemas."""

import uuid
from datetime import datetime
from typing import Any
from pydantic import BaseModel, Field


# Request schemas
class CreateResponseRequest(BaseModel):
    respondent_key: uuid.UUID | None = None


class AnswerInput(BaseModel):
    question_id: uuid.UUID
    answer: dict[str, Any] = Field(..., description="Answer data: {value/values/text/files}")


class SubmitAnswersRequest(BaseModel):
    answers: list[AnswerInput]


class ResumeResponseRequest(BaseModel):
    respondent_key: uuid.UUID | None = None


# Response schemas
class CreateResponseResponse(BaseModel):
    response_id: uuid.UUID
    respondent_key: uuid.UUID


class SubmitAnswersResponse(BaseModel):
    updated: int


class SubmitResponseResponse(BaseModel):
    response_id: uuid.UUID
    status: str
    submitted_at: datetime

    class Config:
        from_attributes = True


class AnswerData(BaseModel):
    """Single answer data for a question."""
    question_id: uuid.UUID
    answer_json: dict[str, Any]

    class Config:
        from_attributes = True


class GetResponseResponse(BaseModel):
    """Full response data including all answers."""
    response_id: uuid.UUID
    survey_id: uuid.UUID
    status: str
    respondent_key: uuid.UUID
    started_at: datetime
    submitted_at: datetime | None
    answers: list[AnswerData]

    class Config:
        from_attributes = True


class ResumeResponseResponse(BaseModel):
    """Response for resume endpoint - returns existing or new response."""
    response_id: uuid.UUID
    respondent_key: uuid.UUID
    status: str
    is_new: bool = Field(..., description="True if a new response was created, False if existing was returned")

    class Config:
        from_attributes = True
