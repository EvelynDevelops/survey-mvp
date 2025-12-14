"""Tests for public response submission endpoints."""

import pytest


def test_create_response_success(authenticated_client, client):
    """Test creating a response for a published survey."""
    # Create and publish a survey
    survey_response = authenticated_client.post(
        "/surveys",
        json={"title": "Feedback Survey", "description": "Tell us what you think"}
    )
    survey_id = survey_response.json()["id"]

    # Add a question
    authenticated_client.post(
        f"/surveys/{survey_id}/questions",
        json={"type": "text", "title": "Comments", "required": False, "position": 1}
    )

    # Publish survey
    publish_response = authenticated_client.post(f"/surveys/{survey_id}/publish")
    slug = publish_response.json()["slug"]

    # Create response (public endpoint, no auth)
    response = client.post(f"/public/surveys/{slug}/responses", json={})

    assert response.status_code == 201
    data = response.json()
    assert "response_id" in data
    assert "respondent_key" in data


def test_submit_answers_single_choice(authenticated_client, client):
    """Test submitting answers for single choice question."""
    # Create and publish survey with single choice question
    survey_response = authenticated_client.post(
        "/surveys",
        json={"title": "Test Survey"}
    )
    survey_id = survey_response.json()["id"]

    question_response = authenticated_client.post(
        f"/surveys/{survey_id}/questions",
        json={
            "type": "single",
            "title": "How satisfied are you?",
            "required": True,
            "position": 1,
            "options": ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied"]
        }
    )
    question_id = question_response.json()["id"]

    publish_response = authenticated_client.post(f"/surveys/{survey_id}/publish")
    slug = publish_response.json()["slug"]

    # Create response
    create_response = client.post(f"/public/surveys/{slug}/responses", json={})
    response_id = create_response.json()["response_id"]

    # Submit answer
    answer_response = client.put(
        f"/public/responses/{response_id}/answers",
        json={
            "answers": [
                {"question_id": question_id, "answer": {"value": "Satisfied"}}
            ]
        }
    )

    assert answer_response.status_code == 200
    assert answer_response.json()["updated"] == 1


def test_submit_answers_multi_choice(authenticated_client, client):
    """Test submitting answers for multi choice question."""
    # Create and publish survey with multi choice question
    survey_response = authenticated_client.post(
        "/surveys",
        json={"title": "Test Survey"}
    )
    survey_id = survey_response.json()["id"]

    question_response = authenticated_client.post(
        f"/surveys/{survey_id}/questions",
        json={
            "type": "multi",
            "title": "Select all that apply",
            "required": False,
            "position": 1,
            "options": ["Option A", "Option B", "Option C"]
        }
    )
    question_id = question_response.json()["id"]

    publish_response = authenticated_client.post(f"/surveys/{survey_id}/publish")
    slug = publish_response.json()["slug"]

    # Create response
    create_response = client.post(f"/public/surveys/{slug}/responses", json={})
    response_id = create_response.json()["response_id"]

    # Submit answer with multiple values
    answer_response = client.put(
        f"/public/responses/{response_id}/answers",
        json={
            "answers": [
                {"question_id": question_id, "answer": {"values": ["Option A", "Option C"]}}
            ]
        }
    )

    assert answer_response.status_code == 200
    assert answer_response.json()["updated"] == 1


def test_submit_answers_text(authenticated_client, client):
    """Test submitting text answer."""
    # Create and publish survey with text question
    survey_response = authenticated_client.post(
        "/surveys",
        json={"title": "Test Survey"}
    )
    survey_id = survey_response.json()["id"]

    question_response = authenticated_client.post(
        f"/surveys/{survey_id}/questions",
        json={
            "type": "text",
            "title": "Any comments?",
            "required": False,
            "position": 1
        }
    )
    question_id = question_response.json()["id"]

    publish_response = authenticated_client.post(f"/surveys/{survey_id}/publish")
    slug = publish_response.json()["slug"]

    # Create response
    create_response = client.post(f"/public/surveys/{slug}/responses", json={})
    response_id = create_response.json()["response_id"]

    # Submit text answer
    answer_response = client.put(
        f"/public/responses/{response_id}/answers",
        json={
            "answers": [
                {"question_id": question_id, "answer": {"text": "Great survey!"}}
            ]
        }
    )

    assert answer_response.status_code == 200
    assert answer_response.json()["updated"] == 1


