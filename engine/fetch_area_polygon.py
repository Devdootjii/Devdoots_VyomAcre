"""
engine/fetch_area_polygon.py
Divyansh — Day 3: GEE Logic takeover.

Takes a Lat/Lon input and fetches an area polygon around that point using
Google Earth Engine, returning a strictly type-hinted dictionary so FastAPI
can consume it directly (e.g. as the `data` field of the standardized
response envelope once this is wired into a route).

Reuses the same GEE service-account auth pattern already verified working
in test_gee_connection.py — reads GEE_SERVICE_ACCOUNT / GEE_PRIVATE_KEY_PATH
from .env, nothing hardcoded.
"""

from __future__ import annotations

import os
import json
import logging
import tempfile
from pathlib import Path
from typing import List, Tuple, TypedDict

from dotenv import load_dotenv

_ENV_PATH = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=_ENV_PATH)

import ee  # earthengine-api

logger = logging.getLogger("vyomacre.engine.fetch_area_polygon")

_GEE_SERVICE_ACCOUNT = os.getenv("GEE_SERVICE_ACCOUNT", "")
# Fix 2 (Divyansh's fix list) — on Render there's no local file at
# GEE_PRIVATE_KEY_PATH (that path only exists on the developer's laptop).
# GEE_PRIVATE_KEY_JSON holds the *entire* service-account JSON content as
# one environment variable string, set in the Render dashboard. Locally,
# GEE_PRIVATE_KEY_PATH keeps working exactly as before — nothing changes
# for local dev.
_GEE_KEY_JSON = os.getenv("GEE_PRIVATE_KEY_JSON", "")
_GEE_PRIVATE_KEY_PATH = os.getenv("GEE_PRIVATE_KEY_PATH", "")

_initialized = False
_resolved_key_path_cache: str = ""


class AreaPolygonResult(TypedDict):
    latitude: float
    longitude: float
    buffer_meters: float
    polygon_coordinates: List[Tuple[float, float]]  # [(lon, lat), ...] ring, GeoJSON order
    area_sqft: float
    status: str  # "ok" | "error"
    message: str


def _resolve_key_path() -> str:
    """
    Returns a real filesystem path to the service-account JSON key,
    regardless of whether it came from a Render env var (JSON content) or
    a local file path.

    If GEE_PRIVATE_KEY_JSON is set (cloud), its content is written to a
    temp file once per process and that path is cached and reused —
    ee.ServiceAccountCredentials needs a file path either way.
    """
    global _resolved_key_path_cache
    if _resolved_key_path_cache:
        return _resolved_key_path_cache

    if _GEE_KEY_JSON:
        tmp = tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False)
        tmp.write(_GEE_KEY_JSON)
        tmp.close()
        _resolved_key_path_cache = tmp.name
        return _resolved_key_path_cache

    _resolved_key_path_cache = _GEE_PRIVATE_KEY_PATH
    return _resolved_key_path_cache


def _ensure_gee_initialized() -> None:
    """Lazily authenticate + initialize the Earth Engine session once per process."""
    global _initialized
    if _initialized:
        return

    if not _GEE_SERVICE_ACCOUNT or not (_GEE_KEY_JSON or _GEE_PRIVATE_KEY_PATH):
        raise RuntimeError(
            "GEE credentials are not configured. Set GEE_SERVICE_ACCOUNT and either "
            "GEE_PRIVATE_KEY_JSON (cloud) or GEE_PRIVATE_KEY_PATH (local) in the environment."
        )

    key_path = _resolve_key_path()

    if _GEE_KEY_JSON:
        try:
            json.loads(_GEE_KEY_JSON)
        except json.JSONDecodeError as exc:
            raise RuntimeError(
                "GEE_PRIVATE_KEY_JSON is set but isn't valid JSON — check it was pasted "
                "as a single unbroken line in the environment variable."
            ) from exc

    credentials = ee.ServiceAccountCredentials(_GEE_SERVICE_ACCOUNT, key_path)
    ee.Initialize(credentials)
    _initialized = True


def fetch_area_polygon(lat: float, lon: float, buffer_meters: float = 15.0) -> AreaPolygonResult:
    """
    Build a circular buffer polygon around (lat, lon) using Earth Engine
    geometry operations, and return its coordinates + approximate area.

    This is the Day 3 handoff point: the polygon this returns is what
    calculate_roof_area() (Day 2, engine/roof_area.py) will eventually be
    refined to measure against real rooftop imagery, instead of a plain
    circular buffer.

    Args:
        lat: Latitude in decimal degrees (-90 to 90).
        lon: Longitude in decimal degrees (-180 to 180).
        buffer_meters: Radius of the polygon around the point.

    Returns:
        An AreaPolygonResult dict — always returns a dict, never raises for
        expected failure modes, so a FastAPI route can wrap this directly.
    """
    if not (-90 <= lat <= 90) or not (-180 <= lon <= 180):
        return AreaPolygonResult(
            latitude=lat,
            longitude=lon,
            buffer_meters=buffer_meters,
            polygon_coordinates=[],
            area_sqft=0.0,
            status="error",
            message="Latitude/longitude out of valid range.",
        )

    try:
        _ensure_gee_initialized()

        point = ee.Geometry.Point([lon, lat])
        polygon = point.buffer(buffer_meters).bounds()  # simple bounding square for now

        # .getInfo() forces a round-trip to Earth Engine servers, proving
        # this isn't just a client-side geometry object.
        geojson = polygon.getInfo()
        coordinates = geojson.get("coordinates", [[]])[0]

        area_m2 = polygon.area(maxError=1).getInfo()
        area_sqft = round(area_m2 * 10.7639, 2)

        return AreaPolygonResult(
            latitude=lat,
            longitude=lon,
            buffer_meters=buffer_meters,
            polygon_coordinates=[tuple(coord) for coord in coordinates],
            area_sqft=area_sqft,
            status="ok",
            message="Area polygon fetched successfully.",
        )

    except Exception as exc:  # noqa: BLE001
        logger.exception("fetch_area_polygon failed for (%s, %s)", lat, lon)
        return AreaPolygonResult(
            latitude=lat,
            longitude=lon,
            buffer_meters=buffer_meters,
            polygon_coordinates=[],
            area_sqft=0.0,
            status="error",
            message=f"GEE lookup failed: {exc.__class__.__name__}: {exc}",
        )


if __name__ == "__main__":
    # Quick manual smoke test: python fetch_area_polygon.py
    result = fetch_area_polygon(26.8467, 80.9462)
    print(result)