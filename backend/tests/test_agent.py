from typing import Any

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import func, select
from sqlalchemy.orm import Session, sessionmaker

from app.models import (
    AgentMessage,
    AgentSession,
    AgentToolCall,
    LearningMemory,
    Problem,
)
from app.services.agent.errors import AgentLoopLimitError
from app.services.agent.runner import AgentRunner
from app.services.agent.service import (
    get_agent_problem,
    send_agent_message,
)
from app.services.agent.types import (
    AgentModelResponse,
    ModelToolCall,
    ToolChoice,
)

VALID_PROBLEM = (
    "给定一个按非递减顺序排列的整数数组 nums 和目标值 target，"
    "请返回 target 第一次出现的下标，不存在时返回 -1。"
)


def create_problem(client: TestClient) -> int:
    response = client.post(
        "/api/problems/solve",
        json={"content": VALID_PROBLEM},
    )
    assert response.status_code == 200
    return int(response.json()["problem_id"])


class SequenceAgentClient:
    def __init__(self, responses: list[AgentModelResponse]) -> None:
        self.responses = list(responses)
        self.calls: list[dict[str, Any]] = []

    def complete(
        self,
        *,
        messages: list[dict[str, Any]],
        tools: list[dict[str, Any]],
        tool_choice: ToolChoice,
    ) -> AgentModelResponse:
        self.calls.append(
            {
                "messages": list(messages),
                "tools": tools,
                "tool_choice": tool_choice,
            }
        )
        if not self.responses:
            raise AssertionError("No fake agent response remains.")
        return self.responses.pop(0)


class EndlessToolClient:
    def complete(
        self,
        *,
        messages: list[dict[str, Any]],
        tools: list[dict[str, Any]],
        tool_choice: ToolChoice,
    ) -> AgentModelResponse:
        _ = messages, tools, tool_choice
        return AgentModelResponse(
            content=None,
            tool_calls=[
                ModelToolCall(
                    id="endless-call",
                    name="get_learning_profile",
                    arguments="{}",
                )
            ],
        )


def test_empty_agent_conversation_does_not_create_session(
    client: TestClient,
    session_factory: sessionmaker[Session],
) -> None:
    problem_id = create_problem(client)

    response = client.get(f"/api/problems/{problem_id}/agent")

    assert response.status_code == 200
    assert response.json() == {
        "problem_id": problem_id,
        "session_id": None,
        "messages": [],
        "tool_calls": [],
        "memories": [],
        "mastery_status": "未掌握",
        "personal_notes": "",
    }

    with session_factory() as session:
        assert session.scalar(select(func.count(AgentSession.id))) == 0


def test_mock_agent_runs_tool_loop_and_persists_conversation(
    client: TestClient,
) -> None:
    problem_id = create_problem(client)

    response = client.post(
        f"/api/problems/{problem_id}/agent/messages",
        json={"content": "先给我一个不直接暴露答案的提示。"},
    )

    assert response.status_code == 200
    conversation = response.json()
    assert isinstance(conversation["session_id"], int)
    assert [message["role"] for message in conversation["messages"]] == [
        "user",
        "assistant",
    ]
    assert len(conversation["tool_calls"]) == 1
    assert (
        conversation["tool_calls"][0]["tool_name"]
        == "get_problem_context"
    )
    assert conversation["tool_calls"][0]["status"] == "succeeded"

    reloaded = client.get(
        f"/api/problems/{problem_id}/agent"
    ).json()
    assert reloaded == conversation


def test_runner_forces_context_tool_without_duplicate_user_message(
    client: TestClient,
    session_factory: sessionmaker[Session],
) -> None:
    problem_id = create_problem(client)
    fake = SequenceAgentClient(
        [
            AgentModelResponse(
                content=None,
                tool_calls=[
                    ModelToolCall(
                        id="context-call",
                        name="get_problem_context",
                        arguments="{}",
                    )
                ],
            ),
            AgentModelResponse(
                content="先确定二分查找循环中的不变量。",
                tool_calls=[],
            ),
        ]
    )

    with session_factory() as session:
        result = send_agent_message(
            session,
            problem_id=problem_id,
            content="我应该从哪里开始？",
            runner=AgentRunner(model_client=fake),
        )

    assert result is not None
    assert fake.calls[0]["tool_choice"] == {
        "type": "function",
        "function": {"name": "get_problem_context"},
    }
    user_messages = [
        message
        for message in fake.calls[0]["messages"]
        if message["role"] == "user"
    ]
    assert user_messages == [
        {"role": "user", "content": "我应该从哪里开始？"}
    ]


def test_runner_saves_memory_from_a_tool_call(
    client: TestClient,
    session_factory: sessionmaker[Session],
) -> None:
    problem_id = create_problem(client)
    fake = SequenceAgentClient(
        [
            AgentModelResponse(
                content=None,
                tool_calls=[
                    ModelToolCall(
                        id="context-call",
                        name="get_problem_context",
                        arguments="{}",
                    )
                ],
            ),
            AgentModelResponse(
                content=None,
                tool_calls=[
                    ModelToolCall(
                        id="memory-call",
                        name="save_learning_memory",
                        arguments=(
                            '{"memory_type":"misconception",'
                            '"content":"容易忘记继续收缩右边界。"}'
                        ),
                    )
                ],
            ),
            AgentModelResponse(
                content="已经记录这个易错点，下一次会优先提醒你。",
                tool_calls=[],
            ),
        ]
    )

    with session_factory() as session:
        result = send_agent_message(
            session,
            problem_id=problem_id,
            content="我经常忘记继续向左搜索。",
            runner=AgentRunner(model_client=fake),
        )

    assert result is not None
    assert len(result.memories) == 1
    assert result.memories[0].memory_type == "misconception"
    assert len(result.tool_calls) == 2


