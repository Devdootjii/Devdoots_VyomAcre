"""
auth_dependency.py
Divyansh — Phase 1, T3: auth middleware (built a bit early, in T2, since
GET /api/auth/me can't work without it).

get_current_user() is the base dependency every protected route uses.
require_owner / require_seeker / require_admin (added in T3 proper) will
wrap this same function with a role check on top.
"""

import uuid

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from auth_models import RoleEnum, User
from auth_utils import JWTError, decode_access_token
from database import get_db

# auto_error=False so a missing header raises OUR 401 (with a clear message)
# instead of FastAPI's default "Not authenticated" — kept consistent with
# the rest of the app's standardized error envelope (main.py's
# StarletteHTTPException handler wraps whatever we raise here).
_bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Reads `Authorization: Bearer <token>`, decodes it, and loads the
    matching user from the DB. Raises 401 for any failure mode (missing
    header, invalid/expired token, or a token for a user that no longer
    exists) — never leaks *why* beyond that, to avoid hinting at valid
    user IDs to an attacker probing the endpoint.
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication token.",
        )

    try:
        payload = decode_access_token(credentials.credentials)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
        )

    raw_user_id = payload.get("user_id")
    try:
        # JWT payload always carries user_id as a string (JSON has no UUID
        # type), but User.id is a native UUID column — SQLAlchemy's UUID
        # bind-processor calls .hex on the value, which only exists on a
        # real uuid.UUID, not on str. Convert before querying.
        user_id = uuid.UUID(raw_user_id)
    except (ValueError, TypeError, AttributeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
        )

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
        )

    return user


def require_owner(current_user: User = Depends(get_current_user)) -> User:
    """Gate for routes only an 'owner' account may call. Returns the user
    (not just a bool) so the route can use it — e.g. to check they own the
    specific roof/lease being acted on, not just that their role is right."""
    if current_user.role != RoleEnum.owner.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This action requires an owner account.",
        )
    return current_user


def require_seeker(current_user: User = Depends(get_current_user)) -> User:
    """Gate for routes only a 'seeker' (company) account may call."""
    if current_user.role != RoleEnum.seeker.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This action requires a seeker account.",
        )
    return current_user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Gate for routes only an 'admin' account may call."""
    if current_user.role != RoleEnum.admin.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This action requires an admin account.",
        )
    return current_user