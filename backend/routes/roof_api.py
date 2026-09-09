"""
routes/roof_api.py
Roof onboarding endpoints for VyomAcre.
"""

import logging

from fastapi import APIRouter, Depends
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from database import get_db
from models import RoofListing
from schemas import RoofListingCreate, RoofListingOut
from utils.response_helper import error_response, success_response

logger = logging.getLogger("vyomacre.roof_api")

router = APIRouter(prefix="/api/roofs", tags=["Roofs"])


@router.post("/add")
def add_roof_listing(payload: RoofListingCreate, db: Session = Depends(get_db)):
    """
    Onboard a new rooftop listing.

    Request validation is handled by `RoofListingCreate` (schemas.py).
    Any validation failure is caught globally by the RequestValidationError
    handler registered in main.py, which returns the standardized error
    envelope automatically.
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

        return success_response(
            message="Roof listing added successfully.",
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

# ==========================================
# DAY 3 TASK: GET ALL ROOFS ENDPOINT
# ==========================================
@router.get("")
def get_all_roofs(db: Session = Depends(get_db)):
    """
    Day 3 Task: Fetch all roof listings from the database.
    Used by the frontend map dashboard.
    """
    try:
        roofs = db.query(RoofListing).all()
        
        # Data serialize kar rahe hain taaki Pydantic schemas se match kare
        serialized_roofs = [RoofListingOut.model_validate(roof) for roof in roofs]
        
        # Strict Rule: Using success_response wrapper
        return success_response(
            message="All roof listings fetched successfully.",
            data=serialized_roofs,
            code=200
        )
    except Exception as exc:
        logger.exception("Unexpected error while fetching roof listings")
        return error_response(
            message="An unexpected error occurred while fetching the roof listings.",
            code=500,
            error_details={"reason": str(exc)},
        )