"""
routes/zone_api.py
Divyansh — Day 8: Admin Radar Map support.

Exposes the ScannedZones table to the frontend (Ritesh) so the Admin Map
can grey-out already-scanned grids and highlight new/unscanned ones.
"""

import logging

from fastapi import APIRouter, Depends
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from database import get_db
from models import GRID_SIZE_DEGREES, ScannedZone
from schemas import ScannedZoneOut
from utils.response_helper import error_response, success_response

logger = logging.getLogger("vyomacre.zone_api")

router = APIRouter(prefix="/api/zones", tags=["Zones"])

_HALF_GRID = GRID_SIZE_DEGREES / 2


@router.get("/scanned")
def get_scanned_zones(db: Session = Depends(get_db)):
    """
    Fetch every recorded grid zone (scanned, failed, or skipped-redundant)
    for the Admin Radar Map.

    Response shape (per the Day 8 API contract):
        {"status": "success", "code": 200, "data": [
            {"grid_id": "...", "status": "scanned",
             "north": .., "south": .., "east": .., "west": ..,
             "scanned_at": "..."}
        ]}

    `grid_id` is the same zone_key used by engine/scan_manager.py's local
    cache and this table, so a zone shown here always maps 1:1 to a real
    grid cell the Skip & Move logic can reference. North/south/east/west
    are derived from the stored center point + the fixed grid size,
    since we don't persist bounds directly.
    """
    try:
        zones = db.query(ScannedZone).order_by(ScannedZone.last_scanned_at.desc()).all()

        data = [
            ScannedZoneOut(
                grid_id=zone.zone_key,
                status=zone.scan_status,
                north=round(zone.grid_lat + _HALF_GRID, 6),
                south=round(zone.grid_lat - _HALF_GRID, 6),
                east=round(zone.grid_lon + _HALF_GRID, 6),
                west=round(zone.grid_lon - _HALF_GRID, 6),
                gee_estimated_area_sqft=zone.gee_estimated_area_sqft,
                scanned_at=zone.last_scanned_at,
            )
            for zone in zones
        ]

        return success_response(
            message="Scanned zones fetched successfully.",
            data=data,
            code=200,
        )

    except SQLAlchemyError as db_err:
        logger.exception("Database error while fetching scanned zones")
        return error_response(
            message="Failed to fetch scanned zones due to a database error.",
            code=500,
            error_details={"reason": str(db_err.__class__.__name__)},
        )

    except Exception as exc:  # noqa: BLE001
        logger.exception("Unexpected error while fetching scanned zones")
        return error_response(
            message="An unexpected error occurred while fetching scanned zones.",
            code=500,
            error_details={"reason": str(exc)},
        )