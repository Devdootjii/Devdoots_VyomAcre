"""
routes/auth_api.py
Divyansh — Phase 1: authentication endpoints.
  T1 (14 Sep): POST /api/auth/signup
  T2 (15 Sep): POST /api/auth/login, GET /api/auth/me
"""

import logging

from fastapi import APIRouter, Depends
from sqlalchemy import or_
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from auth_dependency import get_current_user
from auth_models import User
from auth_schemas import LoginRequest, SignupRequest, UserPublic
from auth_utils import create_access_token, hash_password, verify_password
from database import get_db
from utils.response_helper import error_response, success_response

logger = logging.getLogger("vyomacre.auth_api")

router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.post("/signup", status_code=201)
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    """
    Register a new user (owner or seeker — never admin, see SignupRole).
    Returns a token immediately so the frontend can auto-login right after
    signup, without a separate login call.
    """
    try:
        existing = (
            db.query(User)
            .filter(or_(User.email == payload.email, User.phone == payload.phone))
            .first()
        )
        if existing is not None:
            conflicting_field = "email" if existing.email == payload.email else "phone"
            return error_response(
                message="An account with this email or phone already exists.",
                code=409,
                error_details={"conflicting_field": conflicting_field},
            )

        user = User(
            name=payload.name,
            email=payload.email,
            phone=payload.phone,
            password_hash=hash_password(payload.password),
            role=payload.role.value,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        token = create_access_token(user_id=str(user.id), role=user.role)

        return success_response(
            message="User created",
            data={
                "user_id": str(user.id),
                "token": token,
                "user": UserPublic.model_validate(user).model_dump(),
            },
            code=201,
        )

    except SQLAlchemyError as db_err:
        db.rollback()
        logger.exception("Database error during signup")
        return error_response(
            message="Could not create the account due to a database error.",
            code=500,
            error_details={"reason": str(db_err.__class__.__name__)},
        )


@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """
    Verify email + password, return a fresh JWT on success.

    Intentionally returns the same generic 401 message whether the email
    doesn't exist or the password is wrong — never reveal which one it
    was, so an attacker can't use this endpoint to enumerate registered
    emails.
    """
    try:
        user = db.query(User).filter(User.email == payload.email).first()

        if user is None or not verify_password(payload.password, user.password_hash):
            return error_response(
                message="Incorrect email or password.",
                code=401,
            )

        token = create_access_token(user_id=str(user.id), role=user.role)

        return success_response(
            message="Login successful.",
            data={
                "token": token,
                "user": UserPublic.model_validate(user).model_dump(),
            },
            code=200,
        )

    except SQLAlchemyError as db_err:
        logger.exception("Database error during login")
        return error_response(
            message="Could not log in due to a database error.",
            code=500,
            error_details={"reason": str(db_err.__class__.__name__)},
        )


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    """Returns the profile of whoever the bearer token belongs to."""
    return success_response(
        message="Current user fetched successfully.",
        data=UserPublic.model_validate(current_user).model_dump(),
        code=200,
    )