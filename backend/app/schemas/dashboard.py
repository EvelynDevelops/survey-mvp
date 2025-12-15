"""Dashboard schemas."""

import uuid
from datetime import datetime
from pydantic import BaseModel


class SurveyDashboardResponse(BaseModel):
    survey_id: uuid.UUID
    slug: str | None
    total_submissions: int
    last_submitted_at: datetime | None

    class Config:
        from_attributes = True
