"""Utility helpers for password hashing and token creation."""
from __future__ import annotations

import base64
import hashlib
import secrets
from typing import Tuple

PBKDF2_ITERATIONS = 48_000
TOKEN_BYTES = 24


def hash_password(password: str, salt: str | None = None) -> Tuple[str, str]:
    if salt is None:
        salt = base64.urlsafe_b64encode(secrets.token_bytes(16)).decode("ascii")
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), PBKDF2_ITERATIONS)
    return base64.urlsafe_b64encode(dk).decode("ascii"), salt


def verify_password(password: str, password_hash: str, salt: str) -> bool:
    computed, _ = hash_password(password, salt)
    return secrets.compare_digest(computed, password_hash)


def create_session_token() -> str:
    return base64.urlsafe_b64encode(secrets.token_bytes(TOKEN_BYTES)).decode("ascii")

__all__ = ["hash_password", "verify_password", "create_session_token"]
