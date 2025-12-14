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
