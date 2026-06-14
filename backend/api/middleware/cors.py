"""
api/middleware/cors.py — CORS configuration.

Allows the Vite dev server (localhost:5173) and the production Vercel
domain to communicate with the backend.
"""

from fastapi.middleware.cors import CORSMiddleware

from config import get_settings

settings = get_settings()

_DEV_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
]

_PROD_ORIGINS = [
    "https://galvanrag.vercel.app",
]

ALLOWED_ORIGINS = _DEV_ORIGINS if settings.environment == "development" else _PROD_ORIGINS


def add_cors(app) -> None:
    """Attach CORSMiddleware to *app* with the correct origin list."""
    app.add_middleware(
        CORSMiddleware,
        allow_origins=ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
