"""Tests for survey dashboard endpoint."""

import pytest


def test_dashboard_no_submissions(authenticated_client):
    """Test dashboard shows zero stats when no submissions exist."""
    # Create and publish survey
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

    # Publish survey
    authenticated_client.post(f"/surveys/{survey_id}/publish")

    # Get dashboard
    dashboard_response = authenticated_client.get(f"/surveys/{survey_id}/dashboard")

    assert dashboard_response.status_code == 200
    data = dashboard_response.json()
    assert data["survey_id"] == survey_id
    assert data["completed"] == 0
    assert data["last_submission_at"] is None


def test_dashboard_with_completed_submissions(authenticated_client, client):
    """Test dashboard counts completed submissions correctly."""
    # Create and publish survey
    survey_response = authenticated_client.post(
        "/surveys",
        json={"title": "Test Survey"}
    )
    survey_id = survey_response.json()["id"]

    question_response = authenticated_client.post(
        f"/surveys/{survey_id}/questions",
        json={
            "type": "text",
            "title": "Question 1",
            "required": True,
            "position": 1
        }
    )
    question_id = question_response.json()["id"]

    publish_response = authenticated_client.post(f"/surveys/{survey_id}/publish")
    slug = publish_response.json()["slug"]

    # Create and submit 3 responses
    for i in range(3):
        # Create response
        response = client.post(f"/public/surveys/{slug}/responses", json={})
        response_id = response.json()["response_id"]

        # Submit answer
        client.put(
            f"/public/responses/{response_id}/answers",
            json={
                "answers": [
                    {"question_id": question_id, "answer": {"text": f"Answer {i+1}"}}
                ]
            }
        )

        # Submit response
        client.post(f"/public/responses/{response_id}/submit")

    # Get dashboard
    dashboard_response = authenticated_client.get(f"/surveys/{survey_id}/dashboard")

    assert dashboard_response.status_code == 200
    data = dashboard_response.json()
    assert data["survey_id"] == survey_id
    assert data["completed"] == 3
    assert data["last_submission_at"] is not None


def test_dashboard_ignores_in_progress_responses(authenticated_client, client):
    """Test dashboard only counts submitted responses, not in-progress ones."""
    # Create and publish survey
    survey_response = authenticated_client.post(
        "/surveys",
        json={"title": "Test Survey"}
    )
    survey_id = survey_response.json()["id"]

    question_response = authenticated_client.post(
        f"/surveys/{survey_id}/questions",
        json={
            "type": "text",
            "title": "Question 1",
            "required": True,
            "position": 1
        }
    )
    question_id = question_response.json()["id"]

    publish_response = authenticated_client.post(f"/surveys/{survey_id}/publish")
    slug = publish_response.json()["slug"]

    # Create 2 in-progress responses (not submitted)
    for i in range(2):
        response = client.post(f"/public/surveys/{slug}/responses", json={})
        response_id = response.json()["response_id"]

        # Submit answer but don't submit the response
        client.put(
            f"/public/responses/{response_id}/answers",
            json={
                "answers": [
                    {"question_id": question_id, "answer": {"text": f"Answer {i+1}"}}
                ]
            }
        )

    # Create and submit 1 completed response
    response = client.post(f"/public/surveys/{slug}/responses", json={})
    response_id = response.json()["response_id"]
    client.put(
        f"/public/responses/{response_id}/answers",
        json={
            "answers": [
                {"question_id": question_id, "answer": {"text": "Completed answer"}}
            ]
        }
    )
    client.post(f"/public/responses/{response_id}/submit")

    # Get dashboard - should only count the submitted response
    dashboard_response = authenticated_client.get(f"/surveys/{survey_id}/dashboard")

    assert dashboard_response.status_code == 200
    data = dashboard_response.json()
    assert data["completed"] == 1
    assert data["last_submission_at"] is not None


def test_dashboard_unauthorized_user_cannot_view(authenticated_client, test_db):
    """Test non-owner cannot view dashboard (403)."""
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
        # Try to view dashboard as user2
        response = client2.get(f"/surveys/{survey_id}/dashboard")

        assert response.status_code == 403
        assert response.json()["detail"] == "Not authorized to view this survey's dashboard"

    app.dependency_overrides.clear()


def test_dashboard_nonexistent_survey(authenticated_client):
    """Test dashboard returns 404 for non-existent survey."""
    fake_uuid = "00000000-0000-0000-0000-000000000000"

    response = authenticated_client.get(f"/surveys/{fake_uuid}/dashboard")

    assert response.status_code == 404
    assert response.json()["detail"] == "Survey not found"


def test_dashboard_last_submission_at_is_most_recent(authenticated_client, client):
    """Test last_submission_at returns the most recent submission time."""
    # Create and publish survey
    survey_response = authenticated_client.post(
        "/surveys",
        json={"title": "Test Survey"}
    )
    survey_id = survey_response.json()["id"]

    question_response = authenticated_client.post(
        f"/surveys/{survey_id}/questions",
        json={
            "type": "text",
            "title": "Question 1",
            "required": True,
            "position": 1
        }
    )
    question_id = question_response.json()["id"]

    publish_response = authenticated_client.post(f"/surveys/{survey_id}/publish")
    slug = publish_response.json()["slug"]

    # Create and submit multiple responses
    submission_times = []
    for i in range(3):
        # Create response
        response = client.post(f"/public/surveys/{slug}/responses", json={})
        response_id = response.json()["response_id"]

        # Submit answer
        client.put(
            f"/public/responses/{response_id}/answers",
            json={
                "answers": [
                    {"question_id": question_id, "answer": {"text": f"Answer {i+1}"}}
                ]
            }
        )

        # Submit response and capture timestamp
        submit_resp = client.post(f"/public/responses/{response_id}/submit")
        submission_times.append(submit_resp.json()["submitted_at"])

    # Get dashboard
    dashboard_response = authenticated_client.get(f"/surveys/{survey_id}/dashboard")

    assert dashboard_response.status_code == 200
    data = dashboard_response.json()

    # last_submission_at should be the most recent (last) submission
    # Since submissions happen in order, the last one should be >= all others
    assert data["last_submission_at"] == max(submission_times)
