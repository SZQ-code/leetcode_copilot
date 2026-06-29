from typing import Any
from uuid import uuid4

from openai import (
    APIConnectionError,
    APIStatusError,
    APITimeoutError,
    AuthenticationError,
    OpenAI,
    OpenAIError,
    PermissionDeniedError,
    RateLimitError,
)

from app.core.config import Settings, get_settings
from app.services.agent.errors import AgentResponseError
from app.services.agent.types import (
    AgentModelClient,
    AgentModelResponse,
    ModelToolCall,
    ToolChoice,
)
from app.services.ai.providers.errors import (
    AIProviderConfigurationError,
    AIProviderTimeoutError,
    AIProviderUnavailableError,
)

class DeepSeekAgentModelClient:
    def __init__(
        self,
        settings: Settings,
        client: Any | None = None,
    ) -> None:
        if settings.deepseek_api_key is None:
            raise AIProviderConfigurationError(
                "DeepSeek API key is not configured."
            )
        self._model = settings.deepseek_model
        self._max_tokens = settings.deepseek_max_tokens
        self._client = client or OpenAI(
            api_key=settings.deepseek_api_key.get_secret_value(),
            base_url=settings.deepseek_base_url,
            timeout=settings.deepseek_timeout_seconds,
        )

    def complete(
        self,
        *,
        messages: list[dict[str, Any]],
        tools: list[dict[str, Any]],
        tool_choice: ToolChoice,
    ) -> AgentModelResponse:
        try:
            response = self._client.chat.completions.create(
                model=self._model,
                messages=messages,
                tools=tools,
                tool_choice=tool_choice,
                stream=False,
                max_tokens=self._max_tokens,
                extra_body={"thinking": {"type": "disabled"}},
            )
        except APITimeoutError as error:
            raise AIProviderTimeoutError from error
        except (AuthenticationError, PermissionDeniedError) as error:
            raise AIProviderConfigurationError from error
        except (RateLimitError, APIConnectionError) as error:
            raise AIProviderUnavailableError from error
        except APIStatusError as error:
            if error.status_code in {401, 403}:
                raise AIProviderConfigurationError from error
            raise AIProviderUnavailableError from error
        except OpenAIError as error:
            raise AIProviderUnavailableError from error

        try:
            message = response.choices[0].message
        except (AttributeError, IndexError) as error:
            raise AgentResponseError(
                "Agent response did not include a message."
            ) from error

        tool_calls: list[ModelToolCall] = []
        for call in message.tool_calls or []:
            try:
                tool_calls.append(
                    ModelToolCall(
                        id=call.id,
                        name=call.function.name,
                        arguments=call.function.arguments,
                    )
                )
            except AttributeError as error:
                raise AgentResponseError(
                    "Agent response included an invalid tool call."
                ) from error

        return AgentModelResponse(
            content=message.content,
            tool_calls=tool_calls,
        )


class MockAgentModelClient:
    def complete(
        self,
        *,
        messages: list[dict[str, Any]],
        tools: list[dict[str, Any]],
        tool_choice: ToolChoice,
    ) -> AgentModelResponse:
        _ = tools

        if isinstance(tool_choice, dict):
            name = tool_choice["function"]["name"]
            return AgentModelResponse(
                content=None,
                tool_calls=[
                    ModelToolCall(
                        id=f"mock-{uuid4().hex}",
                        name=name,
                        arguments="{}",
                    )
                ],
            )

        if messages and messages[-1]["role"] == "tool":
            return AgentModelResponse(
                content=(
                    "先抓住当前题目的核心不变量，再尝试用一个最小示例手动走一遍。"
                    "如果你愿意，可以把你的思路或代码贴出来，我会继续追问和检查。"
                ),
                tool_calls=[],
            )

        latest_user = next(
            (
                message["content"]
                for message in reversed(messages)
                if message["role"] == "user"
            ),
            "",
        )
        if "相似" in latest_user:
            return AgentModelResponse(
                content=None,
                tool_calls=[
                    ModelToolCall(
                        id=f"mock-{uuid4().hex}",
                        name="find_related_problems",
                        arguments='{"limit": 3}',
                    )
                ],
            )

        return AgentModelResponse(
            content=(
                "你可以先说明当前最不确定的是题意、边界条件还是代码实现，"
                "我会从对应位置给出下一步提示。"
            ),
            tool_calls=[],
        )


def get_agent_model_client(
    settings: Settings | None = None,
) -> AgentModelClient:
    active_settings = settings or get_settings()
    if active_settings.deepseek_api_key is None:
        return MockAgentModelClient()
    return DeepSeekAgentModelClient(active_settings)
