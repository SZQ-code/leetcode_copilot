from datetime import datetime
from typing import TYPE_CHECKING, Any

from sqlalchemy import DateTime, ForeignKey, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.problem import utc_now

if TYPE_CHECKING:
    from app.models.agent_message import AgentMessage
    from app.models.agent_session import AgentSession


class AgentToolCall(Base):
    __tablename__ = "agent_tool_calls"

    id: Mapped[int] = mapped_column(primary_key=True)
    session_id: Mapped[int] = mapped_column(
        ForeignKey("agent_sessions.id", ondelete="CASCADE"),
    )
    trigger_message_id: Mapped[int] = mapped_column(
        ForeignKey("agent_messages.id", ondelete="CASCADE"),
    )
    provider_call_id: Mapped[str] = mapped_column(String(200))
    tool_name: Mapped[str] = mapped_column(String(100))
    arguments: Mapped[dict[str, Any]] = mapped_column(JSON)
    result_summary: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(40))
    duration_ms: Mapped[int] = mapped_column(default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
    )
    confirmed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    session: Mapped["AgentSession"] = relationship(
        back_populates="tool_calls",
    )
    trigger_message: Mapped["AgentMessage"] = relationship(
        back_populates="triggered_tool_calls",
    )
