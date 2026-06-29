from dataclasses import dataclass
from typing import Any, Literal, Protocol


@dataclass(frozen=True)
class ModelToolCall:
    id: str
    name: str
    arguments: str


@dataclass(frozen=True)
class AgentModelResponse:
    content: str | None
    tool_calls: list[ModelToolCall]


ToolChoice = (
    Literal["auto", "none", "required"]
    | dict[str, Any]
)


class AgentModelClient(Protocol):
    def complete(
        self,
        *,
        messages: list[dict[str, Any]],
        tools: list[dict[str, Any]],
        tool_choice: ToolChoice,
    ) -> AgentModelResponse:
        """Return the next assistant message or tool calls."""

        ...
