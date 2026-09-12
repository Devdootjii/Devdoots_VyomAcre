"""
routes/roof_api.py
Roof onboarding endpoints for VyomAcre.
"""

import logging
import uuid
from typing import Optional

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from database import get_db
from models import RoofListing, RoofStatusEnum, VerificationStatusEnum
from schemas import RoofListingCreate, RoofListingOut, RoofStatusUpdate
from services.verification_service import run_area_verification
from utils.response_helper import error_response, success_response

logger = logging.getLogger("vyomacre.roof_api")

router = APIRouter(prefix="/api/roofs", tags=["Roofs"])


@router.post("/add")
def add_roof_listing(
    payload: RoofListingCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """
    Onboard a new rooftop listing.

    Request validation is handled by `RoofListingCreate` (schemas.py).
    Any validation failure is caught globally by the RequestValidationError
    handler registered in main.py, which returns the standardized error
    envelope automatically.

    Day 4: after the listing is saved, a background task (run_area_verification)
    is scheduled to cross-check the submitted area against a GEE-estimated
    polygon area. This runs *after* the response is sent — the owner does
    not wait on a GEE round-trip to get their success response.
    """
    try:
        new_roof = RoofListing(
            owner_name=payload.owner_name,
            phone_number=payload.phone_number,
            area_sqft=payload.area_sqft,
            roof_type=payload.roof_type.value,
            latitude=payload.latitude,
            longitude=payload.longitude,
        )

        db.add(new_roof)
        db.commit()
        db.refresh(new_roof)

        background_tasks.add_task(
            run_area_verification,
            new_roof.id,
            payload.latitude,
            payload.longitude,
            payload.area_sqft,
        )

        return success_response(
            message="Roof listing added successfully. Area verification is running in the background.",
            data=RoofListingOut.model_validate(new_roof),
            code=200,
        )

    except SQLAlchemyError as db_err:
        db.rollback()
        logger.exception("Database error while adding roof listing")
        return error_response(
            message="Failed to save roof listing due to a database error.",
            code=500,
            error_details={"reason": str(db_err.__class__.__name__)},
        )

    except Exception as exc:  # noqa: BLE001 - final safety net for unexpected errors
        db.rollback()
        logger.exception("Unexpected error while adding roof listing")
        return error_response(
            message="An unexpected error occurred while adding the roof listing.",
            code=500,
            error_details={"reason": str(exc)},
        )


@router.get("")
def get_roof_listings(
    status_filter: Optional[RoofStatusEnum] = Query(
        default=None,
        alias="status",
        description="Optional filter on admin approval status, e.g. ?status=approved",
    ),
    verification_filter: Optional[VerificationStatusEnum] = Query(
        default=None,
        alias="verification",
        description="Optional filter on GEE verification status, e.g. ?verification=verified",
    ),
    min_area: Optional[float] = Query(
        default=None,
        ge=0,
        description="Optional minimum area_sqft filter, e.g. ?min_area=500",
    ),
    roof_type: Optional[str] = Query(
        default=None,
        description="Optional roof type filter, e.g. ?roof_type=flat",
    ),
    owner_id: Optional[str] = Query(
        default=None,
        description=(
            "Optional owner filter (Day 9 API contract), e.g. ?owner_id=9876543210. "
            "Same lookup as GET /api/roofs/owner/{phone_number} — owners are "
            "identified by phone_number, there's no separate Owner table yet."
        ),
    ),
    db: Session = Depends(get_db),
):
    """
    Fetch roof listings, with optional filters (Day 3 base + Day 5-7
    additions for Ritesh's Company Marketplace filters — Min Area,
    Property Type — Day 9's owner_id filter, and verification-status
    filtering so only GEE-verified pins can be shown on the map if desired).

    Always returns through the standardized `success_response` wrapper,
    even when the result set is empty — an empty list is not an error.
    """
    try:
        query = db.query(RoofListing)

        if status_filter is not None:
            query = query.filter(RoofListing.status == status_filter.value)

        if verification_filter is not None:
            query = query.filter(RoofListing.verification_status == verification_filter.value)

        if min_area is not None:
            query = query.filter(RoofListing.area_sqft >= min_area)

        if roof_type is not None:
            query = query.filter(RoofListing.roof_type == roof_type)

        if owner_id is not None:
            query = query.filter(RoofListing.phone_number == owner_id)

        roofs = query.order_by(RoofListing.created_at.desc()).all()

        return success_response(
            message="Roof listings fetched successfully.",
            data=[RoofListingOut.model_validate(roof) for roof in roofs],
            code=200,
        )

    except SQLAlchemyError as db_err:
        logger.exception("Database error while fetching roof listings")
        return error_response(
            message="Failed to fetch roof listings due to a database error.",
            code=500,
            error_details={"reason": str(db_err.__class__.__name__)},
        )

    except Exception as exc:  # noqa: BLE001 - final safety net for unexpected errors
        logger.exception("Unexpected error while fetching roof listings")
        return error_response(
            message="An unexpected error occurred while fetching roof listings.",
            code=500,
            error_details={"reason": str(exc)},
        )


@router.get("/owner/{phone_number}")
def get_roofs_by_owner(phone_number: str, db: Session = Depends(get_db)):
    """
    Fetch all listings submitted by one owner (Day 5-7 — Harsh's Owner
    Status Dashboard). Owners don't know their listing's UUID, but they
    do know their own phone number, so that's the lookup key here.
    """
    try:
        roofs = (
            db.query(RoofListing)
            .filter(RoofListing.phone_number == phone_number)
            .order_by(RoofListing.created_at.desc())
            .all()
        )

        return success_response(
            message=f"Fetched {len(roofs)} listing(s) for this owner.",
            data=[RoofListingOut.model_validate(roof) for roof in roofs],
            code=200,
        )

    except SQLAlchemyError as db_err:
        logger.exception("Database error while fetching owner's roof listings")
        return error_response(
            message="Failed to fetch listings due to a database error.",
            code=500,
            error_details={"reason": str(db_err.__class__.__name__)},
        )


@router.get("/verified")
def get_verified_roof_listings(db: Session = Depends(get_db)):
    """
    Day 9 convenience endpoint — same data as GET /api/roofs?verification=verified,
    but as its own path since Ritesh's MapDashboard.jsx spec (Day 9) names
    GET /api/roofs/verified directly.

    Must be registered before GET /{roof_id} below — otherwise FastAPI
    would try to parse "verified" as a UUID path param and 422 instead of
    matching this route.
    """
    try:
        roofs = (
            db.query(RoofListing)
            .filter(RoofListing.verification_status == VerificationStatusEnum.verified.value)
            .order_by(RoofListing.created_at.desc())
            .all()
        )

        return success_response(
            message=f"Fetched {len(roofs)} verified listing(s).",
            data=[RoofListingOut.model_validate(roof) for roof in roofs],
            code=200,
        )

    except SQLAlchemyError as db_err:
        logger.exception("Database error while fetching verified roof listings")
        return error_response(
            message="Failed to fetch verified roof listings due to a database error.",
            code=500,
            error_details={"reason": str(db_err.__class__.__name__)},
        )


@router.get("/{roof_id}")
def get_roof_listing_by_id(roof_id: uuid.UUID, db: Session = Depends(get_db)):
    """
    Fetch a single roof listing by ID — used wherever the frontend already
    has a specific listing's ID (e.g. a detail view opened from a map pin
    or a list row) and just needs its latest verification status.
    """
    try:
        roof = db.query(RoofListing).filter(RoofListing.id == roof_id).first()

        if roof is None:
            return error_response(
                message="Roof listing not found.",
                code=404,
                error_details={"roof_id": str(roof_id)},
            )

        return success_response(
            message="Roof listing fetched successfully.",
            data=RoofListingOut.model_validate(roof),
            code=200,
        )

    except SQLAlchemyError as db_err:
        logger.exception("Database error while fetching roof listing %s", roof_id)
        return error_response(
            message="Failed to fetch the roof listing due to a database error.",
            code=500,
            error_details={"reason": str(db_err.__class__.__name__)},
        )


@router.patch("/{roof_id}/status")
def update_roof_status(roof_id: uuid.UUID, payload: RoofStatusUpdate, db: Session = Depends(get_db)):
    """
    Fix 6 (Divyansh's fix list) — admin approve/reject.

    Completes the 3-step flow: GEE auto-verification (Day 4) -> admin
    approval (here) -> only then does the roof show up for companies via
    GET /api/roofs/verified (which already filters on verification_status,
    independent of this admin `status` field — a roof can be GEE-verified
    but still pending admin sign-off, or vice versa).

    Only "approved" / "rejected" are accepted here (RoofStatusUpdatable) —
    "pending" is the automatic starting state and "leased" is set
    automatically when a lease request is accepted (Fix 7,
    routes/lease_api.py), never directly through this endpoint.
    """
    try:
        roof = db.query(RoofListing).filter(RoofListing.id == roof_id).first()

        if roof is None:
            return error_response(
                message="Roof listing not found.",
                code=404,
                error_details={"roof_id": str(roof_id)},
            )

        roof.status = RoofStatusEnum(payload.status.value)
        db.commit()
        db.refresh(roof)

        return success_response(
            message=f"Roof status updated to '{payload.status.value}'.",
            data=RoofListingOut.model_validate(roof),
            code=200,
        )

    except SQLAlchemyError as db_err:
        db.rollback()
        logger.exception("Database error while updating roof status for %s", roof_id)
        return error_response(
            message="Failed to update roof status due to a database error.",
            code=500,
            error_details={"reason": str(db_err.__class__.__name__)},
        )