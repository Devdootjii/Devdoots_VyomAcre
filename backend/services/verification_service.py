"""
services/verification_service.py
Divyansh — Day 4: integrate roof_api.py with the GEE verification script
(engine/fetch_area_polygon.py) via FastAPI BackgroundTasks.
Day 5/6/7: also records every scan against the ScannedZone table so the
backend has a durable, cross-process view of which grid zones have
already been scanned — independent of the engine's own local cache.

Design:
    - POST /api/roofs/add returns immediately (no GEE round-trip in the
      request/response cycle) — a background task runs the verification
      after the response has already gone back to the client.
    - The background task fetches its own short-lived DB session (it can't
      reuse the request's `get_db()` session, which closes as soon as the
      route returns).
    - Verification compares the owner's submitted `area_sqft` against the
      GEE-estimated polygon area. A generous tolerance is used because the
      current polygon is a simple bounding square around the point, not a
      real rooftop outline (that refinement is a later engine task).
    - Before calling GEE at all, `fetch_area_polygon_with_skip_move()`
      checks the engine's own recent-scan cache ("Skip & Move") so two
      roofs in the same grid zone don't trigger two live GEE calls.

Cross-folder import note:
    `engine/` is a sibling of `backend/` at the project root, not a Python
    package importable via the normal path. We add it to sys.path at
    import time so `fetch_area_polygon_with_skip_move` / `get_zone_key`
    resolve without restructuring the monorepo or duplicating GEE logic
    inside backend/.
"""

from __future__ import annotations

import logging
import sys
import uuid
from pathlib import Path

logger = logging.getLogger("vyomacre.services.verification_service")

# --- Make engine/ importable from backend/ ---
_ENGINE_DIR = Path(__file__).resolve().parents[2] / "engine"
if str(_ENGINE_DIR) not in sys.path:
    sys.path.insert(0, str(_ENGINE_DIR))

try:
    from scan_manager import fetch_area_polygon_with_skip_move, get_zone_key  # type: ignore
except ImportError as exc:  # pragma: no cover
    raise ImportError(
        f"Could not import scan_manager from {_ENGINE_DIR}. "
        "Confirm the monorepo layout: <root>/backend, <root>/engine."
    ) from exc

from database import SessionLocal
from models import RoofListing, ScannedZone, ScanStatusEnum, VerificationStatusEnum

# Submitted area vs GEE estimate is allowed to differ by this much before
# being flagged for manual review. Generous because the polygon is a coarse
# bounding-square estimate, not a rooftop outline.
AREA_TOLERANCE_RATIO = 0.5  # 50%


def _record_scanned_zone(db, lat: float, lon: float, result: dict) -> None:
    """
    Upsert the ScannedZone row for this coordinate's grid cell. Runs on the
    same session/transaction as the RoofListing update in
    run_area_verification, so both commit together.
    """
    zone_key = result.get("zone_key") or get_zone_key(lat, lon)

    zone = db.query(ScannedZone).filter(ScannedZone.zone_key == zone_key).first()

    if result["status"] != "ok":
        status = ScanStatusEnum.failed
    elif result.get("skipped"):
        status = ScanStatusEnum.skipped_redundant
    else:
        status = ScanStatusEnum.scanned

    if zone is None:
        grid_lat = round(lat, 3)
        grid_lon = round(lon, 3)
        zone = ScannedZone(
            zone_key=zone_key,
            grid_lat=grid_lat,
            grid_lon=grid_lon,
            scan_status=status,
            gee_estimated_area_sqft=result.get("area_sqft"),
            request_count=1,
        )
        db.add(zone)
    else:
        zone.scan_status = status
        if result["status"] == "ok":
            zone.gee_estimated_area_sqft = result.get("area_sqft")
        zone.request_count += 1
        # last_scanned_at / updated_at refresh via server_default/onupdate on commit


def run_area_verification(roof_id: uuid.UUID, lat: float, lon: float, submitted_area_sqft: float) -> None:
    """
    Background task: fetch a GEE area estimate for (lat, lon) — via the
    Skip & Move wrapper, so a recently-scanned grid zone is reused instead
    of triggering another live GEE call — and update the corresponding
    RoofListing row with the verification outcome. Also upserts the
    ScannedZone record for this coordinate's grid cell.

    Never raises — this runs detached from the request/response cycle, so
    an unhandled exception here would only show up in server logs, not to
    the user. All failure paths are caught and logged instead.
    """
    db = SessionLocal()
    try:
        roof = db.query(RoofListing).filter(RoofListing.id == roof_id).first()
        if roof is None:
            logger.warning("Verification skipped — roof_id %s no longer exists.", roof_id)
            return

        result = fetch_area_polygon_with_skip_move(lat, lon)

        _record_scanned_zone(db, lat, lon, result)

        if result["status"] != "ok":
            roof.verification_status = VerificationStatusEnum.verification_failed
            roof.verification_message = result["message"]
            db.commit()
            logger.warning("GEE verification failed for roof_id %s: %s", roof_id, result["message"])
            return

        gee_area = result["area_sqft"]
        roof.gee_estimated_area_sqft = gee_area

        diff_ratio = abs(gee_area - submitted_area_sqft) / max(submitted_area_sqft, 1)

        if diff_ratio <= AREA_TOLERANCE_RATIO:
            roof.verification_status = VerificationStatusEnum.verified
            roof.verification_message = (
                f"Submitted area ({submitted_area_sqft} sq ft) is consistent with the "
                f"satellite estimate ({gee_area} sq ft)."
                + (" (reused a recent scan for this area)" if result.get("skipped") else "")
            )
        else:
            roof.verification_status = VerificationStatusEnum.flagged
            roof.verification_message = (
                f"Submitted area ({submitted_area_sqft} sq ft) differs significantly from "
                f"the satellite estimate ({gee_area} sq ft) — flagged for manual review."
                + (" (reused a recent scan for this area)" if result.get("skipped") else "")
            )

        db.commit()
        logger.info(
            "Verification complete for roof_id %s: %s (skipped=%s)",
            roof_id,
            roof.verification_status,
            result.get("skipped"),
        )

    except Exception:  # noqa: BLE001
        db.rollback()
        logger.exception("Unexpected error during background verification for roof_id %s", roof_id)

    finally:
        db.close()