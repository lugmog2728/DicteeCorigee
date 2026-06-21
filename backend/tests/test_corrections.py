"""Integration tests for /api/corrections."""

import io
import pytest
from httpx import AsyncClient

from app.models.dictee import Dictee, NiveauEnum, PeriodeEnum, TempsEnum
from app.models.classe import Classe
from app.models.planification import Planification
from tests.conftest import create_test_user

import datetime


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

async def _create_dictee(db, user_id: int) -> Dictee:
    d = Dictee(
        user_id=user_id,
        titre="Dictée correction test",
        niveau=NiveauEnum.CE2,
        periode="P1",
        temps=TempsEnum.present,
        texte="Il fait beau.",
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


async def _create_classe(db, user_id: int) -> Classe:
    cls = Classe(
        user_id=user_id,
        nom="CE2 Z",
        niveau=NiveauEnum.CE2,
        annee_scolaire="2025-2026",
        nb_eleves=10,
    )
    db.add(cls)
    await db.commit()
    await db.refresh(cls)
    return cls


async def _create_planification(db, user_id: int, classe_id: int, dictee_id: int) -> Planification:
    p = Planification(
        user_id=user_id,
        classe_id=classe_id,
        dictee_id=dictee_id,
        date_prevue=datetime.date.today(),
        types_neutralises="[]",
    )
    db.add(p)
    await db.commit()
    await db.refresh(p)
    return p


def _correction_form(dictee_id: int, score: int = 85, nb_errors: int = 2, **kwargs):
    data = {
        "dictee_id": str(dictee_id),
        "score": str(score),
        "nb_errors": str(nb_errors),
        "student_name": "Élève Test",
        "err_conjugaison": "0",
        "err_homophone": "0",
        "err_accord": str(nb_errors),
        "err_majuscule": "0",
        "err_ponctuation": "0",
        "err_infinitif": "0",
        "err_orthographe": "0",
        "err_non_present": "0",
        "err_son": "0",
    }
    data.update({k: str(v) for k, v in kwargs.items()})
    return data


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_create_correction_minimal(auth_client: AsyncClient):
    db = auth_client.db
    user = auth_client.test_user
    dictee = await _create_dictee(db, user.id)

    resp = await auth_client.post(
        "/api/corrections",
        data=_correction_form(dictee.id),
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["score"] == 85
    assert data["nb_errors"] == 2
    assert data["dictee_id"] == dictee.id
    assert data["user_id"] == user.id


@pytest.mark.asyncio
async def test_create_correction_with_image(auth_client: AsyncClient):
    db = auth_client.db
    user = auth_client.test_user
    dictee = await _create_dictee(db, user.id)

    fake_image = io.BytesIO(b"\xff\xd8\xff\xe0" + b"\x00" * 100)  # minimal JPEG header
    resp = await auth_client.post(
        "/api/corrections",
        data=_correction_form(dictee.id, score=70, nb_errors=5),
        files={"image": ("photo.jpg", fake_image, "image/jpeg")},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["image_path"] is not None
    assert "corrections" in data["image_path"]


@pytest.mark.asyncio
async def test_create_correction_missing_required_fields_returns_422(auth_client: AsyncClient):
    """Posting with no data should fail schema validation (Form required fields)."""
    resp = await auth_client.post("/api/corrections", data={})
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_list_corrections_empty(auth_client: AsyncClient):
    resp = await auth_client.get("/api/corrections")
    assert resp.status_code == 200
    assert resp.json() == []


@pytest.mark.asyncio
async def test_list_corrections_returns_own(auth_client: AsyncClient):
    db = auth_client.db
    user = auth_client.test_user
    dictee = await _create_dictee(db, user.id)

    await auth_client.post("/api/corrections", data=_correction_form(dictee.id))
    await auth_client.post("/api/corrections", data=_correction_form(dictee.id, score=60, nb_errors=6))

    resp = await auth_client.get("/api/corrections")
    assert resp.status_code == 200
    assert len(resp.json()) == 2


@pytest.mark.asyncio
async def test_list_corrections_filter_by_planification_id(auth_client: AsyncClient):
    db = auth_client.db
    user = auth_client.test_user
    dictee = await _create_dictee(db, user.id)
    classe = await _create_classe(db, user.id)
    planif = await _create_planification(db, user.id, classe.id, dictee.id)

    # Correction linked to planification
    await auth_client.post(
        "/api/corrections",
        data=_correction_form(dictee.id, planification_id=planif.id),
    )
    # Correction NOT linked to any planification
    await auth_client.post("/api/corrections", data=_correction_form(dictee.id))

    resp = await auth_client.get(f"/api/corrections?planification_id={planif.id}")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["planification_id"] == planif.id


@pytest.mark.asyncio
async def test_get_correction_by_id(auth_client: AsyncClient):
    db = auth_client.db
    user = auth_client.test_user
    dictee = await _create_dictee(db, user.id)

    create_resp = await auth_client.post("/api/corrections", data=_correction_form(dictee.id))
    corr_id = create_resp.json()["id"]

    resp = await auth_client.get(f"/api/corrections/{corr_id}")
    assert resp.status_code == 200
    assert resp.json()["id"] == corr_id


@pytest.mark.asyncio
async def test_get_correction_not_found(auth_client: AsyncClient):
    resp = await auth_client.get("/api/corrections/99999")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_list_corrections_requires_auth(client: AsyncClient, db_session):
    # HTTPBearer returns 403 when no Authorization header is present
    resp = await client.get("/api/corrections")
    assert resp.status_code in (401, 403)