def test_runner_rolls_back_when_loop_limit_is_reached(
    client: TestClient,
    session_factory: sessionmaker[Session],
) -> None:
    problem_id = create_problem(client)

    with session_factory() as session:
        with pytest.raises(AgentLoopLimitError):
            send_agent_message(
                session,
                problem_id=problem_id,
                content="一直调用工具。",
                runner=AgentRunner(
                    model_client=EndlessToolClient()
                ),
            )

    with session_factory() as session:
        assert session.scalar(select(func.count(AgentSession.id))) == 0
        assert session.scalar(select(func.count(AgentMessage.id))) == 0
        assert session.scalar(select(func.count(AgentToolCall.id))) == 0
        assert session.scalar(select(func.count(LearningMemory.id))) == 0


def test_runner_only_sends_last_twelve_history_messages(
    client: TestClient,
    session_factory: sessionmaker[Session],
) -> None:
    problem_id = create_problem(client)

    with session_factory() as session:
        problem = session.get(Problem, problem_id)
        assert problem is not None
        agent_session = AgentSession(problem=problem)
        for sequence in range(1, 15):
            session.add(
                AgentMessage(
                    session=agent_session,
                    role="user" if sequence % 2 else "assistant",
                    content=f"历史消息 {sequence}",
                    sequence=sequence,
                )
            )
        session.add(agent_session)
        session.commit()

    fake = SequenceAgentClient(
        [
            AgentModelResponse(
                content="这是基于最近上下文的回答。",
                tool_calls=[],
            )
        ]
    )
    with session_factory() as session:
        result = send_agent_message(
            session,
            problem_id=problem_id,
            content="新的问题",
            runner=AgentRunner(model_client=fake),
        )

    assert result is not None
    sent_messages = fake.calls[0]["messages"]
    assert sent_messages[1]["content"] == "历史消息 3"
    assert sent_messages[-2]["content"] == "历史消息 14"
    assert sent_messages[-1] == {
        "role": "user",
        "content": "新的问题",
    }


def test_failed_unknown_tool_is_traced_and_agent_recovers(
    client: TestClient,
    session_factory: sessionmaker[Session],
) -> None:
    problem_id = create_problem(client)
    fake = SequenceAgentClient(
        [
            AgentModelResponse(
                content=None,
                tool_calls=[
                    ModelToolCall(
                        id="unknown-call",
                        name="run_shell",
                        arguments="{}",
                    )
                ],
            ),
            AgentModelResponse(
                content="这个工具不可用，我会只使用学习工具继续帮助你。",
                tool_calls=[],
            ),
        ]
    )

    with session_factory() as session:
        result = send_agent_message(
            session,
            problem_id=problem_id,
            content="请运行系统命令。",
            runner=AgentRunner(model_client=fake),
        )

    assert result is not None
    assert len(result.tool_calls) == 1
    assert result.tool_calls[0].tool_name == "run_shell"
    assert result.tool_calls[0].status == "failed"


def test_pending_record_update_requires_confirmation(
    client: TestClient,
    session_factory: sessionmaker[Session],
) -> None:
    problem_id = create_problem(client)

    with session_factory() as session:
        problem = session.get(Problem, problem_id)
        assert problem is not None
        agent_session = AgentSession(problem=problem)
        message = AgentMessage(
            session=agent_session,
            role="user",
            content="把状态改成学习中。",
            sequence=1,
        )
        tool_call = AgentToolCall(
            session=agent_session,
            trigger_message=message,
            provider_call_id="pending-call",
            tool_name="update_learning_record",
            arguments={"mastery_status": "学习中"},
            result_summary="等待确认：掌握状态改为“学习中”。",
            status="pending_confirmation",
            duration_ms=1,
        )
        session.add_all([agent_session, message, tool_call])
        session.commit()
        tool_call_id = tool_call.id

    before = client.get(f"/api/problems/{problem_id}").json()
    assert before["mastery_status"] == "未掌握"

    response = client.post(
        (
            f"/api/problems/{problem_id}/agent/tool-calls/"
            f"{tool_call_id}/confirm"
        )
    )

    assert response.status_code == 200
    confirmed = response.json()
    assert confirmed["mastery_status"] == "学习中"
    confirmed_tool = next(
        item
        for item in confirmed["tool_calls"]
        if item["id"] == tool_call_id
    )
    assert confirmed_tool["status"] == "confirmed"

    repeated = client.post(
        (
            f"/api/problems/{problem_id}/agent/tool-calls/"
            f"{tool_call_id}/confirm"
        )
    )
    assert repeated.status_code == 200
    assert repeated.json()["mastery_status"] == "学习中"


@pytest.mark.parametrize(
    "payload",
    [
        {},
        {"content": ""},
        {"content": "   "},
        {"content": "x" * 4001},
    ],
)
def test_agent_rejects_invalid_messages(
    client: TestClient,
    payload: dict[str, str],
) -> None:
    problem_id = create_problem(client)

    response = client.post(
        f"/api/problems/{problem_id}/agent/messages",
        json=payload,
    )

    assert response.status_code == 422


def test_agent_missing_problem_returns_404(
    client: TestClient,
) -> None:
    assert client.get("/api/problems/99999/agent").status_code == 404
    assert (
        client.post(
            "/api/problems/99999/agent/messages",
            json={"content": "请给我提示。"},
        ).status_code
        == 404
    )
