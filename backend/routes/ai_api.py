"""
routes/ai_api.py
Fix 8 (Divyansh's fix list) — hackathon-mandatory Google AI integration.

Exposes a small chatbot endpoint backed by Gemini so owners/companies can
ask basic questions about VyomAcre (how listing works, how leasing works,
etc.) from a floating widget on the landing page (Ritesh/Harsh, frontend).

Model selection is intentionally defensive: Google renames/retires Gemini
model IDs often (gemini-1.5-flash and gemini-2.5-flash have both been
retired for new users within this project's lifetime alone). Instead of
hardcoding one model name, this module:
  1. Lists every model the API key can currently use.
  2. Prefers "flash" models, ranked by the newest version number in their
     name (so a newer gemini-X.Y-flash is tried before an older one).
  3. If the model actually picked turns out to be deprecated at request
     time (a 404 "no longer available" from Google), it's marked dead for
     this process and the next-best candidate is retried automatically —
     the same user request doesn't fail just because one model name aged out.
"""

import logging
import re

from fastapi import APIRouter
from pydantic import BaseModel, Field

from config import settings
from utils.response_helper import error_response, success_response

logger = logging.getLogger("vyomacre.ai_api")

router = APIRouter(prefix="/api/ai", tags=["AI"])

_SYSTEM_PROMPT = (
    "You are the VyomAcre assistant. VyomAcre is a rooftop and plot leasing marketplace: "
    "property owners list their unused rooftops/plots, Google Earth Engine satellite imagery "
    "auto-verifies the claimed area, an admin approves the listing, and companies (solar, "
    "telecom, logistics) browse verified listings on a map and send lease requests that owners "
    "can accept or reject. Answer questions from owners or companies about how listing, "
    "verification, or leasing works on VyomAcre. Keep answers short (2-4 sentences), practical, "
    "and friendly. If asked something unrelated to VyomAcre or property leasing, politely say "
    "you can only help with VyomAcre-related questions."
)

_configured = False
_config_error = ""
_dead_models: set = set()          # model names confirmed deprecated this process
_working_model_name = ""            # last model name that actually succeeded
_VERSION_RE = re.compile(r"(\d+(?:\.\d+)?)")


def _ensure_configured() -> bool:
    """Configure the Gemini SDK with the API key exactly once per process."""
    global _configured, _config_error
    if _configured:
        return True
    if _config_error:
        return False

    if not settings.GEMINI_API_KEY:
        _config_error = "GEMINI_API_KEY is not configured in the environment (.env)."
        return False

    try:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        _configured = True
        return True
    except Exception as exc:  # noqa: BLE001
        logger.exception("Failed to configure Gemini SDK")
        _config_error = f"Gemini configure() failed: {exc.__class__.__name__}: {exc}"
        return False


def _ranked_candidate_models():
    """
    Every model supporting generateContent, "flash" models first, newest
    version number first within that group, excluding anything already
    confirmed dead this process.
    """
    import google.generativeai as genai

    names = []
    for m in genai.list_models():
        if "generateContent" not in getattr(m, "supported_generation_methods", []):
            continue
        if m.name in _dead_models:
            continue
        names.append(m.name)

    def sort_key(name):
        is_flash = "flash" in name.lower()
        match = _VERSION_RE.search(name)
        version = float(match.group(1)) if match else -1.0
        return (0 if is_flash else 1, -version)

    names.sort(key=sort_key)
    return names


class AskRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=1000, examples=["Roof list karne se kya milega?"])
    context: str = Field(default="vyomacre", max_length=200)


def _is_model_retired_error(exc):
    text = str(exc).lower()
    return "404" in text and ("no longer available" in text or "not found" in text)


@router.post("/ask")
def ask_ai(payload: AskRequest):
    """
    Simple Q&A endpoint for the landing-page chatbot widget.
    `context` is currently just a tag for future use (e.g. distinguishing
    an owner-side widget from a company-side widget); the system prompt
    already carries the platform context Gemini needs.
    """
    if not _ensure_configured():
        return error_response(
            message="AI assistant is not available right now.",
            code=503,
            error_details={"reason": _config_error},
        )

    import google.generativeai as genai

    global _working_model_name

    # Try the last known-good model first (skip re-listing/re-ranking on
    # every request once we've found one that works).
    if _working_model_name:
        ordered_names = [_working_model_name] + [
            n for n in _ranked_candidate_models() if n != _working_model_name
        ]
    else:
        ordered_names = _ranked_candidate_models()

    if not ordered_names:
        return error_response(
            message="AI assistant is not available right now.",
            code=503,
            error_details={"reason": "No usable Gemini models found for this API key."},
        )

    last_error = ""
    for model_name in ordered_names[:5]:  # bounded — don't try forever
        try:
            model = genai.GenerativeModel(model_name=model_name, system_instruction=_SYSTEM_PROMPT)
            response = model.generate_content(payload.question)
            answer = (response.text or "").strip()

            if not answer:
                return error_response(
                    message="AI assistant returned an empty response — please try rephrasing your question.",
                    code=502,
                )

            _working_model_name = model_name  # remember what worked
            return success_response(
                message="Answer generated successfully.",
                data={"question": payload.question, "answer": answer},
                code=200,
            )

        except Exception as exc:  # noqa: BLE001
            last_error = f"{exc.__class__.__name__}: {exc}"
            if _is_model_retired_error(exc):
                logger.warning("Gemini model '%s' is retired — trying the next candidate.", model_name)
                _dead_models.add(model_name)
                if model_name == _working_model_name:
                    _working_model_name = ""
                continue
            # Non-retirement error (bad key, quota, network) — no point
            # trying other model names, they'll fail the same way.
            logger.exception("Gemini call failed for question: %s", payload.question)
            return error_response(
                message="AI assistant failed to answer — please try again.",
                code=502,
                error_details={"reason": last_error},
            )

    return error_response(
        message="AI assistant failed to answer — all candidate models were unavailable.",
        code=502,
        error_details={"reason": last_error},
    )