"""
api/middleware/cors.py — CORS configuration.

Strategy
────────
* The production Vercel origin is always allowed — it is a hard-coded
  known value, not a secret, and blocking it by mistake causes silent
  failures that are hard to diagnose (as happened in production).
* Dev origins are added on top of the base list.
* An optional CORS_ORIGINS env var lets operators append extra origins
  (comma-separated) without touching code — useful for preview deploys
  or custom domains.

Why not environment == "development" branching?
  The old approach silently dropped _PROD_ORIGINS when ENVIRONMENT was
  missing or mis-set in Render's env vars, producing a 502 + CORS error
  with no obvious cause in the backend logs.
"""

from fastapi.middleware.cors import CORSMiddleware

from config import get_settings

settings = get_settings()

# These are always permitted regardless of environment.
_BASE_ORIGINS = [
    "https://galvanrag.vercel.app",
]

# Added in non-production environments (local dev, CI).
_DEV_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
]


def _build_origins() -> list[str]:
    """
    Compute the final allowed-origins list.

    Merges base origins, environment-specific origins, and any extras
    supplied via the CORS_ORIGINS env var (comma-separated).
    """
    origins = list(_BASE_ORIGINS)

    if settings.environment != "production":
        origins.extend(_DEV_ORIGINS)

    # Support extra origins injected at deploy time, e.g. Vercel preview URLs.
    extra = getattr(settings, "cors_origins", "") or ""
    for raw in extra.split(","):
        origin = raw.strip()
        if origin and origin not in origins:
            origins.append(origin)

    return origins


ALLOWED_ORIGINS = _build_origins()


def add_cors(app) -> None:
    """Attach CORSMiddleware to *app* with the correct origin list."""
    app.add_middleware(
        CORSMiddleware,
        allow_origins=ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
