"""Dashboard schemas."""

import uuid
from datetime import datetime
from pydantic import BaseModel


class SurveyDashboardResponse(BaseModel):
    """Response for individual survey dashboard stats."""
    survey_id: uuid.UUID
    slug: str | None
    total_submissions: int
    last_submitted_at: datetime | None

    class Config:
        from_attributes = True


class SurveyDashboardSummary(BaseModel):
    """Summary of a survey for the user dashboard."""
    id: uuid.UUID
    title: str
    status: str
    slug: str | None
    total_submissions: int
    last_submitted_at: datetime | None

    class Config:
        from_attributes = True


class UserDashboardResponse(BaseModel):
    """Response for user dashboard with all surveys."""
    user_id: uuid.UUID
    surveys: list[SurveyDashboardSummary]

    class Config:
        from_attributes = True
