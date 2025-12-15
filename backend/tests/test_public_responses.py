"""Tests for public response endpoints."""

import pytest
import uuid
from datetime import datetime, timezone


def test_get_response_success(client, test_db):
    """Test getting a response with valid respondent_key."""
    from app.db.orms.survey import Survey
    from app.db.orms.question import Question
    from app.db.orms.response import Response
    from app.db.orms.answer import Answer
    from app.db.orms.user import User
    from app.core.security import hash_password
    from tests.conftest import TestingSessionLocal

    db = TestingSessionLocal()
    try:
        # Create user and survey
        user = User(email="test@example.com", password_hash=hash_password("test"))
        db.add(user)
        db.commit()
        db.refresh(user)

        survey = Survey(
            owner_id=user.id,
            title="Test Survey",
            status="published",
            slug="test123"
        )
        db.add(survey)
        db.commit()
        db.refresh(survey)

        # Create question
        question = Question(
            survey_id=survey.id,
            type="text",
            title="Test question",
            required=True,
            position=1
        )
        db.add(question)
        db.commit()
        db.refresh(question)

        # Create response with answers
        respondent_key = uuid.uuid4()
        response = Response(
            survey_id=survey.id,
            status="in_progress",
            respondent_key=respondent_key,
            started_at=datetime.now(timezone.utc)
        )
        db.add(response)
        db.commit()
        db.refresh(response)

        # Create answer
        answer = Answer(
            response_id=response.id,
            question_id=question.id,
            answer_json={"text": "My answer"}
        )
        db.add(answer)
        db.commit()

        # Store IDs before closing session
        response_id = response.id
        survey_id = survey.id
        question_id = question.id
    finally:
        db.close()

    # Get response with correct respondent_key
    resp = client.get(
        f"/public/responses/{response_id}",
        params={"respondent_key": str(respondent_key)}
    )

    assert resp.status_code == 200
    data = resp.json()
    assert data["response_id"] == str(response_id)
    assert data["survey_id"] == str(survey_id)
    assert data["status"] == "in_progress"
    assert data["respondent_key"] == str(respondent_key)
    assert len(data["answers"]) == 1
    assert data["answers"][0]["question_id"] == str(question_id)
    assert data["answers"][0]["answer_json"] == {"text": "My answer"}


def test_get_response_wrong_respondent_key(client, test_db):
    """Test getting a response with wrong respondent_key returns 403."""
    from app.db.orms.survey import Survey
    from app.db.orms.response import Response
    from app.db.orms.user import User
    from app.core.security import hash_password
    from tests.conftest import TestingSessionLocal

    db = TestingSessionLocal()
    try:
        # Create user and survey
        user = User(email="test2@example.com", password_hash=hash_password("test"))
        db.add(user)
        db.commit()
        db.refresh(user)

        survey = Survey(
            owner_id=user.id,
            title="Test Survey",
            status="published",
            slug="test456"
        )
        db.add(survey)
        db.commit()
        db.refresh(survey)

        # Create response
        correct_key = uuid.uuid4()
        response = Response(
            survey_id=survey.id,
            status="in_progress",
            respondent_key=correct_key,
            started_at=datetime.now(timezone.utc)
        )
        db.add(response)
        db.commit()
        db.refresh(response)

        # Store ID before closing session
        response_id = response.id
    finally:
        db.close()

    # Try to get response with wrong respondent_key
    wrong_key = uuid.uuid4()
    resp = client.get(
        f"/public/responses/{response_id}",
        params={"respondent_key": str(wrong_key)}
    )

    assert resp.status_code == 403
    assert resp.json()["detail"] == "Invalid respondent key"


def test_get_response_not_found(client):
    """Test getting non-existent response returns 404."""
    fake_response_id = uuid.uuid4()
    fake_key = uuid.uuid4()

    resp = client.get(
        f"/public/responses/{fake_response_id}",
        params={"respondent_key": str(fake_key)}
    )

    assert resp.status_code == 404
    assert resp.json()["detail"] == "Response not found"


def test_resume_response_creates_new(client, test_db):
    """Test resume endpoint creates new response when none exists."""
    from app.db.orms.survey import Survey
    from app.db.orms.user import User
    from app.core.security import hash_password
    from tests.conftest import TestingSessionLocal

    db = TestingSessionLocal()
    try:
        # Create user and survey
        user = User(email="test3@example.com", password_hash=hash_password("test"))
        db.add(user)
        db.commit()
        db.refresh(user)

        survey = Survey(
            owner_id=user.id,
            title="Test Survey",
            status="published",
            slug="resume123"
        )
        db.add(survey)
        db.commit()
    finally:
        db.close()

    # Resume with new respondent_key
    respondent_key = str(uuid.uuid4())
    resp = client.post(
        "/public/surveys/resume123/responses/resume",
        json={"respondent_key": respondent_key}
    )

    assert resp.status_code == 200
    data = resp.json()
    assert data["respondent_key"] == respondent_key
    assert data["status"] == "in_progress"
    assert data["is_new"] is True
    assert "response_id" in data


