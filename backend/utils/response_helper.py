"""
utils/response_helper.py
Small helpers so every route returns the exact same success/error
envelope shape without repeating boilerplate.
"""

from typing import Any, Optional

from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse


def success_response(message: str, data: Any = None, code: int = 200) -> JSONResponse:
    return JSONResponse(
        status_code=code,
        content={
            "status": "success",
            "code": code,
            "message": message,
            "data": jsonable_encoder(data) if data is not None else None,
        },
    )


def error_response(
    message: str,
    code: int = 400,
    error_details: Optional[Any] = None,
) -> JSONResponse:
    return JSONResponse(
        status_code=code,
        content={
            "status": "error",
            "code": code,
            "message": message,
            "error_details": jsonable_encoder(error_details) if error_details is not None else None,
        },
    )