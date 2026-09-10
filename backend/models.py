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

from sqlalchemy import Float, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


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

    def __repr__(self) -> str:
        return f"<RoofListing id={self.id} owner={self.owner_name} status={self.status}>"