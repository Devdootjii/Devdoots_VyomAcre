"""
migrate_add_seeker_id.py
Divyansh — Identity & privacy fix (Sonnet task brief, Sep 2026): add the
new LeaseRequest.seeker_id column to an already-existing lease_requests
table.

Why this script exists:
    Base.metadata.create_all() (called on app startup in main.py) only
    CREATES tables that don't exist yet — it does NOT add columns to
    tables that are already there. Both the live Render PostgreSQL
    database and any existing local SQLite file already have a
    lease_requests table from before this fix, so seeker_id will never
    show up on its own. Without this script, every INSERT that now sets
    seeker_id would crash with "column does not exist" the moment the
    updated code runs against an old database.

Idempotent by design: safe to run any number of times, on either engine —
it checks whether the column is already there before doing anything, and
just prints "skipped" if so. This is also why it's a *separate* script
run once by hand rather than something wired into app startup: DDL like
this should be a deliberate, visible step (Divyansh runs it once against
Render Postgres after merging), not something that fires silently on
every boot.

Existing rows keep seeker_id = NULL after this runs — they're test data
created before lease requests were tied to a real seeker account, so
there's nothing to backfill them with. Every new row (post-fix code) sets
seeker_id from the token at creation time — see routes/lease_api.py.

Usage:
    python migrate_add_seeker_id.py
"""

import sys
from pathlib import Path

from sqlalchemy import text

sys.path.insert(0, str(Path(__file__).resolve().parent))

from config import settings  # noqa: E402,F401 — importing this loads the same
                              # .env / settings the running app uses, so we're
                              # guaranteed to be pointed at the same database
                              # `database.engine` below was built from.
from database import engine  # noqa: E402

TABLE_NAME = "lease_requests"
COLUMN_NAME = "seeker_id"


def _column_exists(conn) -> bool:
    """
    Dialect-aware existence check. Postgres has information_schema;
    SQLite doesn't, so it needs the PRAGMA table_info fallback instead.
    """
    dialect = conn.engine.dialect.name

    if dialect == "sqlite":
        rows = conn.execute(text(f"PRAGMA table_info({TABLE_NAME})")).fetchall()
        # PRAGMA table_info columns: (cid, name, type, notnull, dflt_value, pk)
        existing_columns = {row[1] for row in rows}
        return COLUMN_NAME in existing_columns

    # Postgres (and anything else with a real information_schema).
    result = conn.execute(
        text(
            "SELECT column_name FROM information_schema.columns "
            "WHERE table_name = :table_name AND column_name = :column_name"
        ),
        {"table_name": TABLE_NAME, "column_name": COLUMN_NAME},
    ).first()
    return result is not None


def migrate() -> None:
    dialect = engine.dialect.name
    target = engine.url.render_as_string(hide_password=True)
    print(f"Target database: {target} (dialect={dialect})")

    with engine.begin() as conn:
        if _column_exists(conn):
            print(f"Column '{COLUMN_NAME}' already exists on '{TABLE_NAME}' — skipped.")
            return

        # SQLite has no native UUID type — "UUID" as a bare type name gets
        # NUMERIC affinity there, which SQLite happily stores UUID strings
        # under anyway (SQLite affinities are advisory, not enforced), so
        # this stays a single statement rather than branching per dialect
        # for the type itself. Postgres gets the explicit NULL for clarity;
        # SQLite's ADD COLUMN grammar doesn't accept a bare NULL constraint,
        # so it's omitted there (columns are nullable by default anyway).
        if dialect == "sqlite":
            conn.execute(text(f"ALTER TABLE {TABLE_NAME} ADD COLUMN {COLUMN_NAME} UUID"))
        else:
            conn.execute(text(f"ALTER TABLE {TABLE_NAME} ADD COLUMN {COLUMN_NAME} UUID NULL"))

        print(f"Column '{COLUMN_NAME}' added to '{TABLE_NAME}' — ran.")
        print("Existing rows have seeker_id = NULL (expected — they're test data "
              "created before this fix).")


if __name__ == "__main__":
    migrate()