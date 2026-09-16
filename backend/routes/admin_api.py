"""
routes/admin_api.py
Divyansh — Phase 1, T5: admin backend endpoints.

Note on /verify and /reject vs the existing PATCH /api/roofs/{id}/status
(Fix 6, from the earlier fix-list session):
  - PATCH /api/roofs/{id}/status sets the admin *business* approval
    (RoofStatus: approved/rejected/leased) — "should this listing go live".
  - PATCH /api/roofs/{id}/verify and .../reject (here) set the *GEE
    verification* result (VerificationStatus: verified/flagged) directly —
    a manual override for when GEE got it wrong, or a roof is stuck in
    pending_verification (e.g. a GEE call failed) and an admin wants to
    push it through by hand after checking manually.
These are two separate concerns and both endpoints are kept.
"""

import logging

from fastapi import APIRouter, Depends, Query
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session
from typing import Optional

from auth_dependency import require_admin
from auth_models import User
from database import get_db
from models import LeaseRequest, RoofListing, RoofStatusEnum, VerificationStatusEnum
from schemas import RoofListingOut
from utils.response_helper import error_response, success_response

logger = logging.getLogger("vyomacre.admin_api")

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/roofs")
def get_admin_roofs(
    status_filter: Optional[VerificationStatusEnum] = Query(
        default=None,
        alias="status",
        description="e.g. ?status=pending_verification — omit to list all roofs.",
    ),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """List roofs for the admin queue, optionally filtered by verification_status."""
    try:
        query = db.query(RoofListing)
        if status_filter is not None:
            query = query.filter(RoofListing.verification_status == status_filter.value)

        roofs = query.order_by(RoofListing.created_at.desc()).all()

        return success_response(
            message=f"Fetched {len(roofs)} roof(s).",
            data=[RoofListingOut.model_validate(r) for r in roofs],
            code=200,
        )

    except SQLAlchemyError as db_err:
        logger.exception("Database error while fetching admin roofs")
        return error_response(
            message="Failed to fetch roofs due to a database error.",
            code=500,
            error_details={"reason": str(db_err.__class__.__name__)},
        )


@router.get("/stats")
def get_admin_stats(current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    """Dashboard counters for the admin panel."""
    try:
        total_roofs = db.query(RoofListing).count()
        pending = (
            db.query(RoofListing)
            .filter(RoofListing.verification_status == VerificationStatusEnum.pending_verification.value)
            .count()
        )
        verified = (
            db.query(RoofListing)
            .filter(RoofListing.verification_status == VerificationStatusEnum.verified.value)
            .count()
        )
        leased = db.query(RoofListing).filter(RoofListing.status == RoofStatusEnum.leased.value).count()
        total_users = db.query(User).count()
        total_leases = db.query(LeaseRequest).count()

        return success_response(
            message="Stats fetched successfully.",
            data={
                "total_roofs": total_roofs,
                "pending": pending,
                "verified": verified,
                "leased": leased,
                "total_users": total_users,
                "total_leases": total_leases,
            },
            code=200,
        )

    except SQLAlchemyError as db_err:
        logger.exception("Database error while computing admin stats")
        return error_response(
            message="Failed to compute stats due to a database error.",
            code=500,
            error_details={"reason": str(db_err.__class__.__name__)},
        )