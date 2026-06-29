from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.associations import problem_tags

if TYPE_CHECKING:
    from app.models.agent_session import AgentSession
    from app.models.learning_memory import LearningMemory
    from app.models.solution import Solution
    from app.models.tag import Tag


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Problem(Base):
    __tablename__ = "problems"

    id: Mapped[int] = mapped_column(primary_key=True)
    original_content: Mapped[str] = mapped_column(Text)
    title: Mapped[str] = mapped_column(String(200))
    difficulty: Mapped[str] = mapped_column(String(20))
    mastery_status: Mapped[str] = mapped_column(
        String(20),
        default="未掌握",
    )
    personal_notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
    )

    solution: Mapped["Solution"] = relationship(
        back_populates="problem",
        cascade="all, delete-orphan",
        lazy="selectin",
        single_parent=True,
        uselist=False,
    )
    tags: Mapped[list["Tag"]] = relationship(
        secondary=problem_tags,
        back_populates="problems",
        lazy="selectin",
    )
    agent_session: Mapped["AgentSession | None"] = relationship(
        back_populates="problem",
        cascade="all, delete-orphan",
        single_parent=True,
        uselist=False,
    )
    learning_memories: Mapped[list["LearningMemory"]] = relationship(
        back_populates="problem",
        cascade="all, delete-orphan",
        lazy="selectin",
        order_by="LearningMemory.id",
    )
