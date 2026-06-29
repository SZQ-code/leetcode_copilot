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
    from app.models.agent_session import AgentSession
    from app.models.agent_tool_call import AgentToolCall


class AgentMessage(Base):
    __tablename__ = "agent_messages"
    __table_args__ = (
        UniqueConstraint(
            "session_id",
            "sequence",
            name="uq_agent_message_session_sequence",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    session_id: Mapped[int] = mapped_column(
        ForeignKey("agent_sessions.id", ondelete="CASCADE"),
    )
    role: Mapped[str] = mapped_column(String(20))
    content: Mapped[str] = mapped_column(Text)
    sequence: Mapped[int] = mapped_column()
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
    )

    session: Mapped["AgentSession"] = relationship(
        back_populates="messages",
    )
    triggered_tool_calls: Mapped[list["AgentToolCall"]] = relationship(
        back_populates="trigger_message",
    )
