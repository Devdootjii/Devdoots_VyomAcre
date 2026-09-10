"""
services/verification_service.py
Divyansh — Day 4: integrate roof_api.py with the GEE verification script
(engine/fetch_area_polygon.py) via FastAPI BackgroundTasks.

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

Cross-folder import note:
    `engine/` is a sibling of `backend/` at the project root, not a Python
    package importable via the normal path. We add it to sys.path at
    import time so `fetch_area_polygon` resolves without restructuring the
    monorepo or duplicating the GEE logic inside backend/.
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
    from fetch_area_polygon import fetch_area_polygon  # type: ignore
except ImportError as exc:  # pragma: no cover
    raise ImportError(
        f"Could not import fetch_area_polygon from {_ENGINE_DIR}. "
        "Confirm the monorepo layout: <root>/backend, <root>/engine."
    ) from exc

from database import SessionLocal
from models import RoofListing, VerificationStatusEnum

# Submitted area vs GEE estimate is allowed to differ by this much before
# being flagged for manual review. Generous because the polygon is a coarse
# bounding-square estimate, not a rooftop outline.
AREA_TOLERANCE_RATIO = 0.5  # 50%


def run_area_verification(roof_id: uuid.UUID, lat: float, lon: float, submitted_area_sqft: float) -> None:
    """
    Background task: fetch a GEE area estimate for (lat, lon) and update
    the corresponding RoofListing row with the verification outcome.

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

        result = fetch_area_polygon(lat, lon)

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
            )
        else:
            roof.verification_status = VerificationStatusEnum.flagged
            roof.verification_message = (
                f"Submitted area ({submitted_area_sqft} sq ft) differs significantly from "
                f"the satellite estimate ({gee_area} sq ft) — flagged for manual review."
            )

        db.commit()
        logger.info("Verification complete for roof_id %s: %s", roof_id, roof.verification_status)

    except Exception:  # noqa: BLE001
        db.rollback()
        logger.exception("Unexpected error during background verification for roof_id %s", roof_id)

    finally:
        db.close()