import json
from types import SimpleNamespace
from typing import Any

import httpx
import pytest
from openai import (
    APIConnectionError,
    APITimeoutError,
    AuthenticationError,
    RateLimitError,
)

from app.core.config import Settings
from app.services.ai.providers.deepseek import DeepSeekProvider
from app.services.ai.providers.errors import (
    AIProviderConfigurationError,
    AIProviderTimeoutError,
    AIProviderUnavailableError,
    AIResponseFormatError,
)
from app.services.ai.providers.factory import get_ai_provider
from app.services.ai.providers.mock import MockProvider

VALID_SOLUTION = {
    "title": "合并区间",
    "difficulty": "中等",
    "tags": ["数组", "排序"],
    "problem_summary": "合并所有相互重叠的区间。",
    "solution_approach": "排序后依次合并。",
    "algorithm_reason": "排序后只需比较相邻区间。",
    "python_code": "def merge(intervals):\n    return intervals",
    "code_explanation": ["先排序。", "再合并。"],
    "time_complexity": "O(n log n)",
    "space_complexity": "O(n)",
    "common_mistakes": ["忘记处理空输入。"],
    "edge_cases": ["所有区间都重叠。"],
    "teaching_analysis": "重点掌握排序如何建立局部关系。",
}


class FakeCompletions:
    def __init__(
        self,
        *,
        content: str | None = None,
        error: Exception | None = None,
    ) -> None:
        self.content = content
        self.error = error
        self.calls: list[dict[str, Any]] = []

    def create(self, **kwargs: Any) -> Any:
        self.calls.append(kwargs)
        if self.error is not None:
            raise self.error
        return SimpleNamespace(
            choices=[
                SimpleNamespace(
                    message=SimpleNamespace(content=self.content)
                )
            ]
        )


class FakeClient:
    def __init__(self, completions: FakeCompletions) -> None:
        self.chat = SimpleNamespace(completions=completions)


def deepseek_settings() -> Settings:
    return Settings(
        _env_file=None,
        deepseek_api_key="test-key",
        deepseek_base_url="https://api.deepseek.com",
        deepseek_model="deepseek-v4-flash",
        deepseek_timeout_seconds=12,
        deepseek_max_tokens=4096,
    )


def test_provider_factory_uses_mock_without_api_key() -> None:
    settings = Settings(_env_file=None, deepseek_api_key="   ")

    assert isinstance(get_ai_provider(settings), MockProvider)


def test_provider_factory_uses_deepseek_with_api_key() -> None:
    assert isinstance(
        get_ai_provider(deepseek_settings()),
        DeepSeekProvider,
    )


def test_deepseek_provider_requests_json_and_validates_solution() -> None:
    completions = FakeCompletions(content=json.dumps(VALID_SOLUTION))
    provider = DeepSeekProvider(
        deepseek_settings(),
        client=FakeClient(completions),
    )

    solution = provider.solve("给定若干区间，请合并所有重叠区间。")

    assert solution.title == "合并区间"
    assert solution.tags == ["数组", "排序"]
    assert len(completions.calls) == 1

    request = completions.calls[0]
    assert request["model"] == "deepseek-v4-flash"
    assert request["max_tokens"] == 4096
    assert request["response_format"] == {"type": "json_object"}
    assert request["extra_body"] == {
        "thinking": {"type": "disabled"}
    }
    assert request["stream"] is False
    assert "json" in request["messages"][0]["content"].lower()
    assert "合并所有重叠区间" in request["messages"][1]["content"]


@pytest.mark.parametrize(
    "content",
    [
        None,
        "",
        "not-json",
        json.dumps({"title": "字段不足"}),
        json.dumps({**VALID_SOLUTION, "unexpected": "field"}),
    ],
)
def test_deepseek_provider_rejects_invalid_responses(
    content: str | None,
) -> None:
    provider = DeepSeekProvider(
        deepseek_settings(),
        client=FakeClient(FakeCompletions(content=content)),
    )

    with pytest.raises(AIResponseFormatError):
        provider.solve("这是一个足够长的算法题文本。")


def upstream_errors() -> list[tuple[Exception, type[Exception]]]:
    request = httpx.Request(
        "POST",
        "https://api.deepseek.com/chat/completions",
    )
    unauthorized_response = httpx.Response(
        401,
        request=request,
    )
    rate_limit_response = httpx.Response(
        429,
        request=request,
    )

    return [
        (
            APITimeoutError(request),
            AIProviderTimeoutError,
        ),
        (
            AuthenticationError(
                "invalid key",
                response=unauthorized_response,
                body=None,
            ),
            AIProviderConfigurationError,
        ),
        (
            RateLimitError(
                "rate limited",
                response=rate_limit_response,
                body=None,
            ),
            AIProviderUnavailableError,
        ),
        (
            APIConnectionError(request=request),
            AIProviderUnavailableError,
        ),
    ]


@pytest.mark.parametrize(("upstream_error", "expected_error"), upstream_errors())
def test_deepseek_provider_maps_sdk_errors(
    upstream_error: Exception,
    expected_error: type[Exception],
) -> None:
    provider = DeepSeekProvider(
        deepseek_settings(),
        client=FakeClient(FakeCompletions(error=upstream_error)),
    )

    with pytest.raises(expected_error):
        provider.solve("这是一个足够长的算法题文本。")
