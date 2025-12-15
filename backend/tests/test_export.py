"""Tests for survey response export endpoint."""

import csv
import io
from datetime import datetime, timezone, timedelta
import pytest


def test_export_responses_owner_can_export(authenticated_client, test_db):
    """Test that survey owner can export submitted responses as CSV."""
    from app.db.orms.response import Response
    from app.db.orms.answer import Answer
    from tests.conftest import TestingSessionLocal

    # Create and publish survey
    survey_response = authenticated_client.post(
        "/surveys",
        json={"title": "Customer Feedback Survey", "description": "Please share your thoughts"}
    )
    survey_id = survey_response.json()["id"]

    # Add questions
    q1_response = authenticated_client.post(
        f"/surveys/{survey_id}/questions",
        json={
            "type": "text",
            "title": "What is your name?",
            "required": True,
            "position": 1
        }
    )
    q1_id = q1_response.json()["id"]

    q2_response = authenticated_client.post(
        f"/surveys/{survey_id}/questions",
        json={
            "type": "single",
            "title": "How satisfied are you?",
            "required": False,
            "position": 2,
            "options": ["Very Satisfied", "Satisfied", "Neutral"]
        }
    )
    q2_id = q2_response.json()["id"]

    q3_response = authenticated_client.post(
        f"/surveys/{survey_id}/questions",
        json={
            "type": "multi",
            "title": "Select features you use",
            "required": False,
            "position": 3,
            "options": ["Feature A", "Feature B", "Feature C"]
        }
    )
    q3_id = q3_response.json()["id"]

    authenticated_client.post(f"/surveys/{survey_id}/publish")

    # Create submitted responses with answers
    db = TestingSessionLocal()
    try:
        now = datetime.now(timezone.utc)

        # Response 1: All questions answered
        response1 = Response(
            survey_id=survey_id,
            status="submitted",
            submitted_at=now - timedelta(hours=2)
        )
        db.add(response1)
        db.flush()

        db.add(Answer(
            response_id=response1.id,
            question_id=q1_id,
            answer_json={"text": "John Doe"}
        ))
        db.add(Answer(
            response_id=response1.id,
            question_id=q2_id,
            answer_json={"value": "Very Satisfied"}
        ))
        db.add(Answer(
            response_id=response1.id,
            question_id=q3_id,
            answer_json={"values": ["Feature A", "Feature B"]}
        ))

        # Response 2: Only some questions answered
        response2 = Response(
            survey_id=survey_id,
            status="submitted",
            submitted_at=now - timedelta(hours=1)
        )
        db.add(response2)
        db.flush()

        db.add(Answer(
            response_id=response2.id,
            question_id=q1_id,
            answer_json={"text": "Jane Smith"}
        ))
        # q2 not answered
        db.add(Answer(
            response_id=response2.id,
            question_id=q3_id,
            answer_json={"values": ["Feature C"]}
        ))

        # Response 3: In progress (should NOT be exported)
        response3 = Response(
            survey_id=survey_id,
            status="in_progress",
            submitted_at=None
        )
        db.add(response3)
        db.flush()

        db.add(Answer(
            response_id=response3.id,
            question_id=q1_id,
            answer_json={"text": "Should Not Appear"}
        ))

        db.commit()
    finally:
        db.close()

    # Export CSV
    response = authenticated_client.get(f"/surveys/{survey_id}/responses/export?format=csv")

    assert response.status_code == 200
    assert response.headers["content-type"] == "text/csv; charset=utf-8"
    assert "attachment" in response.headers["content-disposition"]
    assert "survey_customer_feedback_survey_" in response.headers["content-disposition"]
    assert ".csv" in response.headers["content-disposition"]

    # Parse CSV content
    csv_content = response.text
    reader = csv.reader(io.StringIO(csv_content))
    rows = list(reader)

    # Check header
    assert len(rows) >= 3  # Header + 2 submitted responses
    assert rows[0] == [
        "response_id",
        "submitted_at",
        "What is your name?",
        "How satisfied are you?",
        "Select features you use"
    ]

    # Check data rows (only 2 submitted responses, not the in_progress one)
    assert len(rows) == 3  # Header + 2 data rows

    # First response
    assert rows[1][2] == "John Doe"
    assert rows[1][3] == "Very Satisfied"
    assert rows[1][4] == "Feature A|Feature B"

    # Second response
    assert rows[2][2] == "Jane Smith"
    assert rows[2][3] == ""  # Missing answer for q2
    assert rows[2][4] == "Feature C"


