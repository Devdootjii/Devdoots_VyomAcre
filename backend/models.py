"""
models.py
SQLAlchemy 2.0 typed ORM models for VyomAcre (Divyansh — Day 2 / Day 4).

Uses the SQLAlchemy 2.0 `Mapped` / `mapped_column` style exclusively,
per the Day 2 backend architecture constraint.
"""

import enum
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import Float, ForeignKey, Index, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from database import Base

# Must match engine/scan_manager.GRID_SIZE_DEGREES — used here only to
# compute each ScannedZone's north/south/east/west bounds for the Day 8
# Admin Radar Map. Kept as a plain constant (not imported across the
# backend/engine boundary) so this file has no runtime dependency on the
# engine folder.
GRID_SIZE_DEGREES = 0.01


class RoofStatusEnum(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
    leased = "leased"


class VerificationStatusEnum(str, enum.Enum):
    """
    Day 4 — result of the automatic GEE area-verification background task.
    Separate from RoofStatusEnum, which is the human/admin approval status.
    """
    pending_verification = "pending_verification"  # background task hasn't run yet
    verified = "verified"                            # submitted area roughly matches GEE estimate
    flagged = "flagged"                               # submitted area differs significantly
    verification_failed = "verification_failed"       # GEE call itself failed


class ScanStatusEnum(str, enum.Enum):
    """Day 5/6/7 — outcome of a GEE scan attempt for a given grid zone."""
    scanned = "scanned"                # a live GEE call succeeded for this zone
    failed = "failed"                  # a live GEE call was attempted and failed
    skipped_redundant = "skipped_redundant"  # "Skip & Move" reused a recent scan, no live call made


class RoofListing(Base):
    """
    Represents a rooftop submitted by an owner for leasing/mapping.

    latitude / longitude are plain floats for now; once PostGIS is wired
    in (via GeoAlchemy2), these can be projected into a
    `geography(Point, 4326)` column without changing the public schema.
    """

    __tablename__ = "roof_listings"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True
    )

    owner_name: Mapped[str] = mapped_column(String(120), nullable=False)
    phone_number: Mapped[str] = mapped_column(String(15), nullable=False, index=True)

    area_sqft: Mapped[float] = mapped_column(Float, nullable=False)
    roof_type: Mapped[str] = mapped_column(String(50), nullable=False)  # flat, sloped, tin, concrete

    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)

    status: Mapped[RoofStatusEnum] = mapped_column(
        String(20),
        nullable=False,
        default=RoofStatusEnum.pending,
        server_default=RoofStatusEnum.pending.value,
    )

    # --- Day 4: automatic GEE verification flow ---
    verification_status: Mapped[VerificationStatusEnum] = mapped_column(
        String(30),
        nullable=False,
        default=VerificationStatusEnum.pending_verification,
        server_default=VerificationStatusEnum.pending_verification.value,
    )
    gee_estimated_area_sqft: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    verification_message: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    created_at: Mapped[datetime] = mapped_column(server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        server_default=func.now(), onupdate=func.now(), nullable=False
    )

    __table_args__ = (
        # Day 8/9 — speeds up map-viewport / bounding-box style lookups
        # (e.g. "roofs near this area") until a real PostGIS geography
        # column replaces plain lat/lon.
        Index("ix_roof_listings_lat_lon", "latitude", "longitude"),
    )

    def __repr__(self) -> str:
        return f"<RoofListing id={self.id} owner={self.owner_name} status={self.status}>"


class ScannedZone(Base):
    """
    Day 5/6/7 — Divyansh: spatial gridding record.

    Every lat/lon submitted for GEE verification is snapped to a coarse
    grid cell (see engine/scan_manager.get_zone_key — both layers use the
    same grid math so a coordinate always maps to the same zone_key here
    and in the engine's local cache).

    This table is the durable, cross-process record of "have we already
    scanned around here" — used by the backend's Skip & Move check before
    it schedules another live GEE call, independently of the engine's own
    local JSON cache (which resets if the engine process/container is
    redeployed; this table doesn't).
    """

    __tablename__ = "scanned_zones"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True
    )

    zone_key: Mapped[str] = mapped_column(String(40), nullable=False, unique=True, index=True)
    grid_lat: Mapped[float] = mapped_column(Float, nullable=False)
    grid_lon: Mapped[float] = mapped_column(Float, nullable=False)

    scan_status: Mapped[ScanStatusEnum] = mapped_column(
        String(20),
        nullable=False,
        default=ScanStatusEnum.scanned,
        server_default=ScanStatusEnum.scanned.value,
    )
    gee_estimated_area_sqft: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # Incremented every time a roof lands in this zone, whether or not a
    # live GEE call was actually made for it — useful for spotting hotspots.
    request_count: Mapped[int] = mapped_column(default=1, server_default="1", nullable=False)

    last_scanned_at: Mapped[datetime] = mapped_column(server_default=func.now(), nullable=False)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        server_default=func.now(), onupdate=func.now(), nullable=False
    )

    __table_args__ = (
        Index("ix_scanned_zones_grid_lat_lon", "grid_lat", "grid_lon"),
    )

    def __repr__(self) -> str:
        return f"<ScannedZone zone_key={self.zone_key} status={self.scan_status} requests={self.request_count}>"


class LeaseStatusEnum(str, enum.Enum):
    """Day 9 — lifecycle of a company's lease request for a roof."""
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"


class LeaseRequest(Base):
    """
    Day 9 — Divyansh: a company's request to lease a specific roof.

    One roof can receive lease requests from multiple companies; the owner
    reviews each in their Inbox (Harsh's OwnerInbox.jsx) and accepts or
    rejects it via PATCH /api/lease-requests/{id}.
    """

    __tablename__ = "lease_requests"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True
    )

    roof_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("roof_listings.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    company_name: Mapped[str] = mapped_column(String(150), nullable=False)

    status: Mapped[LeaseStatusEnum] = mapped_column(
        String(20),
        nullable=False,
        default=LeaseStatusEnum.pending,
        server_default=LeaseStatusEnum.pending.value,
    )

    created_at: Mapped[datetime] = mapped_column(server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        server_default=func.now(), onupdate=func.now(), nullable=False
    )

    def __repr__(self) -> str:
        return f"<LeaseRequest id={self.id} roof_id={self.roof_id} status={self.status}>"