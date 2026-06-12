"""
db/base.py — SQLAlchemy declarative base shared by all models.
"""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Central base class; all ORM models inherit from this."""

    pass
