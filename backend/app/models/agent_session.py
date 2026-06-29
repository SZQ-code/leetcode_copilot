from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.problem import utc_now

if TYPE_CHECKING:
    from app.models.agent_message import AgentMessage
    from app.models.agent_tool_call import AgentToolCall
    from app.models.problem import Problem


class AgentSession(Base):
    __tablename__ = "agent_sessions"

    id: Mapped[int] = mapped_column(primary_key=True)
    problem_id: Mapped[int] = mapped_column(
        ForeignKey("problems.id", ondelete="CASCADE"),
        unique=True,
    )
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
        back_populates="agent_session",
    )
    messages: Mapped[list["AgentMessage"]] = relationship(
        back_populates="session",
        cascade="all, delete-orphan",
        order_by="AgentMessage.sequence",
    )
    tool_calls: Mapped[list["AgentToolCall"]] = relationship(
        back_populates="session",
        cascade="all, delete-orphan",
        order_by="AgentToolCall.id",
    )
