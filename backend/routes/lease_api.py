"""
routes/lease_api.py
Divyansh — Day 9: Lease request flow (Company -> Owner).

Endpoints:
    POST   /api/lease-requests              — a company requests a roof
    GET    /api/lease-requests?owner_id=..  — an owner's incoming requests
    PATCH  /api/lease-requests/{id}         — owner accepts/rejects

Owner identity note:
    VyomAcre doesn't have a separate Owner accounts table yet — a roof's
    owner is identified by RoofListing.phone_number. So `owner_id` here is
    treated as that phone number: to list "an owner's" lease requests, we
    first find which roofs belong to that phone number, then fetch the
    lease requests against those roof IDs. If a real Owner table is added
    later, only this lookup needs to change — the route contract stays
    the same.
"""

import logging
import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from database import get_db
from auth_dependency import require_owner, require_seeker
from auth_models import User
from models import LeaseRequest, LeaseStatusEnum, RoofListing, RoofStatusEnum
from schemas import LeaseRequestCreate, LeaseRequestOut, LeaseRequestStatusUpdate
from utils.response_helper import error_response, success_response

logger = logging.getLogger("vyomacre.lease_api")

router = APIRouter(prefix="/api/lease-requests", tags=["Lease Requests"])


@router.post("")
def create_lease_request(
    payload: LeaseRequestCreate,
    current_user: User = Depends(require_seeker),
    db: Session = Depends(get_db),
):
    """
    A company (seeker account) sends a lease request for a specific roof.

    T3 note: unlike RoofListing's owner_name/phone_number (now derived from
    the token, see roof_api.py), `company_name` stays a client-supplied
    field here. The User model only has a personal `name`, no separate
    "company name" — a seeker's account holder and the company they're
    requesting on behalf of aren't necessarily the same string, so
    overriding this with current_user.name would be a real UX regression,
    not just a security tightening. The role gate (require_seeker) still
    ensures only seeker accounts can call this at all.
    """
    try:
        roof = db.query(RoofListing).filter(RoofListing.id == payload.roof_id).first()
        if roof is None:
            return error_response(
                message="Cannot create a lease request — roof listing not found.",
                code=404,
                error_details={"roof_id": str(payload.roof_id)},
            )

        lease_request = LeaseRequest(
            roof_id=payload.roof_id,
            company_name=payload.company_name,
        )
        db.add(lease_request)
        db.commit()
        db.refresh(lease_request)

        return success_response(
            message="Lease request sent successfully.",
            data=LeaseRequestOut.model_validate(lease_request),
            code=200,
        )

    except SQLAlchemyError as db_err:
        db.rollback()
        logger.exception("Database error while creating lease request")
        return error_response(
            message="Failed to create the lease request due to a database error.",
            code=500,
            error_details={"reason": str(db_err.__class__.__name__)},
        )


@router.get("")
def get_lease_requests(
    owner_id: str = Query(
        ...,
        description="The owner's phone number — a roof's owner is identified by phone_number.",
    ),
    db: Session = Depends(get_db),
):
    """Fetch every lease request for the roofs belonging to one owner."""
    try:
        roof_ids = [
            row.id
            for row in db.query(RoofListing.id).filter(RoofListing.phone_number == owner_id).all()
        ]

        if not roof_ids:
            return success_response(
                message="No roofs found for this owner — no lease requests to show.",
                data=[],
                code=200,
            )

        requests = (
            db.query(LeaseRequest)
            .filter(LeaseRequest.roof_id.in_(roof_ids))
            .order_by(LeaseRequest.created_at.desc())
            .all()
        )

        return success_response(
            message=f"Fetched {len(requests)} lease request(s) for this owner.",
            data=[LeaseRequestOut.model_validate(req) for req in requests],
            code=200,
        )

    except SQLAlchemyError as db_err:
        logger.exception("Database error while fetching lease requests for owner %s", owner_id)
        return error_response(
            message="Failed to fetch lease requests due to a database error.",
            code=500,
            error_details={"reason": str(db_err.__class__.__name__)},
        )


@router.patch("/{lease_request_id}")
def update_lease_request_status(
    lease_request_id: uuid.UUID,
    payload: LeaseRequestStatusUpdate,
    current_user: User = Depends(require_owner),
    db: Session = Depends(get_db),
):
    """
    Owner accepts or rejects a pending lease request.

    T3: gated behind require_owner, plus an explicit ownership check below —
    being *an* owner isn't enough, they must own the specific roof this
    lease request is for. Without that second check, any owner account
    could accept/reject requests on anyone else's roof.

    Fix 7 (Divyansh's fix list): accepting a request now also marks the
    underlying roof's admin `status` as "leased" — previously the lease
    request itself changed status but the roof stayed "pending" forever,
    so there was no visible outcome of accepting a request.
    """
    try:
        lease_request = db.query(LeaseRequest).filter(LeaseRequest.id == lease_request_id).first()

        if lease_request is None:
            return error_response(
                message="Lease request not found.",
                code=404,
                error_details={"lease_request_id": str(lease_request_id)},
            )

        roof = db.query(RoofListing).filter(RoofListing.id == lease_request.roof_id).first()

        if roof is None or roof.phone_number != current_user.phone:
            return error_response(
                message="You can only manage lease requests for your own roofs.",
                code=403,
            )

        lease_request.status = LeaseStatusEnum(payload.status.value)

        if lease_request.status == LeaseStatusEnum.accepted:
            roof.status = RoofStatusEnum.leased

        db.commit()
        db.refresh(lease_request)

        return success_response(
            message=f"Lease request {payload.status.value} successfully.",
            data=LeaseRequestOut.model_validate(lease_request),
            code=200,
        )

    except SQLAlchemyError as db_err:
        db.rollback()
        logger.exception("Database error while updating lease request %s", lease_request_id)
        return error_response(
            message="Failed to update the lease request due to a database error.",
            code=500,
            error_details={"reason": str(db_err.__class__.__name__)},
        )