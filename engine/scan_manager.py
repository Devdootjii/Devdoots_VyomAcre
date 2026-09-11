"""
engine/scan_manager.py
Divyansh — Day 5/6/7: "Skip & Move" logic for the GEE script.

Snaps every incoming (lat, lon) to a coarse grid cell. Before calling GEE,
checks whether that cell was scanned *successfully* and recently. If yes,
skips the live call and reuses the cached result ("skip"). Otherwise calls
GEE for real and caches the result ("move"). Failed scans are NEVER
cached/skipped — a failure always retries on the next request for that
zone, so a misconfigured .env doesn't get "permanently" cached as a fake
success/failure loop.
"""

from __future__ import annotations

import json
import logging
import time
from pathlib import Path
from typing import Optional

from fetch_area_polygon import AreaPolygonResult, fetch_area_polygon

logger = logging.getLogger("vyomacre.engine.scan_manager")

GRID_SIZE_DEGREES = 0.01
CACHE_TTL_SECONDS = 6 * 60 * 60  # 6 hours

_CACHE_FILE = Path(__file__).resolve().parent / "scanned_zones_cache.json"


class SkipMoveResult(AreaPolygonResult):
    zone_key: str
    skipped: bool


def get_zone_key(lat: float, lon: float, grid_size_degrees: float = GRID_SIZE_DEGREES) -> str:
    grid_lat = round(lat / grid_size_degrees) * grid_size_degrees
    grid_lon = round(lon / grid_size_degrees) * grid_size_degrees
    return f"{grid_lat:.3f}_{grid_lon:.3f}"


def _load_cache() -> dict:
    if not _CACHE_FILE.exists():
        return {}
    try:
        with open(_CACHE_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError):
        logger.warning("scanned_zones_cache.json unreadable — starting with an empty cache.")
        return {}


def _save_cache(cache: dict) -> None:
    try:
        with open(_CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(cache, f, indent=2)
    except OSError:
        logger.exception("Failed to persist scanned_zones_cache.json")


def _get_fresh_cached_entry(cache: dict, zone_key: str) -> Optional[dict]:
    entry = cache.get(zone_key)
    if entry is None:
        return None
    if entry.get("status") != "ok":
        # Never skip on a cached failure — always retry failed zones.
        return None
    age_seconds = time.time() - entry.get("scanned_at_epoch", 0)
    if age_seconds > CACHE_TTL_SECONDS:
        return None
    return entry


def fetch_area_polygon_with_skip_move(
    lat: float,
    lon: float,
    buffer_meters: float = 15.0,
    force_rescan: bool = False,
) -> SkipMoveResult:
    zone_key = get_zone_key(lat, lon)
    cache = _load_cache()

    if not force_rescan:
        cached = _get_fresh_cached_entry(cache, zone_key)
        if cached is not None:
            logger.info("Skip: zone %s was scanned recently — reusing cached result.", zone_key)
            return SkipMoveResult(
                latitude=lat,
                longitude=lon,
                buffer_meters=buffer_meters,
                polygon_coordinates=cached["polygon_coordinates"],
                area_sqft=cached["area_sqft"],
                status=cached["status"],
                message="Skipped — reused a recent scan for this zone.",
                zone_key=zone_key,
                skipped=True,
            )

    logger.info("Move: zone %s has no fresh successful scan — calling GEE.", zone_key)
    result = fetch_area_polygon(lat, lon, buffer_meters=buffer_meters)

    # Only cache real, successful scans. Failures are never cached, so a
    # broken .env or transient GEE error always gets retried, not stuck.
    if result["status"] == "ok":
        cache[zone_key] = {
            "area_sqft": result["area_sqft"],
            "polygon_coordinates": result["polygon_coordinates"],
            "status": result["status"],
            "scanned_at_epoch": time.time(),
        }
        _save_cache(cache)

    return SkipMoveResult(
        **result,
        zone_key=zone_key,
        skipped=False,
    )


if __name__ == "__main__":
    first = fetch_area_polygon_with_skip_move(26.8467, 80.9462)
    print("First call:", first)

    second = fetch_area_polygon_with_skip_move(26.8467, 80.9462)
    print("Second call:", second)