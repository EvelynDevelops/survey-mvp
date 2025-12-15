"""Tests for user dashboard endpoint."""

import pytest
from datetime import datetime, timezone, timedelta


def test_get_user_dashboard_no_surveys(authenticated_client, test_user):
    """Test dashboard returns empty list when user has no surveys."""
    response = authenticated_client.get("/dashboard")

    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == str(test_user.id)
    assert data["surveys"] == []


def test_get_user_dashboard_with_surveys(authenticated_client, test_user):
    """Test dashboard returns all surveys owned by the user."""
    # Create 3 surveys
    survey1 = authenticated_client.post(
        "/surveys",
        json={"title": "Survey 1", "description": "First survey"}
    ).json()

    survey2 = authenticated_client.post(
        "/surveys",
        json={"title": "Survey 2", "description": "Second survey"}
    ).json()

    survey3 = authenticated_client.post(
        "/surveys",
        json={"title": "Survey 3"}
    ).json()

    # Publish one of them
    authenticated_client.post(f"/surveys/{survey1['id']}/publish")

    # Get dashboard
    response = authenticated_client.get("/dashboard")

    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == str(test_user.id)
    assert len(data["surveys"]) == 3

    # Check survey details (order may vary)
    survey_titles = {s["title"] for s in data["surveys"]}
    assert survey_titles == {"Survey 1", "Survey 2", "Survey 3"}

    # All should have zero submissions initially
    for survey in data["surveys"]:
        assert survey["total_submissions"] == 0
        assert survey["last_submitted_at"] is None
        assert "id" in survey
        assert "status" in survey


def test_get_user_dashboard_with_submissions(authenticated_client, test_user, test_db):
    """Test dashboard shows correct submission counts."""
    from datetime import datetime, timezone, timedelta
    from app.db.orms.response import Response
    from tests.conftest import TestingSessionLocal

    # Create survey
    survey_response = authenticated_client.post(
        "/surveys",
        json={"title": "Test Survey"}
    )
    survey_id = survey_response.json()["id"]

    # Publish survey
    authenticated_client.post(f"/surveys/{survey_id}/publish")

    # Manually create submitted responses
    db = TestingSessionLocal()
    try:
        now = datetime.now(timezone.utc)

        response1 = Response(
            survey_id=survey_id,
            status="submitted",
            submitted_at=now - timedelta(hours=2)
        )
        response2 = Response(
            survey_id=survey_id,
            status="submitted",
            submitted_at=now - timedelta(hours=1)
        )
        response3 = Response(
            survey_id=survey_id,
            status="submitted",
            submitted_at=now  # Most recent
        )

        # One in_progress (should not be counted)
        response4 = Response(
            survey_id=survey_id,
            status="in_progress",
            submitted_at=None
        )

        db.add_all([response1, response2, response3, response4])
        db.commit()
    finally:
        db.close()

    # Get dashboard
    response = authenticated_client.get("/dashboard")

    assert response.status_code == 200
    data = response.json()
    assert len(data["surveys"]) == 1

    survey = data["surveys"][0]
    assert survey["title"] == "Test Survey"
    assert survey["status"] == "published"
    assert survey["slug"] is not None
    assert survey["total_submissions"] == 3
    assert survey["last_submitted_at"] is not None


def test_get_user_dashboard_mixed_surveys(authenticated_client, test_user, test_db):
    """Test dashboard with mix of published/draft surveys and varying submissions."""
    from datetime import datetime, timezone
    from app.db.orms.response import Response
    from tests.conftest import TestingSessionLocal

    # Create surveys
    survey1 = authenticated_client.post(
        "/surveys",
        json={"title": "Published with submissions"}
    ).json()

    survey2 = authenticated_client.post(
        "/surveys",
        json={"title": "Draft no submissions"}
    ).json()

    survey3 = authenticated_client.post(
        "/surveys",
        json={"title": "Published no submissions"}
    ).json()

    # Publish survey1 and survey3
    authenticated_client.post(f"/surveys/{survey1['id']}/publish")
    authenticated_client.post(f"/surveys/{survey3['id']}/publish")

    # Add submissions to survey1
    db = TestingSessionLocal()
    try:
        now = datetime.now(timezone.utc)
        response1 = Response(
            survey_id=survey1['id'],
            status="submitted",
            submitted_at=now
        )
        response2 = Response(
            survey_id=survey1['id'],
            status="submitted",
            submitted_at=now
        )
        db.add_all([response1, response2])
        db.commit()
    finally:
        db.close()

    # Get dashboard
    response = authenticated_client.get("/dashboard")

    assert response.status_code == 200
    data = response.json()
    assert len(data["surveys"]) == 3

    # Find each survey
    surveys_by_title = {s["title"]: s for s in data["surveys"]}

    # Check survey1: published with 2 submissions
    assert surveys_by_title["Published with submissions"]["status"] == "published"
    assert surveys_by_title["Published with submissions"]["slug"] is not None
    assert surveys_by_title["Published with submissions"]["total_submissions"] == 2
    assert surveys_by_title["Published with submissions"]["last_submitted_at"] is not None

    # Check survey2: draft with no submissions
    assert surveys_by_title["Draft no submissions"]["status"] == "draft"
    assert surveys_by_title["Draft no submissions"]["slug"] is None
    assert surveys_by_title["Draft no submissions"]["total_submissions"] == 0
    assert surveys_by_title["Draft no submissions"]["last_submitted_at"] is None

    # Check survey3: published with no submissions
    assert surveys_by_title["Published no submissions"]["status"] == "published"
    assert surveys_by_title["Published no submissions"]["slug"] is not None
    assert surveys_by_title["Published no submissions"]["total_submissions"] == 0
    assert surveys_by_title["Published no submissions"]["last_submitted_at"] is None


def test_get_user_dashboard_only_shows_own_surveys(authenticated_client, test_user, test_db):
    """Test dashboard only shows surveys owned by the current user."""
    from app.db.orms.user import User
    from app.db.orms.survey import Survey
    from app.core.security import hash_password
    from tests.conftest import TestingSessionLocal

    # Create survey as test_user
    my_survey = authenticated_client.post(
        "/surveys",
        json={"title": "My Survey"}
    ).json()

    # Create another user and their survey directly in DB
    db = TestingSessionLocal()
    try:
        other_user = User(
            email="otheruser@example.com",
            password_hash=hash_password("password")
        )
        db.add(other_user)
        db.commit()
        db.refresh(other_user)

        other_survey = Survey(
            owner_id=other_user.id,
            title="Other User's Survey",
            status="draft"
        )
        db.add(other_survey)
        db.commit()
    finally:
        db.close()

    # Get dashboard as test_user
    response = authenticated_client.get("/dashboard")

    assert response.status_code == 200
    data = response.json()
    assert len(data["surveys"]) == 1
    assert data["surveys"][0]["title"] == "My Survey"
    assert data["surveys"][0]["id"] == my_survey["id"]


def test_get_user_dashboard_requires_authentication(client):
    """Test dashboard endpoint requires authentication."""
    response = client.get("/dashboard")

    # May return 401 or 403 depending on auth implementation
    assert response.status_code in [401, 403]
