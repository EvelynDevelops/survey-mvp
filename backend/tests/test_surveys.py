"""Tests for survey endpoints."""

import pytest


def test_create_survey_success(authenticated_client):
    """Test creating a survey returns 201 with draft status."""
    response = authenticated_client.post(
        "/surveys",
        json={"title": "Customer Feedback Survey", "description": "Tell us what you think"}
    )

    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Customer Feedback Survey"
    assert data["description"] == "Tell us what you think"
    assert data["status"] == "draft"
    assert data["slug"] is None
    assert "id" in data


def test_add_question_single_choice(authenticated_client):
    """Test adding a single-choice question."""
    # Create survey
    survey_response = authenticated_client.post(
        "/surveys",
        json={"title": "Test Survey"}
    )
    survey_id = survey_response.json()["id"]

    # Add question
    response = authenticated_client.post(
        f"/surveys/{survey_id}/questions",
        json={
            "type": "single",
            "title": "How satisfied are you?",
            "required": True,
            "position": 1,
            "options": ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied"]
        }
    )

    assert response.status_code == 201
    data = response.json()
    assert data["type"] == "single"
    assert data["title"] == "How satisfied are you?"
    assert data["required"] is True
    assert data["position"] == 1
    assert data["options_json"] == {"options": ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied"]}
    assert data["max_images"] is None


def test_add_question_text(authenticated_client):
    """Test adding a text question."""
    survey_response = authenticated_client.post(
        "/surveys",
        json={"title": "Test Survey"}
    )
    survey_id = survey_response.json()["id"]

    response = authenticated_client.post(
        f"/surveys/{survey_id}/questions",
        json={
            "type": "text",
            "title": "Any comments?",
            "required": False,
            "position": 2
        }
    )

    assert response.status_code == 201
    data = response.json()
    assert data["type"] == "text"
    assert data["options_json"] is None


def test_add_question_multi_choice(authenticated_client):
    """Test adding a multi-choice question."""
    survey_response = authenticated_client.post(
        "/surveys",
        json={"title": "Test Survey"}
    )
    survey_id = survey_response.json()["id"]

    response = authenticated_client.post(
        f"/surveys/{survey_id}/questions",
        json={
            "type": "multi",
            "title": "Select all that apply",
            "required": False,
            "position": 1,
            "options": ["Option A", "Option B", "Option C"]
        }
    )

    assert response.status_code == 201
    data = response.json()
    assert data["type"] == "multi"
    assert data["options_json"]["options"] == ["Option A", "Option B", "Option C"]


def test_add_question_image(authenticated_client):
    """Test adding an image question."""
    survey_response = authenticated_client.post(
        "/surveys",
        json={"title": "Test Survey"}
    )
    survey_id = survey_response.json()["id"]

    response = authenticated_client.post(
        f"/surveys/{survey_id}/questions",
        json={
            "type": "image",
            "title": "Upload photos",
            "required": False,
            "position": 1,
            "max_images": 3
        }
    )

    assert response.status_code == 201
    data = response.json()
    assert data["type"] == "image"
    assert data["max_images"] == 3
    assert data["options_json"] is None


def test_publish_survey(authenticated_client):
    """Test publishing a survey generates slug and sets status."""
    # Create survey
    survey_response = authenticated_client.post(
        "/surveys",
        json={"title": "Test Survey"}
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

    # Publish
    response = authenticated_client.post(f"/surveys/{survey_id}/publish")

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "published"
    assert data["slug"] is not None
    assert len(data["slug"]) == 8
    assert data["slug"].isalnum()


def test_public_get_survey_by_slug(authenticated_client, client):
    """Test public endpoint returns survey with questions ordered by position."""
    # Create and publish survey
    survey_response = authenticated_client.post(
        "/surveys",
        json={"title": "Public Survey", "description": "Test description"}
    )
    survey_id = survey_response.json()["id"]

    # Add questions in different positions
    authenticated_client.post(
        f"/surveys/{survey_id}/questions",
        json={"type": "text", "title": "Question 3", "required": False, "position": 3}
    )
    authenticated_client.post(
        f"/surveys/{survey_id}/questions",
        json={"type": "text", "title": "Question 1", "required": True, "position": 1}
    )
    authenticated_client.post(
        f"/surveys/{survey_id}/questions",
        json={"type": "single", "title": "Question 2", "required": False, "position": 2, "options": ["A", "B"]}
    )

    # Publish
    publish_response = authenticated_client.post(f"/surveys/{survey_id}/publish")
    slug = publish_response.json()["slug"]

    # Public access (no auth)
    response = client.get(f"/public/surveys/{slug}")

    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Public Survey"
    assert data["description"] == "Test description"
    assert len(data["questions"]) == 3

    # Verify ordering by position
    assert data["questions"][0]["title"] == "Question 1"
    assert data["questions"][0]["position"] == 1
    assert data["questions"][0]["required"] is True

    assert data["questions"][1]["title"] == "Question 2"
    assert data["questions"][1]["position"] == 2
    assert data["questions"][1]["options_json"] == {"options": ["A", "B"]}

    assert data["questions"][2]["title"] == "Question 3"
    assert data["questions"][2]["position"] == 3


def test_add_question_to_nonexistent_survey(authenticated_client):
    """Test adding question to non-existent survey returns 404."""
    fake_uuid = "00000000-0000-0000-0000-000000000000"

    response = authenticated_client.post(
        f"/surveys/{fake_uuid}/questions",
        json={
            "type": "text",
            "title": "Question",
            "required": False,
            "position": 1
        }
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Survey not found"


def test_publish_nonexistent_survey(authenticated_client):
    """Test publishing non-existent survey returns 404."""
    fake_uuid = "00000000-0000-0000-0000-000000000000"

    response = authenticated_client.post(f"/surveys/{fake_uuid}/publish")

    assert response.status_code == 404
    assert response.json()["detail"] == "Survey not found"


def test_unauthorized_user_cannot_add_question(authenticated_client, test_db, test_user):
    """Test another user cannot add questions to someone else's survey."""
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
    user2 = User(email="user2@example.com", password_hash=hash_password("pass"))
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
        # Try to add question as user2
        response = client2.post(
            f"/surveys/{survey_id}/questions",
            json={
                "type": "text",
                "title": "Should fail",
                "required": False,
                "position": 1
            }
        )

        assert response.status_code == 403
        assert response.json()["detail"] == "Not authorized to modify this survey"

    app.dependency_overrides.clear()


def test_unauthorized_user_cannot_publish(authenticated_client, test_db):
    """Test another user cannot publish someone else's survey."""
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
    user2 = User(email="user3@example.com", password_hash=hash_password("pass"))
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
        response = client2.post(f"/surveys/{survey_id}/publish")

        assert response.status_code == 403
        assert response.json()["detail"] == "Not authorized to publish this survey"

    app.dependency_overrides.clear()


def test_invalid_question_type(authenticated_client):
    """Test invalid question type returns 400."""
    survey_response = authenticated_client.post(
        "/surveys",
        json={"title": "Test Survey"}
    )
    survey_id = survey_response.json()["id"]

    response = authenticated_client.post(
        f"/surveys/{survey_id}/questions",
        json={
            "type": "invalid_type",
            "title": "Question",
            "required": False,
            "position": 1
        }
    )

    assert response.status_code == 400
    assert "Invalid question type" in response.json()["detail"]


def test_single_question_without_options(authenticated_client):
    """Test single/multi question without options returns 400."""
    survey_response = authenticated_client.post(
        "/surveys",
        json={"title": "Test Survey"}
    )
    survey_id = survey_response.json()["id"]

    response = authenticated_client.post(
        f"/surveys/{survey_id}/questions",
        json={
            "type": "single",
            "title": "Question without options",
            "required": False,
            "position": 1
        }
    )

    assert response.status_code == 400
    assert "requires options" in response.json()["detail"]


def test_public_access_draft_survey_returns_404(authenticated_client, client):
    """Test public endpoint returns 404 for draft (unpublished) surveys."""
    # Create survey but don't publish
    survey_response = authenticated_client.post(
        "/surveys",
        json={"title": "Draft Survey"}
    )
    survey_id = survey_response.json()["id"]

    # Try to access via a fake slug (draft has no slug)
    response = client.get("/public/surveys/fakeslug")

    assert response.status_code == 404


def test_public_access_nonexistent_slug_returns_404(client):
    """Test public endpoint returns 404 for non-existent slug."""
    response = client.get("/public/surveys/nonexistent")

    assert response.status_code == 404
    assert response.json()["detail"] == "Survey not found"


def test_republish_survey_returns_same_slug(authenticated_client):
    """Test re-publishing an already published survey returns same slug."""
    # Create and publish survey
    survey_response = authenticated_client.post(
        "/surveys",
        json={"title": "Test Survey"}
    )
    survey_id = survey_response.json()["id"]

    # First publish
    first_publish = authenticated_client.post(f"/surveys/{survey_id}/publish")
    first_slug = first_publish.json()["slug"]

    # Publish again
    second_publish = authenticated_client.post(f"/surveys/{survey_id}/publish")
    second_slug = second_publish.json()["slug"]

    assert first_slug == second_slug
    assert second_publish.json()["status"] == "published"
