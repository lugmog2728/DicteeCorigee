"""Integration tests for /api/planifications."""

import datetime
import pytest
from httpx import AsyncClient

from app.models.classe import Classe
from app.models.dictee import Dictee, NiveauEnum, PeriodeEnum, TempsEnum
from app.models.planification import Planification
from tests.conftest import create_test_user


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

async def _create_classe(db, user_id: int, nom: str = "CM1 A", nb_eleves: int = 25) -> Classe:
    cls = Classe(
        user_id=user_id,
        nom=nom,
        niveau=NiveauEnum.CM1,
        annee_scolaire="2025-2026",
        nb_eleves=nb_eleves,
    )
    db.add(cls)
    await db.commit()
    await db.refresh(cls)
    return cls


async def _create_dictee(db, user_id: int) -> Dictee:
    d = Dictee(
        user_id=user_id,
        titre="Planif dictée",
        niveau=NiveauEnum.CM1,
        periode="P2",
        temps=TempsEnum.imparfait,
        texte="La pluie tombait doucement.",
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


async def _create_planification(
    db,
    user_id: int,
    classe_id: int,
    dictee_id: int,
    date_prevue: datetime.date | None = None,
) -> Planification:
    p = Planification(
        user_id=user_id,
        classe_id=classe_id,
        dictee_id=dictee_id,
        date_prevue=date_prevue or datetime.date.today(),
        types_neutralises="[]",
    )
    db.add(p)
    await db.commit()
    await db.refresh(p)
    return p


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_list_planifications_empty(auth_client: AsyncClient):
    resp = await auth_client.get("/api/planifications")
    assert resp.status_code == 200
    assert resp.json() == []


@pytest.mark.asyncio
async def test_create_planification(auth_client: AsyncClient):
    db = auth_client.db
    user = auth_client.test_user
    cls = await _create_classe(db, user.id)
    dictee = await _create_dictee(db, user.id)

    resp = await auth_client.post(
        "/api/planifications",
        json={
            "classe_id": cls.id,
            "dictee_id": dictee.id,
            "date_prevue": str(datetime.date.today()),
            "types_neutralises": [],
        },
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["classe_id"] == cls.id
    assert data["dictee_id"] == dictee.id
    assert data["nb_corriges"] == 0
    assert data["types_neutralises"] == []


@pytest.mark.asyncio
async def test_create_planification_unknown_classe_returns_404(auth_client: AsyncClient):
    db = auth_client.db
    user = auth_client.test_user
    dictee = await _create_dictee(db, user.id)

    resp = await auth_client.post(
        "/api/planifications",
        json={
            "classe_id": 99999,
            "dictee_id": dictee.id,
            "date_prevue": str(datetime.date.today()),
        },
    )
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_list_planifications_returns_detail(auth_client: AsyncClient):
    db = auth_client.db
    user = auth_client.test_user
    cls = await _create_classe(db, user.id, nom="CE2 Test")
    dictee = await _create_dictee(db, user.id)
    await _create_planification(db, user.id, cls.id, dictee.id)

    resp = await auth_client.get("/api/planifications")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    item = data[0]
    assert item["classe_nom"] == "CE2 Test"
    assert item["dictee_titre"] == "Planif dictée"
    assert "statut" in item


@pytest.mark.asyncio
async def test_update_planification(auth_client: AsyncClient):
    db = auth_client.db
    user = auth_client.test_user
    cls = await _create_classe(db, user.id)
    dictee = await _create_dictee(db, user.id)
    planif = await _create_planification(db, user.id, cls.id, dictee.id)

    new_date = str(datetime.date.today() + datetime.timedelta(days=7))
    resp = await auth_client.put(
        f"/api/planifications/{planif.id}",
        json={"date_prevue": new_date},
    )
    assert resp.status_code == 200
    assert resp.json()["date_prevue"] == new_date


@pytest.mark.asyncio
async def test_update_planification_not_found(auth_client: AsyncClient):
    resp = await auth_client.put(
        "/api/planifications/99999",
        json={"nb_corriges": 5},
    )
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_delete_planification(auth_client: AsyncClient):
    db = auth_client.db
    user = auth_client.test_user
    cls = await _create_classe(db, user.id)
    dictee = await _create_dictee(db, user.id)
    planif = await _create_planification(db, user.id, cls.id, dictee.id)

    resp = await auth_client.delete(f"/api/planifications/{planif.id}")
    assert resp.status_code == 204

    # After deletion the list should be empty
    resp = await auth_client.get("/api/planifications")
    assert resp.json() == []


@pytest.mark.asyncio
async def test_get_stats_empty(auth_client: AsyncClient):
    resp = await auth_client.get("/api/planifications/stats")
    assert resp.status_code == 200
    data = resp.json()
    assert data["cette_semaine"] == 0
    assert data["en_attente"] == 0
    assert data["classes_actives"] == 0
    assert data["taux_completion"] == 0.0


@pytest.mark.asyncio
async def test_get_stats_with_data(auth_client: AsyncClient):
    db = auth_client.db
    user = auth_client.test_user
    cls = await _create_classe(db, user.id, nb_eleves=10)
    dictee = await _create_dictee(db, user.id)

    # Two planifications this week
    today = datetime.date.today()
    await _create_planification(db, user.id, cls.id, dictee.id, date_prevue=today)
    await _create_planification(db, user.id, cls.id, dictee.id, date_prevue=today)

    resp = await auth_client.get("/api/planifications/stats")
    assert resp.status_code == 200
    data = resp.json()
    assert data["cette_semaine"] == 2
    assert data["en_attente"] == 2
    assert data["classes_actives"] == 1


@pytest.mark.asyncio
async def test_list_planifications_requires_auth(client: AsyncClient, db_session):
    # HTTPBearer returns 403 when no Authorization header is present
    resp = await client.get("/api/planifications")
    assert resp.status_code in (401, 403)
