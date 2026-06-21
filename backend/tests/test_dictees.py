"""Integration tests for /api/dictees."""

import pytest
from httpx import AsyncClient

from app.models.dictee import Dictee, NiveauEnum, PeriodeEnum, TempsEnum
from tests.conftest import create_test_user


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

DICTEE_PAYLOAD = {
    "titre": "La forêt",
    "niveau": "CE2",
    "periode": "P2",
    "temps": "Présent",
    "texte": "Les arbres sont grands.",
    "errors": {
        "conjugaison": 1,
        "homophone": 0,
        "accord": 2,
        "majuscule": 0,
        "ponctuation": 0,
        "infinitif": 0,
        "orthographe": 1,
        "nonPresent": 0,
        "son": 0,
    },
}


async def _create_dictee(db, user_id: int, titre: str = "Test dictée", niveau: str = "CE2", periode: str = "P1") -> Dictee:
    d = Dictee(
        user_id=user_id,
        titre=titre,
        niveau=NiveauEnum(niveau),
        periode=periode,
        temps=TempsEnum.present,
        texte="Texte de test.",
        err_conjugaison=0,
        err_homophone=0,
        err_accord=0,
        err_majuscule=0,
        err_ponctuation=0,
        err_infinitif=0,
        err_orthographe=0,
        err_non_present=0,
        err_son=0,
    )
    db.add(d)
    await db.commit()
    await db.refresh(d)
    return d


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_list_dictees_empty(auth_client: AsyncClient):
    resp = await auth_client.get("/api/dictees")
    assert resp.status_code == 200
    assert resp.json() == []


@pytest.mark.asyncio
async def test_create_dictee(auth_client: AsyncClient):
    resp = await auth_client.post("/api/dictees", json=DICTEE_PAYLOAD)
    assert resp.status_code == 201
    data = resp.json()
    assert data["titre"] == "La forêt"
    assert data["niveau"] == "CE2"
    assert data["errors"]["conjugaison"] == 1
    assert data["errors"]["accord"] == 2


@pytest.mark.asyncio
async def test_create_dictee_missing_field_returns_422(auth_client: AsyncClient):
    incomplete = {k: v for k, v in DICTEE_PAYLOAD.items() if k != "texte"}
    resp = await auth_client.post("/api/dictees", json=incomplete)
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_get_dictee_by_id(auth_client: AsyncClient):
    db = auth_client.db
    user = auth_client.test_user
    dictee = await _create_dictee(db, user.id, titre="Dictée unique")

    resp = await auth_client.get(f"/api/dictees/{dictee.id}")
    assert resp.status_code == 200
    assert resp.json()["titre"] == "Dictée unique"


@pytest.mark.asyncio
async def test_get_dictee_not_found(auth_client: AsyncClient):
    resp = await auth_client.get("/api/dictees/99999")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_get_dictee_other_user_is_404(auth_client: AsyncClient):
    db = auth_client.db
    other = await create_test_user(db, email="other@example.com", password="pw")
    dictee = await _create_dictee(db, other.id)

    resp = await auth_client.get(f"/api/dictees/{dictee.id}")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_update_dictee(auth_client: AsyncClient):
    db = auth_client.db
    user = auth_client.test_user
    dictee = await _create_dictee(db, user.id, titre="Old title")

    resp = await auth_client.put(f"/api/dictees/{dictee.id}", json={"titre": "New title"})
    assert resp.status_code == 200
    assert resp.json()["titre"] == "New title"


@pytest.mark.asyncio
async def test_delete_dictee(auth_client: AsyncClient):
    db = auth_client.db
    user = auth_client.test_user
    dictee = await _create_dictee(db, user.id)

    resp = await auth_client.delete(f"/api/dictees/{dictee.id}")
    assert resp.status_code == 204

    resp = await auth_client.get(f"/api/dictees/{dictee.id}")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_filter_dictees_by_niveau(auth_client: AsyncClient):
    db = auth_client.db
    user = auth_client.test_user
    await _create_dictee(db, user.id, titre="CE1 dictée", niveau="CE1")
    await _create_dictee(db, user.id, titre="CM1 dictée", niveau="CM1")

    resp = await auth_client.get("/api/dictees?niveau=CE1")
    assert resp.status_code == 200
    data = resp.json()
    assert all(d["niveau"] == "CE1" for d in data)
    assert any(d["titre"] == "CE1 dictée" for d in data)


@pytest.mark.asyncio
async def test_filter_dictees_by_periode(auth_client: AsyncClient):
    db = auth_client.db
    user = auth_client.test_user
    await _create_dictee(db, user.id, titre="P1 dictée", periode="P1")
    await _create_dictee(db, user.id, titre="P3 dictée", periode="P3")

    resp = await auth_client.get("/api/dictees?periode=P3")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["titre"] == "P3 dictée"


@pytest.mark.asyncio
async def test_list_dictees_requires_auth(client: AsyncClient, db_session):
    # HTTPBearer returns 403 when no Authorization header is present
    resp = await client.get("/api/dictees")
    assert resp.status_code in (401, 403)
