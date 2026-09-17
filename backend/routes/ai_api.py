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
import threading
import time

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

# --- Phase 2 backend fix: Gemini 429 auto-retry ---
# Free tier is 5 req/min — under normal chatbot traffic this gets hit
# often enough that users should never see a raw 502 for it.
MAX_RETRIES_PER_MODEL = 3
DEFAULT_RETRY_DELAY_SECONDS = 2.0   # used when Google's error doesn't carry a retry_delay
_RETRY_DELAY_RE = re.compile(r"retry_delay\s*\{\s*seconds:\s*(\d+)")

# --- Phase 2 backend fix: same-question cache (5 min) ---
# Keyed on (context, normalized question). A cache hit skips the Gemini
# call entirely, which also helps stay under the 5 req/min free-tier limit
# when multiple people ask the same obvious question in a demo.
_ANSWER_CACHE_TTL_SECONDS = 5 * 60
_answer_cache: dict[tuple[str, str], tuple[str, float]] = {}
_cache_lock = threading.Lock()


def _cache_key(question: str, context: str) -> tuple[str, str]:
    return (context.strip().lower(), " ".join(question.strip().lower().split()))


def _cache_get(key: tuple[str, str]) -> str | None:
    with _cache_lock:
        entry = _answer_cache.get(key)
        if entry is None:
            return None
        answer, stored_at = entry
        if time.monotonic() - stored_at > _ANSWER_CACHE_TTL_SECONDS:
            del _answer_cache[key]
            return None
        return answer


def _cache_set(key: tuple[str, str], answer: str) -> None:
    with _cache_lock:
        _answer_cache[key] = (answer, time.monotonic())


def _extract_retry_delay(exc) -> float:
    """
    google.api_core's ResourceExhausted sometimes carries Google's
    suggested wait time in its error details (a RetryInfo proto rendered
    into the string form as "retry_delay { seconds: N }"). Use that when
    present — it's Google telling us exactly how long the quota window
    needs — otherwise fall back to a fixed default.
    """
    match = _RETRY_DELAY_RE.search(str(exc))
    if match:
        try:
            return float(match.group(1))
        except ValueError:
            pass
    return DEFAULT_RETRY_DELAY_SECONDS


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
    cache_key = _cache_key(payload.question, payload.context)
    cached_answer = _cache_get(cache_key)
    if cached_answer is not None:
        return success_response(
            message="Answer generated successfully.",
            data={"question": payload.question, "answer": cached_answer},
            code=200,
        )

    if not _ensure_configured():
        return error_response(
            message="AI assistant is not available right now.",
            code=503,
            error_details={"reason": _config_error},
        )

    import google.generativeai as genai
    try:
        from google.api_core.exceptions import ResourceExhausted
    except ImportError:  # pragma: no cover - ships as a dependency of google-generativeai
        ResourceExhausted = None  # type: ignore

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

            # Retry loop for 429s specifically. Free tier is 5 req/min, so
            # a single burst of chatbot traffic (e.g. a demo) can trip this
            # even when everything else is healthy — the user should never
            # see a raw 502 for what is really just "wait a couple seconds".
            response = None
            for attempt in range(1, MAX_RETRIES_PER_MODEL + 1):
                try:
                    response = model.generate_content(payload.question)
                    break
                except Exception as inner_exc:  # noqa: BLE001
                    is_quota_error = ResourceExhausted is not None and isinstance(
                        inner_exc, ResourceExhausted
                    )
                    if not is_quota_error:
                        raise
                    if attempt == MAX_RETRIES_PER_MODEL:
                        raise
                    delay = _extract_retry_delay(inner_exc)
                    logger.warning(
                        "Gemini 429 on model '%s' (attempt %d/%d) — retrying in %.1fs.",
                        model_name, attempt, MAX_RETRIES_PER_MODEL, delay,
                    )
                    time.sleep(delay)

            answer = (response.text or "").strip()

            if not answer:
                return error_response(
                    message="AI assistant returned an empty response — please try rephrasing your question.",
                    code=502,
                )

            _working_model_name = model_name  # remember what worked
            _cache_set(cache_key, answer)
            return success_response(
                message="Answer generated successfully.",
                data={"question": payload.question, "answer": answer},
                code=200,
            )

        except Exception as exc:  # noqa: BLE001
            last_error = f"{exc.__class__.__name__}: {exc}"

            if ResourceExhausted is not None and isinstance(exc, ResourceExhausted):
                logger.warning(
                    "Gemini model '%s' still rate-limited after %d retries.",
                    model_name, MAX_RETRIES_PER_MODEL,
                )
                return error_response(
                    message="AI assistant is getting a lot of questions right now — please try again in a few seconds.",
                    code=503,
                    error_details={"reason": last_error},
                )

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