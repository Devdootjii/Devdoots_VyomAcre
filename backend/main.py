"""
main.py
FastAPI entry point for the VyomAcre backend.
"""

import logging

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException

from config import settings
from database import Base, engine
from routes import ai_api, lease_api, roof_api, zone_api
from utils.response_helper import error_response, success_response

logging.basicConfig(level=logging.INFO if not settings.DEBUG else logging.DEBUG)
logger = logging.getLogger("vyomacre")

app = FastAPI(
    title=settings.APP_NAME,
    description="Rooftop mapping and leasing platform — backend API.",
    version="1.0.0",
    debug=settings.DEBUG,
)

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(roof_api.router)
app.include_router(zone_api.router)
app.include_router(lease_api.router)
app.include_router(ai_api.router)


# ---------------------------------------------------------------------------
# Global exception handlers — guarantee the standardized envelope
# even for errors raised outside individual route try/except blocks.
# ---------------------------------------------------------------------------

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return error_response(
        message="Request validation failed.",
        code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        error_details=exc.errors(),
    )


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return error_response(
        message=str(exc.detail),
        code=exc.status_code,
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled exception")
    return error_response(
        message="Internal server error.",
        code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        error_details={"reason": str(exc)},
    )


# ---------------------------------------------------------------------------
# Startup
# ---------------------------------------------------------------------------

@app.on_event("startup")
def on_startup():
    # For local/dev convenience only. In staging/production, prefer
    # Alembic migrations over create_all() so schema changes are tracked.
    if settings.APP_ENV == "development":
        Base.metadata.create_all(bind=engine)


@app.get("/", tags=["Health"])
def health_check():
    return success_response(message="VyomAcre backend is up and running.", data={"env": settings.APP_ENV})