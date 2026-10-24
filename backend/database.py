"""
database.py
SQLAlchemy engine, session factory, and declarative base for VyomAcre.
Connection string is pulled from environment via `config.settings`
(DATABASE_URL) — no credentials are hardcoded here.

PostGIS note: the target Postgres instance should have the `postgis`
extension enabled (`CREATE EXTENSION IF NOT EXISTS postgis;`). Geometry
columns can be added later via GeoAlchemy2 without changing this setup.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from config import settings


def _normalise_db_url(url: str) -> str:
    """
    Pin the Postgres driver explicitly.

    Why (fix — Oct 2026): SQLAlchemy 2.1 changed the DEFAULT DBAPI for a
    plain `postgresql://` URL from psycopg2 to psycopg (v3). This project
    installs `psycopg2-binary`, not psycopg3 — so the moment Render's
    `pip install` pulled SQLAlchemy 2.1 (requirements.txt had no upper
    bound), startup died with:

        ModuleNotFoundError: No module named 'psycopg'
          .../sqlalchemy/dialects/postgresql/psycopg.py

    which then surfaced as "No open ports detected" and a FAILED deploy.
    Forcing `postgresql+psycopg2://` makes the driver choice explicit and
    immune to SQLAlchemy's default changing again.

    Also normalises Render's legacy `postgres://` scheme, which SQLAlchemy
    refuses outright ("Can't load plugin: sqlalchemy.dialects:postgres").
    """
    if url.startswith("postgres://"):
        url = "postgresql://" + url[len("postgres://"):]
    if url.startswith("postgresql://"):
        url = "postgresql+psycopg2://" + url[len("postgresql://"):]
    return url


engine = create_engine(
    _normalise_db_url(settings.DATABASE_URL),
    pool_pre_ping=True,   # verifies connections before use, avoids stale-connection errors
    future=True,
)

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    future=True,
)

Base = declarative_base()


def get_db():
    """
    FastAPI dependency that yields a DB session per-request
    and guarantees it is closed afterwards.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
