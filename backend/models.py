"""
models.py
SQLAlchemy 2.0 typed ORM models for VyomAcre (Divyansh — Day 2).

Uses the SQLAlchemy 2.0 `Mapped` / `mapped_column` style exclusively,
per the Day 2 backend architecture constraint.
"""

import enum
import uuid
from datetime import datetime

from sqlalchemy import Float, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class RoofStatusEnum(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
    leased = "leased"


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

    created_at: Mapped[datetime] = mapped_column(server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        server_default=func.now(), onupdate=func.now(), nullable=False
    )

    def __repr__(self) -> str:
        return f"<RoofListing id={self.id} owner={self.owner_name} status={self.status}>"