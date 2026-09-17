"""
auth_schemas.py
Divyansh — Phase 1, T1/T2: request/response schemas for authentication.

Kept separate from the main schemas.py (roofs/leases/zones) so the auth
module is self-contained: auth_models.py + auth_schemas.py + auth_utils.py
+ routes/auth_api.py + auth_dependency.py.
"""

import re
import uuid
from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field, field_validator


class SignupRole(str, Enum):
    """
    Public signup only allows these two — 'admin' is intentionally NOT
    selectable here. An admin account should never be creatable through an
    open endpoint; it has to be granted directly in the database (or by
    another admin, once that flow exists). Otherwise T5's require_admin
    checks would be trivially bypassable by anyone who signs up and picks
    "admin" as their role.
    """
    owner = "owner"
    seeker = "seeker"


class SignupRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=120, examples=["Ramesh Gupta"])
    email: str = Field(..., max_length=255, examples=["ramesh@example.com"])
    phone: str = Field(..., min_length=10, max_length=15, examples=["9876543210"])
    password: str = Field(..., min_length=6, max_length=128, examples=["secret123"])
    role: SignupRole = Field(default=SignupRole.seeker, examples=["owner"])

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        # Deliberately not pulling in the `email-validator` package for one
        # field — same lightweight-regex approach schemas.py already uses
        # for phone_number, kept consistent across the codebase.
        if "@" not in value or "." not in value.split("@")[-1]:
            raise ValueError("Enter a valid email address.")
        return value.strip().lower()

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: str) -> str:
        if not re.fullmatch(r"\d{10}", value):
            raise ValueError("Phone number must be exactly 10 digits.")
        return value


class LoginRequest(BaseModel):
    email: str = Field(..., examples=["ramesh@example.com"])
    password: str = Field(..., examples=["secret123"])


class UserOut(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    phone: str
    role: str
    created_at: datetime

    model_config = {"from_attributes": True}


class UserPublic(BaseModel):
    """Slimmer shape for embedding inside login/signup responses (no id/created_at)."""
    name: str
    email: str
    phone: str
    role: str

    model_config = {"from_attributes": True}