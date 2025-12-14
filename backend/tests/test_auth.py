"""Tests for authentication endpoints."""

import pytest


def test_register_success(client):
    """Test successful user registration."""
    response = client.post(
        "/auth/register",
        json={"email": "test@example.com", "password": "password123"}
    )

    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert isinstance(data["access_token"], str)
    assert len(data["access_token"]) > 0


def test_register_duplicate_email(client):
    """Test registration with duplicate email returns 409."""
    # First registration
    client.post(
        "/auth/register",
        json={"email": "test@example.com", "password": "password123"}
    )

    # Second registration with same email
    response = client.post(
        "/auth/register",
        json={"email": "test@example.com", "password": "password456"}
    )

    assert response.status_code == 409
    assert response.json()["detail"] == "Email already registered"


def test_login_success(client):
    """Test successful login returns access token."""
    # Register user first
    client.post(
        "/auth/register",
        json={"email": "test@example.com", "password": "password123"}
    )

    # Login
    response = client.post(
        "/auth/login",
        json={"email": "test@example.com", "password": "password123"}
    )

    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert isinstance(data["access_token"], str)
    assert len(data["access_token"]) > 0


def test_login_wrong_password(client):
    """Test login with wrong password returns 401."""
    # Register user first
    client.post(
        "/auth/register",
        json={"email": "test@example.com", "password": "password123"}
    )

    # Login with wrong password
    response = client.post(
        "/auth/login",
        json={"email": "test@example.com", "password": "wrongpassword"}
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid credentials"


def test_login_nonexistent_user(client):
    """Test login with non-existent user returns 401."""
    response = client.post(
        "/auth/login",
        json={"email": "notfound@example.com", "password": "password123"}
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid credentials"


def test_register_invalid_email(client):
    """Test registration with invalid email format."""
    response = client.post(
        "/auth/register",
        json={"email": "not-an-email", "password": "password123"}
    )

    assert response.status_code == 422  # Validation error
