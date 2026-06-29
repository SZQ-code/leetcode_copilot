from datetime import datetime
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, StringConstraints

from app.schemas.problem import MasteryStatus

AgentMessageContent = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=1, max_length=4000),
]
AgentRole = Literal["user", "assistant"]
AgentToolStatus = Literal[
    "succeeded",
    "failed",
    "pending_confirmation",
    "confirmed",
]
LearningMemoryType = Literal[
    "misconception",
    "strength",
    "review_focus",
]


class AgentMessageRequest(BaseModel):
    content: AgentMessageContent


class AgentMessageView(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    role: AgentRole
    content: str
    sequence: int
    created_at: datetime


class AgentToolCallView(BaseModel):
    id: int
    trigger_message_id: int
    tool_name: str
    result_summary: str
    status: AgentToolStatus
    duration_ms: int = Field(ge=0)
    proposed_mastery_status: MasteryStatus | None = None
    proposed_personal_notes: str | None = None
    created_at: datetime
    confirmed_at: datetime | None


class LearningMemoryView(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    memory_type: LearningMemoryType
    content: str
    created_at: datetime
    updated_at: datetime


class AgentConversation(BaseModel):
    problem_id: int
    session_id: int | None
    messages: list[AgentMessageView]
    tool_calls: list[AgentToolCallView]
    memories: list[LearningMemoryView]
    mastery_status: MasteryStatus
    personal_notes: str
