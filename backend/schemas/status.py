"""
schemas/status.py — Status response models.
"""

from typing import Literal

from pydantic import BaseModel


class ServiceStatus(BaseModel):
    name: str
    status: Literal["healthy", "degraded", "down"]
    latency_ms: int | None = None


class StatusOut(BaseModel):
    api: Literal["healthy", "degraded"]
    services: list[ServiceStatus]
    uptime_seconds: int
    version: str
