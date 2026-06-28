import pytest
from fastapi.testclient import TestClient
from sqlalchemy import func, select
from sqlalchemy.orm import Session, sessionmaker

from app.api.routes import problems as problem_routes
from app.models import Problem, Solution, Tag
from app.services.ai.providers.errors import (
    AIProviderConfigurationError,
    AIProviderTimeoutError,
    AIProviderUnavailableError,
    AIResponseFormatError,
)

VALID_PROBLEM = "给定一个整数数组，请返回其中连续子数组能够得到的最大和。"


@pytest.mark.parametrize(
    ("solver_error", "expected_status", "expected_detail"),
    [
        (
            AIProviderTimeoutError(),
            504,
            "AI 服务响应超时，请稍后重试。",
        ),
        (
            AIProviderConfigurationError(),
            503,
            "AI 服务配置不可用，请检查后端配置。",
        ),
        (
            AIProviderUnavailableError(),
            503,
            "AI 服务暂时不可用，请稍后重试。",
        ),
        (
            AIResponseFormatError(),
            502,
            "AI 返回内容格式异常，请重新提交。",
        ),
    ],
)
def test_ai_failures_return_safe_error_without_persisting(
    client: TestClient,
    session_factory: sessionmaker[Session],
    monkeypatch: pytest.MonkeyPatch,
    solver_error: Exception,
    expected_status: int,
    expected_detail: str,
) -> None:
    def fail_solver(_: str) -> None:
        raise solver_error

    monkeypatch.setattr(
        problem_routes,
        "solve_problem",
        fail_solver,
    )

    response = client.post(
        "/api/problems/solve",
        json={"content": VALID_PROBLEM},
    )

    assert response.status_code == expected_status
    assert response.json() == {"detail": expected_detail}

    with session_factory() as session:
        assert session.scalar(select(func.count(Problem.id))) == 0
        assert session.scalar(select(func.count(Solution.id))) == 0
        assert session.scalar(select(func.count(Tag.id))) == 0
