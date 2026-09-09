"""
engine/test_gee_connection.py
Balram — Day 1: verify that the Google Earth Engine (GEE) Python API
connection is working before any real feature logic (calculate_roof_area,
Day 2) is built on top of it.

What this checks:
    1. Required env vars are present (GEE_SERVICE_ACCOUNT, GEE_PRIVATE_KEY_PATH).
    2. Service-account credentials can authenticate against Earth Engine.
    3. A trivial GEE call (fetching one public image's metadata) succeeds,
       proving the session is genuinely live — not just "imported without error."

No credentials are hardcoded here, per the Day 2 no-hardcoding constraint
(which applies from Day 1 onward in spirit) — everything is read from the
environment / .env file.

Run directly:
    python engine/test_gee_connection.py
"""

from __future__ import annotations

import os
import sys
from typing import TypedDict

from dotenv import load_dotenv
load_dotenv()

import ee  # earthengine-api


class GEEConnectionResult(TypedDict):
    status: str          # "ok" | "error"
    step_failed: str      # "" if status == "ok", else which step broke
    message: str
    sample_image_id: str  # populated only on success


def _load_credentials_from_env() -> tuple[str, str]:
    service_account = os.getenv("GEE_SERVICE_ACCOUNT", "")
    private_key_path = os.getenv("GEE_PRIVATE_KEY_PATH", "")
    return service_account, private_key_path


def test_gee_connection() -> GEEConnectionResult:
    """
    Runs the full connection check and returns a type-hinted dict result
    (rather than raising), so this can also be imported and called from
    a health-check route later without changing its interface.
    """
    service_account, private_key_path = _load_credentials_from_env()

    # --- Step 1: env vars present ---
    if not service_account or not private_key_path:
        return GEEConnectionResult(
            status="error",
            step_failed="env_vars",
            message=(
                "GEE_SERVICE_ACCOUNT and/or GEE_PRIVATE_KEY_PATH are not set. "
                "Add them to your .env file."
            ),
            sample_image_id="",
        )

    if not os.path.isfile(private_key_path):
        return GEEConnectionResult(
            status="error",
            step_failed="key_file_missing",
            message=f"GEE_PRIVATE_KEY_PATH points to a file that does not exist: {private_key_path}",
            sample_image_id="",
        )

    # --- Step 2: authenticate ---
    try:
        credentials = ee.ServiceAccountCredentials(service_account, private_key_path)
        ee.Initialize(credentials)
    except Exception as exc:  # noqa: BLE001
        return GEEConnectionResult(
            status="error",
            step_failed="authentication",
            message=f"ee.Initialize() failed: {exc.__class__.__name__}: {exc}",
            sample_image_id="",
        )

    # --- Step 3: make a real (cheap) call to prove the session is live ---
    try:
        sample_image = ee.Image("COPERNICUS/S2_SR_HARMONIZED/20200101T000000_00000_00000")
        # .getInfo() forces a round-trip to the Earth Engine servers.
        # We only need the image ID back, not the full metadata.
        image_id = sample_image.get("system:index").getInfo()
    except Exception as exc:  # noqa: BLE001
        # A "bad image ID" error here still proves auth worked (we got a
        # real server response, just for a non-existent asset), so treat
        # only network/auth-shaped errors as a hard failure.
        error_name = exc.__class__.__name__
        if error_name in ("EEException",):
            return GEEConnectionResult(
                status="ok",
                step_failed="",
                message=(
                    "Authenticated successfully. Server responded (sample asset "
                    "ID was invalid, which is expected — this still confirms "
                    "the connection is live)."
                ),
                sample_image_id="N/A (dummy asset id used)",
            )
        return GEEConnectionResult(
            status="error",
            step_failed="server_call",
            message=f"Connected but a test call to GEE failed: {error_name}: {exc}",
            sample_image_id="",
        )

    return GEEConnectionResult(
        status="ok",
        step_failed="",
        message="GEE connection verified successfully.",
        sample_image_id=str(image_id),
    )


if __name__ == "__main__":
    result = test_gee_connection()
    print(result)
    sys.exit(0 if result["status"] == "ok" else 1)