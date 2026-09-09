"""
engine/fetch_area_polygon.py
Divyansh — Day 3: GEE Logic takeover.

Takes a Lat/Lon input and fetches an area polygon around that point using
Google Earth Engine, returning a strictly type-hinted dictionary so FastAPI
can consume it directly.
"""

from __future__ import annotations

import os
import logging
from typing import List, Tuple, TypedDict

from dotenv import load_dotenv

load_dotenv()

import ee  # earthengine-api

logger = logging.getLogger("vyomacre.engine.fetch_area_polygon")

_GEE_SERVICE_ACCOUNT = os.getenv("GEE_SERVICE_ACCOUNT", "")
_GEE_PRIVATE_KEY_PATH = os.getenv("GEE_PRIVATE_KEY_PATH", "")

_initialized = False


class AreaPolygonResult(TypedDict):
    latitude: float
    longitude: float
    buffer_meters: float
    polygon_coordinates: List[Tuple[float, float]]
    area_sqft: float
    status: str
    message: str


def _ensure_gee_initialized() -> None:
    global _initialized
    if _initialized:
        return

    if not _GEE_SERVICE_ACCOUNT or not _GEE_PRIVATE_KEY_PATH:
        raise RuntimeError(
            "GEE credentials are not configured. Set GEE_SERVICE_ACCOUNT and "
            "GEE_PRIVATE_KEY_PATH in the environment (.env)."
        )

    credentials = ee.ServiceAccountCredentials(_GEE_SERVICE_ACCOUNT, _GEE_PRIVATE_KEY_PATH)
    ee.Initialize(credentials)
    _initialized = True


def fetch_area_polygon(lat: float, lon: float, buffer_meters: float = 15.0) -> AreaPolygonResult:
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
        polygon = point.buffer(buffer_meters).bounds()

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
    result = fetch_area_polygon(26.8467, 80.9462)
    print(result)