def test_submit_answers_image(authenticated_client, client):
    """Test submitting image answer with file keys."""
    # Create and publish survey with image question
    survey_response = authenticated_client.post(
        "/surveys",
        json={"title": "Test Survey"}
    )
    survey_id = survey_response.json()["id"]

    question_response = authenticated_client.post(
        f"/surveys/{survey_id}/questions",
        json={
            "type": "image",
            "title": "Upload photos",
            "required": False,
            "position": 1,
            "max_images": 3
        }
    )
    question_id = question_response.json()["id"]

    publish_response = authenticated_client.post(f"/surveys/{survey_id}/publish")
    slug = publish_response.json()["slug"]

    # Create response
    create_response = client.post(f"/public/surveys/{slug}/responses", json={})
    response_id = create_response.json()["response_id"]

    # Submit image answer with file keys
    answer_response = client.put(
        f"/public/responses/{response_id}/answers",
        json={
            "answers": [
                {
                    "question_id": question_id,
                    "answer": {"files": ["s3://bucket/file1.jpg", "s3://bucket/file2.jpg"]}
                }
            ]
        }
    )

    assert answer_response.status_code == 200
    assert answer_response.json()["updated"] == 1


def test_upsert_answer(authenticated_client, client):
    """Test updating an existing answer."""
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
            "title": "Comments",
            "required": False,
            "position": 1
        }
    )
    question_id = question_response.json()["id"]

    publish_response = authenticated_client.post(f"/surveys/{survey_id}/publish")
    slug = publish_response.json()["slug"]

    # Create response
    create_response = client.post(f"/public/surveys/{slug}/responses", json={})
    response_id = create_response.json()["response_id"]

    # Submit first answer
    client.put(
        f"/public/responses/{response_id}/answers",
        json={
            "answers": [
                {"question_id": question_id, "answer": {"text": "First answer"}}
            ]
        }
    )

    # Update the same answer
    answer_response = client.put(
        f"/public/responses/{response_id}/answers",
        json={
            "answers": [
                {"question_id": question_id, "answer": {"text": "Updated answer"}}
            ]
        }
    )

    assert answer_response.status_code == 200
    assert answer_response.json()["updated"] == 1


def test_submit_response_success(authenticated_client, client):
    """Test submitting a response with all required questions answered."""
    # Create and publish survey with required question
    survey_response = authenticated_client.post(
        "/surveys",
        json={"title": "Test Survey"}
    )
    survey_id = survey_response.json()["id"]

    question_response = authenticated_client.post(
        f"/surveys/{survey_id}/questions",
        json={
            "type": "text",
            "title": "Required question",
            "required": True,
            "position": 1
        }
    )
    question_id = question_response.json()["id"]

    publish_response = authenticated_client.post(f"/surveys/{survey_id}/publish")
    slug = publish_response.json()["slug"]

    # Create response
    create_response = client.post(f"/public/surveys/{slug}/responses", json={})
    response_id = create_response.json()["response_id"]

    # Submit answer for required question
    client.put(
        f"/public/responses/{response_id}/answers",
        json={
            "answers": [
                {"question_id": question_id, "answer": {"text": "My answer"}}
            ]
        }
    )

    # Submit response
    submit_response = client.post(f"/public/responses/{response_id}/submit")

    assert submit_response.status_code == 200
    data = submit_response.json()
    assert data["status"] == "submitted"
    assert "submitted_at" in data


def test_submit_response_missing_required_question(authenticated_client, client):
    """Test submitting fails when required question is not answered."""
    # Create and publish survey with required question
    survey_response = authenticated_client.post(
        "/surveys",
        json={"title": "Test Survey"}
    )
    survey_id = survey_response.json()["id"]

    authenticated_client.post(
        f"/surveys/{survey_id}/questions",
        json={
            "type": "text",
            "title": "Required question",
            "required": True,
            "position": 1
        }
    )

    publish_response = authenticated_client.post(f"/surveys/{survey_id}/publish")
    slug = publish_response.json()["slug"]

    # Create response
    create_response = client.post(f"/public/surveys/{slug}/responses", json={})
    response_id = create_response.json()["response_id"]

    # Try to submit without answering required question
    submit_response = client.post(f"/public/responses/{response_id}/submit")

    assert submit_response.status_code == 400
    assert "Missing required questions" in submit_response.json()["detail"]


