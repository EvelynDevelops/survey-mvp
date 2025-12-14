"""Survey and Question schemas."""

import uuid
from typing import Any
from pydantic import BaseModel, Field


# Survey schemas
class CreateSurveyRequest(BaseModel):
    title: str
    description: str | None = None


class SurveyResponse(BaseModel):
    id: uuid.UUID
    title: str
    description: str | None
    status: str
    slug: str | None = None

    class Config:
        from_attributes = True


class PublishSurveyResponse(BaseModel):
    id: uuid.UUID
    status: str
    slug: str

    class Config:
        from_attributes = True


# Question schemas
class CreateQuestionRequest(BaseModel):
    type: str = Field(..., description="single, multi, text, or image")
    title: str
    required: bool = False
    position: int
    options: list[str] | None = None  # For single/multi
    max_images: int | None = None  # For image type


class QuestionResponse(BaseModel):
    id: uuid.UUID
    survey_id: uuid.UUID
    type: str
    title: str
    required: bool
    position: int
    options_json: dict[str, Any] | None
    max_images: int | None

    class Config:
        from_attributes = True


# Public survey response
class PublicQuestionResponse(BaseModel):
    id: uuid.UUID
    type: str
    title: str
    required: bool
    position: int
    options_json: dict[str, Any] | None
    max_images: int | None

    class Config:
        from_attributes = True


class PublicSurveyResponse(BaseModel):
    id: uuid.UUID
    title: str
    description: str | None
    questions: list[PublicQuestionResponse]

    class Config:
        from_attributes = True
