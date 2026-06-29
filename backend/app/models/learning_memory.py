from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    DateTime,
    ForeignKey,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.problem import utc_now

if TYPE_CHECKING:
    from app.models.problem import Problem


class LearningMemory(Base):
    __tablename__ = "learning_memories"
    __table_args__ = (
        UniqueConstraint(
            "problem_id",
            "memory_type",
            "content",
            name="uq_learning_memory_problem_type_content",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    problem_id: Mapped[int] = mapped_column(
        ForeignKey("problems.id", ondelete="CASCADE"),
    )
    memory_type: Mapped[str] = mapped_column(String(40))
    content: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
    )

    problem: Mapped["Problem"] = relationship(
        back_populates="learning_memories",
    )