def test_invalid_single_choice_value(authenticated_client, client):
    """Test validation fails for invalid single choice value."""
    # Create and publish survey
    survey_response = authenticated_client.post(
        "/surveys",
        json={"title": "Test Survey"}
    )
    survey_id = survey_response.json()["id"]

    question_response = authenticated_client.post(
        f"/surveys/{survey_id}/questions",
        json={
            "type": "single",
            "title": "Choose one",
            "required": False,
            "position": 1,
            "options": ["A", "B", "C"]
        }
    )
    question_id = question_response.json()["id"]

    publish_response = authenticated_client.post(f"/surveys/{survey_id}/publish")
    slug = publish_response.json()["slug"]

    # Create response
    create_response = client.post(f"/public/surveys/{slug}/responses", json={})
    response_id = create_response.json()["response_id"]

    # Try to submit invalid value
    answer_response = client.put(
        f"/public/responses/{response_id}/answers",
        json={
            "answers": [
                {"question_id": question_id, "answer": {"value": "D"}}  # Not in options
            ]
        }
    )

    assert answer_response.status_code == 400
    assert "not in valid options" in answer_response.json()["detail"]


def test_invalid_multi_choice_value(authenticated_client, client):
    """Test validation fails for invalid multi choice value."""
    # Create and publish survey
    survey_response = authenticated_client.post(
        "/surveys",
        json={"title": "Test Survey"}
    )
    survey_id = survey_response.json()["id"]

    question_response = authenticated_client.post(
        f"/surveys/{survey_id}/questions",
        json={
            "type": "multi",
            "title": "Choose multiple",
            "required": False,
            "position": 1,
            "options": ["A", "B", "C"]
        }
    )
    question_id = question_response.json()["id"]

    publish_response = authenticated_client.post(f"/surveys/{survey_id}/publish")
    slug = publish_response.json()["slug"]

    # Create response
    create_response = client.post(f"/public/surveys/{slug}/responses", json={})
    response_id = create_response.json()["response_id"]

    # Try to submit invalid value
    answer_response = client.put(
        f"/public/responses/{response_id}/answers",
        json={
            "answers": [
                {"question_id": question_id, "answer": {"values": ["A", "D"]}}  # D not in options
            ]
        }
    )

    assert answer_response.status_code == 400
    assert "not in valid options" in answer_response.json()["detail"]


def test_create_response_for_nonexistent_survey(client):
    """Test creating response for non-existent survey returns 404."""
    response = client.post("/public/surveys/fakeslug/responses", json={})

    assert response.status_code == 404
    assert response.json()["detail"] == "Survey not found"


def test_submit_answers_for_nonexistent_response(client):
    """Test submitting answers for non-existent response returns 404."""
    fake_uuid = "00000000-0000-0000-0000-000000000000"

    response = client.put(
        f"/public/responses/{fake_uuid}/answers",
        json={
            "answers": [
                {"question_id": fake_uuid, "answer": {"text": "test"}}
            ]
        }
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Response not found"


def test_submit_nonexistent_response(client):
    """Test submitting non-existent response returns 404."""
    fake_uuid = "00000000-0000-0000-0000-000000000000"

    response = client.post(f"/public/responses/{fake_uuid}/submit")

    assert response.status_code == 404
    assert response.json()["detail"] == "Response not found"


def test_answer_question_not_in_survey(authenticated_client, client):
    """Test answering question that doesn't belong to survey returns 400."""
    # Create first survey
    survey1_response = authenticated_client.post(
        "/surveys",
        json={"title": "Survey 1"}
    )
    survey1_id = survey1_response.json()["id"]

    # Create second survey with a question
    survey2_response = authenticated_client.post(
        "/surveys",
        json={"title": "Survey 2"}
    )
    survey2_id = survey2_response.json()["id"]

    question2_response = authenticated_client.post(
        f"/surveys/{survey2_id}/questions",
        json={
            "type": "text",
            "title": "Question from survey 2",
            "required": False,
            "position": 1
        }
    )
    question2_id = question2_response.json()["id"]

    # Publish first survey
    publish_response = authenticated_client.post(f"/surveys/{survey1_id}/publish")
    slug1 = publish_response.json()["slug"]

    # Create response for survey 1
    create_response = client.post(f"/public/surveys/{slug1}/responses", json={})
    response_id = create_response.json()["response_id"]

    # Try to answer question from survey 2
    answer_response = client.put(
        f"/public/responses/{response_id}/answers",
        json={
            "answers": [
                {"question_id": question2_id, "answer": {"text": "test"}}
            ]
        }
    )

    assert answer_response.status_code == 400
    assert "not found in this survey" in answer_response.json()["detail"]
