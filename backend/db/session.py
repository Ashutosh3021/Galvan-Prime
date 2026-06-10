"""
db/session.py — Async SQLAlchemy engine + session factory.

Usage in route handlers:
    async with get_db() as session:
        result = await session.execute(...)

Or via FastAPI dependency injection (see api/deps.py).
"""

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from config import get_settings

settings = get_settings()

# SQLite (used for tests) uses StaticPool and doesn't accept pool_size /
# max_overflow.  All other dialects (PostgreSQL) get the tuned pool settings.
_is_sqlite = settings.database_url.startswith("sqlite")

_engine_kwargs: dict = {
    "echo": settings.environment == "development",
    "pool_pre_ping": not _is_sqlite,  # not supported by StaticPool
}
if not _is_sqlite:
    _engine_kwargs["pool_size"] = 5
    _engine_kwargs["max_overflow"] = 10

engine = create_async_engine(settings.database_url, **_engine_kwargs)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency that yields a database session per request."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
