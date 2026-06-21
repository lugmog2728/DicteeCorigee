"""Integration tests for POST /api/auth/login."""

import pytest
from httpx import AsyncClient

from tests.conftest import create_test_user


@pytest.mark.asyncio
async def test_login_valid_credentials(client: AsyncClient, db_session):
    await create_test_user(db_session, email="alice@example.com", password="pass1234")

    resp = await client.post(
        "/api/auth/login",
        json={"email": "alice@example.com", "password": "pass1234"},
    )

    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "alice@example.com"


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient, db_session):
    await create_test_user(db_session, email="bob@example.com", password="correctpass")

    resp = await client.post(
        "/api/auth/login",
        json={"email": "bob@example.com", "password": "wrongpass"},
    )

    assert resp.status_code == 401
    assert resp.json()["detail"] == "Identifiants incorrects"


@pytest.mark.asyncio
async def test_login_unknown_user(client: AsyncClient, db_session):
    resp = await client.post(
        "/api/auth/login",
        json={"email": "nobody@example.com", "password": "whatever"},
    )

    assert resp.status_code == 401
    assert resp.json()["detail"] == "Identifiants incorrects"


@pytest.mark.asyncio
async def test_login_missing_fields_returns_422(client: AsyncClient, db_session):
    """Sending an empty body should fail schema validation."""
    resp = await client.post("/api/auth/login", json={})
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_login_returns_user_name(client: AsyncClient, db_session):
    await create_test_user(
        db_session,
        email="carol@example.com",
        password="pass5678",
        name="Carol",
    )

    resp = await client.post(
        "/api/auth/login",
        json={"email": "carol@example.com", "password": "pass5678"},
    )

    assert resp.status_code == 200
    assert resp.json()["user"]["name"] == "Carol"


@pytest.mark.asyncio
async def test_login_access_token_is_non_empty_string(client: AsyncClient, db_session):
    await create_test_user(db_session, email="dave@example.com", password="pw")

    resp = await client.post(
        "/api/auth/login",
        json={"email": "dave@example.com", "password": "pw"},
    )

    assert resp.status_code == 200
    token = resp.json()["access_token"]
    assert isinstance(token, str)
    assert len(token) > 20
