"""
auth_utils.py
Divyansh — Phase 1, T1: password hashing + JWT helpers.

Shared by:
  - routes/auth_api.py (T1 signup, T2 login, GET /me)
  - auth_dependency.py (T3 middleware — decodes the token on every
    protected request)

Kept as one small module so the hashing scheme and JWT settings are
defined in exactly one place — T1/T2/T3 all reuse this instead of each
reimplementing their own version.
"""

from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext

from config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, password_hash: str) -> bool:
    return pwd_context.verify(plain_password, password_hash)


def create_access_token(user_id: str, role: str) -> str:
    """
    Builds a JWT carrying {user_id, role, exp}. `role` is embedded so
    require_owner/require_seeker/require_admin (T3) can check it without
    an extra DB lookup on every request.
    """
    expire = datetime.now(timezone.utc) + timedelta(days=settings.JWT_EXPIRY_DAYS)
    payload = {"user_id": user_id, "role": role, "exp": expire}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> dict:
    """
    Raises jose.JWTError on any invalid/expired/tampered token — callers
    (auth_dependency.py, T3) are expected to catch this and turn it into a
    401 response.
    """
    return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])


__all__ = ["hash_password", "verify_password", "create_access_token", "decode_access_token", "JWTError"]