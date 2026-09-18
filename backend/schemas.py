"""
schemas.py
Pydantic v2 schemas for request validation and the standardized
API response envelope used across VyomAcre.
"""

import uuid
from datetime import datetime
from enum import Enum
from typing import Any, Generic, Optional, TypeVar

from pydantic import BaseModel, Field, field_validator


# ---------------------------------------------------------------------------
# Domain enums / shared types
# ---------------------------------------------------------------------------

class RoofType(str, Enum):
    flat = "flat"
    sloped = "sloped"
    tin = "tin"
    concrete = "concrete"
    other = "other"


class RoofStatus(str, Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
    leased = "leased"


class VerificationStatus(str, Enum):
    """Day 4 — automatic GEE area-verification result, separate from RoofStatus."""
    pending_verification = "pending_verification"
    verified = "verified"
    flagged = "flagged"
    verification_failed = "verification_failed"


class LeaseStatus(str, Enum):
    """Day 9 — lifecycle of a company's lease request for a roof."""
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"


class LeaseStatusUpdate(str, Enum):
    """
    Restricted subset for PATCH /api/lease-requests/{id} — an owner can only
    move a request to accepted or rejected, never back to pending.
    """
    accepted = "accepted"
    rejected = "rejected"


# ---------------------------------------------------------------------------
# Roof onboarding — request / response contract
# ---------------------------------------------------------------------------

class RoofListingCreate(BaseModel):
    """Payload for POST /api/roofs/add"""

    # owner_name / phone_number: kept accepted-but-optional here purely for
    # backward compatibility with Harsh's OwnerForm.jsx, which may still send
    # them. auth_dependency's require_owner + roof_api.py always overwrite
    # these from the authenticated user (current_user.name / .phone) — see
    # the T3 deviation note in roof_api.py — so they must NOT be required
    # on the request body, or every submission 422s before reaching the route.
    owner_name: Optional[str] = Field(
        default=None, min_length=2, max_length=120, examples=["Ramesh Gupta"]
    )
    phone_number: Optional[str] = Field(
        default=None, min_length=10, max_length=15, examples=["+919876543210"]
    )
    # Optional per PDF spec: "estimated_area_sqft (optional, GEE bhi calculate
    # karega)". If the owner doesn't provide one, GEE's polygon-based estimate
    # (gee_estimated_area_sqft) is the source of truth once verification runs.
    area_sqft: Optional[float] = Field(default=None, gt=0, examples=[1200.5])
    roof_type: RoofType = Field(..., examples=["flat"])
    latitude: float = Field(..., ge=-90, le=90, examples=[26.8467])
    longitude: float = Field(..., ge=-180, le=180, examples=[80.9462])

    @field_validator("phone_number")
    @classmethod
    def validate_phone(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        digits = value.replace("+", "").strip()
        if not digits.isdigit():
            raise ValueError("phone_number must contain only digits (optionally prefixed with '+')")
        return value


class RoofListingOut(BaseModel):
    id: uuid.UUID
    owner_name: str
    phone_number: str
    area_sqft: float
    roof_type: str
    latitude: float
    longitude: float
    status: RoofStatus
    verification_status: VerificationStatus
    gee_estimated_area_sqft: Optional[float] = None
    verification_message: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class RoofStatusUpdatable(str, Enum):
    """
    Fix 6 (Divyansh's fix list) — restricted subset for
    PATCH /api/roofs/{roof_id}/status. Admin can only move a roof to
    approved or rejected here; "pending" is the automatic starting state
    and "leased" is set automatically when a lease request is accepted
    (Fix 7) — neither should be settable directly through this endpoint.
    """
    approved = "approved"
    rejected = "rejected"


class RoofStatusUpdate(BaseModel):
    """Payload for PATCH /api/roofs/{roof_id}/status"""

    status: RoofStatusUpdatable = Field(..., examples=["approved"])


# ---------------------------------------------------------------------------
# Lease requests — Day 9 (Company -> Owner)
# ---------------------------------------------------------------------------

class LeaseRequestCreate(BaseModel):
    """Payload for POST /api/lease-requests"""

    roof_id: uuid.UUID = Field(..., examples=["5ff2ef80-2384-4fb7-a5bd-0da3fe5a56b2"])
    company_name: str = Field(..., min_length=2, max_length=150, examples=["SolarCorp"])


class LeaseRequestStatusUpdate(BaseModel):
    """Payload for PATCH /api/lease-requests/{id}"""

    status: LeaseStatusUpdate = Field(..., examples=["accepted"])


class LeaseRequestOut(BaseModel):
    id: uuid.UUID
    roof_id: uuid.UUID
    company_name: str
    # Identity & privacy fix: the sending seeker's user id, taken from the
    # token at creation time. Optional/None on legacy rows created before
    # this column existed (test data) — see migrate_add_seeker_id.py.
    seeker_id: Optional[uuid.UUID] = None
    status: LeaseStatus
    created_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Scanned zones — Day 8 (Admin Radar Map)
# ---------------------------------------------------------------------------

class ScannedZoneOut(BaseModel):
    """
    Shape matches the Day 8 API contract for GET /api/zones/scanned:
    grid_id, status, bounding box (north/south/east/west), scanned_at.
    """

    grid_id: str
    status: str
    north: float
    south: float
    east: float
    west: float
    gee_estimated_area_sqft: Optional[float] = None
    scanned_at: datetime


# ---------------------------------------------------------------------------
# Standardized response envelope
# ---------------------------------------------------------------------------

T = TypeVar("T")


class SuccessResponse(BaseModel, Generic[T]):
    status: str = "success"
    code: int = 200
    message: str
    data: Optional[T] = None


class ErrorResponse(BaseModel):
    status: str = "error"
    code: int = 400
    message: str
    error_details: Optional[Any] = None