def test_resume_response_returns_existing(client, test_db):
    """Test resume endpoint returns existing in-progress response."""
    from app.db.orms.survey import Survey
    from app.db.orms.response import Response
    from app.db.orms.user import User
    from app.core.security import hash_password
    from tests.conftest import TestingSessionLocal

    db = TestingSessionLocal()
    try:
        # Create user and survey
        user = User(email="test4@example.com", password_hash=hash_password("test"))
        db.add(user)
        db.commit()
        db.refresh(user)

        survey = Survey(
            owner_id=user.id,
            title="Test Survey",
            status="published",
            slug="resume456"
        )
        db.add(survey)
        db.commit()
        db.refresh(survey)

        # Create existing in-progress response
        respondent_key = uuid.uuid4()
        existing_response = Response(
            survey_id=survey.id,
            status="in_progress",
            respondent_key=respondent_key,
            started_at=datetime.now(timezone.utc)
        )
        db.add(existing_response)
        db.commit()
        db.refresh(existing_response)
    finally:
        db.close()

    # Resume with same respondent_key
    resp = client.post(
        "/public/surveys/resume456/responses/resume",
        json={"respondent_key": str(respondent_key)}
    )

    assert resp.status_code == 200
    data = resp.json()
    assert data["response_id"] == str(existing_response.id)
    assert data["respondent_key"] == str(respondent_key)
    assert data["status"] == "in_progress"
    assert data["is_new"] is False


def test_resume_response_creates_new_after_submission(client, test_db):
    """Test resume creates new response if previous was submitted."""
    from app.db.orms.survey import Survey
    from app.db.orms.response import Response
    from app.db.orms.user import User
    from app.core.security import hash_password
    from tests.conftest import TestingSessionLocal

    db = TestingSessionLocal()
    try:
        # Create user and survey
        user = User(email="test5@example.com", password_hash=hash_password("test"))
        db.add(user)
        db.commit()
        db.refresh(user)

        survey = Survey(
            owner_id=user.id,
            title="Test Survey",
            status="published",
            slug="resume789"
        )
        db.add(survey)
        db.commit()
        db.refresh(survey)

        # Create submitted response
        respondent_key = uuid.uuid4()
        submitted_response = Response(
            survey_id=survey.id,
            status="submitted",
            respondent_key=respondent_key,
            started_at=datetime.now(timezone.utc),
            submitted_at=datetime.now(timezone.utc)
        )
        db.add(submitted_response)
        db.commit()
        db.refresh(submitted_response)
    finally:
        db.close()

    # Resume with same respondent_key - should create new response
    resp = client.post(
        "/public/surveys/resume789/responses/resume",
        json={"respondent_key": str(respondent_key)}
    )

    assert resp.status_code == 200
    data = resp.json()
    # Should create new response, not return submitted one
    assert data["response_id"] != str(submitted_response.id)
    assert data["respondent_key"] == str(respondent_key)
    assert data["status"] == "in_progress"
    assert data["is_new"] is True


def test_resume_response_generates_key_if_not_provided(client, test_db):
    """Test resume generates respondent_key if not provided."""
    from app.db.orms.survey import Survey
    from app.db.orms.user import User
    from app.core.security import hash_password
    from tests.conftest import TestingSessionLocal

    db = TestingSessionLocal()
    try:
        # Create user and survey
        user = User(email="test6@example.com", password_hash=hash_password("test"))
        db.add(user)
        db.commit()
        db.refresh(user)

        survey = Survey(
            owner_id=user.id,
            title="Test Survey",
            status="published",
            slug="resume000"
        )
        db.add(survey)
        db.commit()
    finally:
        db.close()

    # Resume without respondent_key
    resp = client.post(
        "/public/surveys/resume000/responses/resume",
        json={}
    )

    assert resp.status_code == 200
    data = resp.json()
    assert "respondent_key" in data
    assert data["respondent_key"] is not None
    assert data["is_new"] is True


def test_resume_response_survey_not_found(client):
    """Test resume returns 404 for non-existent survey."""
    resp = client.post(
        "/public/surveys/nonexistent/responses/resume",
        json={}
    )

    assert resp.status_code == 404
    assert resp.json()["detail"] == "Survey not found"


def test_resume_response_unpublished_survey(client, test_db):
    """Test resume returns 404 for unpublished survey."""
    from app.db.orms.survey import Survey
    from app.db.orms.user import User
    from app.core.security import hash_password
    from tests.conftest import TestingSessionLocal

    db = TestingSessionLocal()
    try:
        # Create user and draft survey
        user = User(email="test7@example.com", password_hash=hash_password("test"))
        db.add(user)
        db.commit()
        db.refresh(user)

        survey = Survey(
            owner_id=user.id,
            title="Draft Survey",
            status="draft",
            slug="draft123"
        )
        db.add(survey)
        db.commit()
    finally:
        db.close()

    # Try to resume on draft survey
    resp = client.post(
        "/public/surveys/draft123/responses/resume",
        json={}
    )

    assert resp.status_code == 404
    assert resp.json()["detail"] == "Survey not found"
