"""Integration tests for /api/classes."""

import pytest
from httpx import AsyncClient

from app.models.classe import Classe
from app.models.eleve import Eleve
from app.models.correction import Correction
from app.models.dictee import Dictee, NiveauEnum, PeriodeEnum, TempsEnum
from app.models.planification import Planification
from tests.conftest import create_test_user

import datetime


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

async def _create_classe(db, user_id: int, nom: str = "CE2 A", niveau: str = "CE2") -> Classe:
    cls = Classe(
        user_id=user_id,
        nom=nom,
        niveau=NiveauEnum(niveau),
        annee_scolaire="2025-2026",
        nb_eleves=20,
    )
    db.add(cls)
    await db.commit()
    await db.refresh(cls)
    return cls


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_list_classes_empty(auth_client: AsyncClient):
    resp = await auth_client.get("/api/classes")
    assert resp.status_code == 200
    assert resp.json() == []


@pytest.mark.asyncio
async def test_list_classes_returns_own_classes(auth_client: AsyncClient):
    db = auth_client.db
    user = auth_client.test_user
    await _create_classe(db, user.id, nom="CM1 B")

    resp = await auth_client.get("/api/classes")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["nom"] == "CM1 B"


@pytest.mark.asyncio
async def test_list_classes_does_not_expose_other_users(auth_client: AsyncClient):
    """Classes belonging to another user must not appear."""
    db = auth_client.db
    other_user = await create_test_user(db, email="other@example.com", password="pw")
    await _create_classe(db, other_user.id, nom="Other class")

    resp = await auth_client.get("/api/classes")
    assert resp.status_code == 200
    assert resp.json() == []


@pytest.mark.asyncio
async def test_create_classe(auth_client: AsyncClient):
    resp = await auth_client.post(
        "/api/classes",
        json={"nom": "CE1 C", "niveau": "CE1", "annee_scolaire": "2025-2026"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["nom"] == "CE1 C"
    assert data["niveau"] == "CE1"
    assert data["id"] > 0


@pytest.mark.asyncio
async def test_create_classe_invalid_niveau_returns_422(auth_client: AsyncClient):
    resp = await auth_client.post(
        "/api/classes",
        json={"nom": "Bad", "niveau": "INVALID", "annee_scolaire": "2025-2026"},
    )
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_get_classe_by_id(auth_client: AsyncClient):
    db = auth_client.db
    user = auth_client.test_user
    cls = await _create_classe(db, user.id, nom="CP A")

    resp = await auth_client.get(f"/api/classes/{cls.id}")
    assert resp.status_code == 200
    assert resp.json()["nom"] == "CP A"


@pytest.mark.asyncio
async def test_get_classe_not_found(auth_client: AsyncClient):
    resp = await auth_client.get("/api/classes/99999")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_update_classe(auth_client: AsyncClient):
    db = auth_client.db
    user = auth_client.test_user
    cls = await _create_classe(db, user.id, nom="Old Name")

    resp = await auth_client.put(f"/api/classes/{cls.id}", json={"nom": "New Name"})
    assert resp.status_code == 200
    assert resp.json()["nom"] == "New Name"


@pytest.mark.asyncio
async def test_delete_classe(auth_client: AsyncClient):
    db = auth_client.db
    user = auth_client.test_user
    cls = await _create_classe(db, user.id)

    resp = await auth_client.delete(f"/api/classes/{cls.id}")
    assert resp.status_code == 204

    resp = await auth_client.get(f"/api/classes/{cls.id}")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_get_classe_stats(auth_client: AsyncClient):
    db = auth_client.db
    user = auth_client.test_user
    cls = await _create_classe(db, user.id, nom="CM2 Stats", niveau="CM2")

    resp = await auth_client.get(f"/api/classes/{cls.id}/stats")
    assert resp.status_code == 200
    data = resp.json()
    assert "total_eleves" in data
    assert "moyenne_generale" in data
    assert "eleves" in data
    assert isinstance(data["eleves"], list)


@pytest.mark.asyncio
async def test_get_classe_stats_unauthorized(auth_client: AsyncClient):
    """Stats for a class belonging to another user must return 404."""
    db = auth_client.db
    other = await create_test_user(db, email="other2@example.com", password="pw2")
    cls = await _create_classe(db, other.id, nom="Other")

    resp = await auth_client.get(f"/api/classes/{cls.id}/stats")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_list_classes_requires_auth(client: AsyncClient, db_session):
    # HTTPBearer returns 403 when no Authorization header is present
    resp = await client.get("/api/classes")
    assert resp.status_code in (401, 403)
