"""
routes/roof_api.py
Roof onboarding endpoints for VyomAcre.
"""

import logging
from typing import Optional

from fastapi import APIRouter, BackgroundTasks, Depends, Query
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from database import get_db
from models import RoofListing, RoofStatusEnum
from schemas import RoofListingCreate, RoofListingOut
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
        description="Optional filter, e.g. ?status=approved",
    ),
    db: Session = Depends(get_db),
):
    """
    Fetch all roof listings (Day 3 — used by Ritesh's MapDashboard.jsx to
    render live markers instead of dummy coordinates).

    Always returns through the standardized `success_response` wrapper,
    even when the result set is empty — an empty list is not an error.
    """
    try:
        query = db.query(RoofListing)

        if status_filter is not None:
            query = query.filter(RoofListing.status == status_filter.value)

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