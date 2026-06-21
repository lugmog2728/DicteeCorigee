"""Unit tests for app/core/security.py — no DB, no HTTP."""

import time
import pytest
from jose import jwt

from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_token,
    SECRET_KEY,
    ALGORITHM,
)


def test_hash_password_returns_string():
    hashed = hash_password("mypassword")
    assert isinstance(hashed, str)
    assert len(hashed) > 0


def test_hash_password_is_not_plaintext():
    plain = "mypassword"
    hashed = hash_password(plain)
    assert plain not in hashed


def test_verify_password_correct():
    plain = "correct_horse_battery"
    hashed = hash_password(plain)
    assert verify_password(plain, hashed) is True


def test_verify_password_wrong():
    hashed = hash_password("rightpassword")
    assert verify_password("wrongpassword", hashed) is False


def test_hash_password_different_salts():
    """Two hashes for the same password must differ (bcrypt salting)."""
    p = "samepassword"
    h1 = hash_password(p)
    h2 = hash_password(p)
    assert h1 != h2


def test_create_access_token_returns_string():
    token = create_access_token(42)
    assert isinstance(token, str)
    # Must be a decodable JWT with three dot-separated parts
    assert token.count(".") == 2


def test_create_access_token_contains_user_id():
    user_id = 99
    token = create_access_token(user_id)
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    assert payload["sub"] == str(user_id)


def test_create_access_token_has_expiry():
    token = create_access_token(1)
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    assert "exp" in payload
    # Expiry should be in the future
    assert payload["exp"] > time.time()


def test_decode_token_valid():
    token = create_access_token(7)
    result = decode_token(token)
    assert result == 7


def test_decode_token_invalid_returns_none():
    result = decode_token("not.a.valid.token")
    assert result is None


def test_decode_token_tampered_returns_none():
    token = create_access_token(5)
    tampered = token[:-4] + "XXXX"
    assert decode_token(tampered) is None
