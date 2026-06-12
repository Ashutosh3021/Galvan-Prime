"""
db/models/eval_result.py — EvalRun ORM model (stub for Phase 7).
"""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, Double, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from db.base import Base


class EvalRun(Base):
    __tablename__ = "eval_runs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    collection: Mapped[str] = mapped_column(String(128), nullable=False)
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="running")
    faithfulness: Mapped[float | None] = mapped_column(Double, nullable=True)
    answer_relevancy: Mapped[float | None] = mapped_column(Double, nullable=True)
    context_recall: Mapped[float | None] = mapped_column(Double, nullable=True)
    context_precision: Mapped[float | None] = mapped_column(Double, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    def __repr__(self) -> str:  # pragma: no cover
        return f"<EvalRun id={self.id} collection={self.collection!r} status={self.status}>"
