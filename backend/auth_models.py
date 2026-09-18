"""
auth_models.py
Divyansh — Phase 1, T1: User table for authentication.

Kept as its own file (separate from models.py) per the task spec, since
auth is a distinct concern from the roof/lease/zone domain models.
"""

import enum
import uuid
from datetime import datetime

from sqlalchemy import String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class RoleEnum(str, enum.Enum):
    owner = "owner"
    seeker = "seeker"
    admin = "admin"


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True
    )

    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    phone: Mapped[str] = mapped_column(String(15), nullable=False, unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)

    role: Mapped[RoleEnum] = mapped_column(
        String(20),
        nullable=False,
        default=RoleEnum.seeker,
        server_default=RoleEnum.seeker.value,
    )

    created_at: Mapped[datetime] = mapped_column(server_default=func.now(), nullable=False)

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email} role={self.role}>"