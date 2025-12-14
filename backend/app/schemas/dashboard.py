"""Dashboard schemas."""

import uuid
from datetime import datetime
from pydantic import BaseModel


class SurveyDashboardResponse(BaseModel):
    survey_id: uuid.UUID
    completed: int
    last_submission_at: datetime | None

    class Config:
        from_attributes = True
