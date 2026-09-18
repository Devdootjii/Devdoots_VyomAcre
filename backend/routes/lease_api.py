"""
routes/lease_api.py
Divyansh — Day 9: Lease request flow (Company -> Owner).

Identity & privacy fix (Sonnet task brief, Sep 2026): seeker_id is now
recorded on create, the owner-side GET is auth-protected and no longer
takes a client-supplied owner_id, and a new /mine endpoint lets a seeker
fetch their own requests.

Endpoints:
    POST   /api/lease-requests        — a company (seeker) requests a roof
    GET    /api/lease-requests/mine   — the authenticated seeker's own requests
    GET    /api/lease-requests        — the authenticated owner's incoming requests
    PATCH  /api/lease-requests/{id}   — owner accepts/rejects

Owner identity note:
    VyomAcre doesn't have a separate Owner accounts table yet — a roof's
    owner is identified by RoofListing.phone_number. So "an owner's" lease
    requests are found by first finding which roofs belong to
    current_user.phone, then fetching lease requests against those roof
    IDs. If a real Owner table is added later, only this lookup needs to
    change — the route contract stays the same.

Seeker identity note:
    Companies/seekers DO have a real account (the `users` table), so their
    identity is stored directly as LeaseRequest.seeker_id (a FK to
    users.id) rather than looked up indirectly like the owner is. Rows
    created before this fix have seeker_id = NULL (test data) — see
    migrate_add_seeker_id.py.
"""

import logging
import uuid

from fastapi import APIRouter, Depends
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

    seeker_id is always taken from the token (current_user.id) — never
    from the request body — same identity pattern as RoofListing's
    owner_name/phone_number (see roof_api.py).

    company_name intentionally stays a client-supplied field. The User
    model only has a personal `name`, no separate "company name" — a
    seeker's account holder and the company they're requesting on behalf
    of aren't necessarily the same string, so overriding this with
    current_user.name would be a real UX regression, not just a security
    tightening. This is intentional, please don't "fix" it again. The role
    gate (require_seeker) still ensures only seeker accounts can call this
    at all.
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
            seeker_id=current_user.id,
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


@router.get("/mine")
def get_my_lease_requests(
    current_user: User = Depends(require_seeker),
    db: Session = Depends(get_db),
):
    """
    A seeker's own lease requests, across all roofs — identity comes from
    the token (current_user.id), same pattern as everywhere else in this
    file.

    Route order note: registered before the plain GET "" (owner) route and
    ahead of where any future GET "/{param}" route would go, so a literal
    path segment ("mine") is never accidentally captured as a path
    parameter. There's no such route today (only PATCH has a path param),
    but keeping this first is what makes it safe to add one later without
    silently breaking this endpoint.
    """
    try:
        requests = (
            db.query(LeaseRequest)
            .filter(LeaseRequest.seeker_id == current_user.id)
            .order_by(LeaseRequest.created_at.desc())
            .all()
        )

        return success_response(
            message=f"Fetched {len(requests)} lease request(s) for this seeker.",
            data=[LeaseRequestOut.model_validate(req) for req in requests],
            code=200,
        )

    except SQLAlchemyError as db_err:
        logger.exception(
            "Database error while fetching lease requests for seeker %s", current_user.id
        )
        return error_response(
            message="Failed to fetch lease requests due to a database error.",
            code=500,
            error_details={"reason": str(db_err.__class__.__name__)},
        )


@router.get("")
def get_lease_requests(
    current_user: User = Depends(require_owner),
    db: Session = Depends(get_db),
):
    """
    Fetch every lease request for the roofs belonging to the authenticated
    owner.

    Privacy fix: this endpoint used to take `owner_id` as an open query
    param with NO auth dependency at all — anyone could read any phone
    number's lease requests just by guessing/knowing it. Identity now
    comes from the token (current_user.phone), same pattern as everywhere
    else; the query param is gone.
    """
    try:
        roof_ids = [
            row.id
            for row in db.query(RoofListing.id)
            .filter(RoofListing.phone_number == current_user.phone)
            .all()
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
        logger.exception(
            "Database error while fetching lease requests for owner %s", current_user.phone
        )
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

    Unchanged by the identity/privacy fix — kept exactly as-is.
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