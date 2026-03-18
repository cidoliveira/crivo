from datetime import datetime
from typing import TYPE_CHECKING, Optional
from uuid import UUID

from sqlalchemy import ForeignKey, func, text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import DateTime, Text

from app.database import Base

if TYPE_CHECKING:
    from app.classification.models import Classification


class Email(Base):
    __tablename__ = "emails"

    id: Mapped[UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    subject: Mapped[str] = mapped_column(Text, nullable=False)
    body_text: Mapped[str] = mapped_column(Text, nullable=False)
    sender: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    received_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    # batch_id added now to avoid a future migration — used in Phase 6 for batch grouping
    batch_id: Mapped[Optional[UUID]] = mapped_column(nullable=True)

    classifications: Mapped[list["Classification"]] = relationship(
        "Classification",
        back_populates="email",
        cascade="all, delete-orphan",
    )