def test_export_responses_non_owner_forbidden(authenticated_client, test_db):
    """Test that non-owner cannot export survey responses."""
    from app.db.orms.user import User
    from app.core.security import hash_password
    from app.core.deps import get_current_user
    from app.db import get_db
    from app.main import app

    # Create survey with first user
    survey_response = authenticated_client.post(
        "/surveys",
        json={"title": "User 1 Survey"}
    )
    survey_id = survey_response.json()["id"]

    # Create second user
    from tests.conftest import TestingSessionLocal
    db = TestingSessionLocal()
    user2 = User(email="export_user2@example.com", password_hash=hash_password("pass"))
    db.add(user2)
    db.commit()
    db.refresh(user2)
    db.close()

    # Override with second user
    def override_current_user():
        return user2

    from tests.conftest import override_get_db
    app.dependency_overrides[get_current_user] = override_current_user
    app.dependency_overrides[get_db] = override_get_db

    from fastapi.testclient import TestClient
    with TestClient(app) as client2:
        response = client2.get(f"/surveys/{survey_id}/responses/export?format=csv")

        assert response.status_code == 403
        assert response.json()["detail"] == "Not authorized to export this survey's responses"

    app.dependency_overrides.clear()


def test_export_responses_survey_not_found(authenticated_client):
    """Test export returns 404 if survey doesn't exist."""
    fake_uuid = "00000000-0000-0000-0000-000000000000"

    response = authenticated_client.get(f"/surveys/{fake_uuid}/responses/export?format=csv")

    assert response.status_code == 404
    assert response.json()["detail"] == "Survey not found"


def test_export_responses_no_submissions(authenticated_client):
    """Test export with no submitted responses returns CSV with headers only."""
    # Create and publish survey
    survey_response = authenticated_client.post(
        "/surveys",
        json={"title": "Empty Survey"}
    )
    survey_id = survey_response.json()["id"]

    # Add a question
    authenticated_client.post(
        f"/surveys/{survey_id}/questions",
        json={
            "type": "text",
            "title": "Question 1",
            "required": False,
            "position": 1
        }
    )

    authenticated_client.post(f"/surveys/{survey_id}/publish")

    # Export without any submissions
    response = authenticated_client.get(f"/surveys/{survey_id}/responses/export?format=csv")

    assert response.status_code == 200

    # Parse CSV
    csv_content = response.text
    reader = csv.reader(io.StringIO(csv_content))
    rows = list(reader)

    # Should have header row only
    assert len(rows) == 1
    assert rows[0] == ["response_id", "submitted_at", "Question 1"]


def test_export_responses_image_type(authenticated_client, test_db):
    """Test export correctly formats image type answers (pipe-separated files)."""
    from app.db.orms.response import Response
    from app.db.orms.answer import Answer
    from tests.conftest import TestingSessionLocal

    # Create survey with image question
    survey_response = authenticated_client.post(
        "/surveys",
        json={"title": "Image Survey"}
    )
    survey_id = survey_response.json()["id"]

    q_response = authenticated_client.post(
        f"/surveys/{survey_id}/questions",
        json={
            "type": "image",
            "title": "Upload photos",
            "required": False,
            "position": 1,
            "max_images": 3
        }
    )
    q_id = q_response.json()["id"]

    authenticated_client.post(f"/surveys/{survey_id}/publish")

    # Create response with image files
    db = TestingSessionLocal()
    try:
        response1 = Response(
            survey_id=survey_id,
            status="submitted",
            submitted_at=datetime.now(timezone.utc)
        )
        db.add(response1)
        db.flush()

        db.add(Answer(
            response_id=response1.id,
            question_id=q_id,
            answer_json={"files": ["image1.jpg", "image2.png", "image3.gif"]}
        ))

        db.commit()
    finally:
        db.close()

    # Export CSV
    response = authenticated_client.get(f"/surveys/{survey_id}/responses/export?format=csv")

    assert response.status_code == 200

    csv_content = response.text
    reader = csv.reader(io.StringIO(csv_content))
    rows = list(reader)

    assert len(rows) == 2  # Header + 1 data row
    assert rows[1][2] == "image1.jpg|image2.png|image3.gif"


def test_export_responses_invalid_format(authenticated_client):
    """Test export returns 400 for unsupported format."""
    survey_response = authenticated_client.post(
        "/surveys",
        json={"title": "Test Survey"}
    )
    survey_id = survey_response.json()["id"]

    response = authenticated_client.get(f"/surveys/{survey_id}/responses/export?format=json")

    assert response.status_code == 400
    assert "CSV format" in response.json()["detail"]
