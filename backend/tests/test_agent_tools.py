from sqlalchemy.orm import Session, sessionmaker

from app.models import LearningMemory, Problem
from app.services.agent.service import get_agent_problem
from app.services.agent.tools import AgentToolContext, ToolRegistry


def test_tool_registry_exposes_only_approved_tools() -> None:
    names = {
        definition["function"]["name"]
        for definition in ToolRegistry().definitions()
    }

    assert names == {
        "get_problem_context",
        "find_related_problems",
        "get_learning_profile",
        "save_learning_memory",
        "update_learning_record",
    }


def _tool_context(
    session_factory: sessionmaker[Session],
    problem_id: int,
) -> tuple[Session, AgentToolContext]:
    session = session_factory()
    problem = get_agent_problem(session, problem_id)
    assert problem is not None
    return session, AgentToolContext(session=session, problem=problem)


def test_unknown_and_invalid_tools_are_rejected(
    client,
    session_factory: sessionmaker[Session],
) -> None:
    created = client.post(
        "/api/problems/solve",
        json={
            "content": (
                "给定一个有序数组和目标值，使用二分查找返回目标下标。"
            )
        },
    ).json()
    session, context = _tool_context(
        session_factory,
        created["problem_id"],
    )

    try:
        registry = ToolRegistry()
        unknown = registry.execute(
            name="run_shell",
            arguments_json="{}",
            context=context,
        )
        invalid = registry.execute(
            name="find_related_problems",
            arguments_json='{"limit": 100}',
            context=context,
        )
    finally:
        session.close()

    assert unknown.status == "failed"
    assert unknown.payload["error"] == "unknown_tool"
    assert invalid.status == "failed"
    assert invalid.payload["error"] == "invalid_arguments"


def test_record_update_is_only_a_pending_proposal(
    client,
    session_factory: sessionmaker[Session],
) -> None:
    created = client.post(
        "/api/problems/solve",
        json={
            "content": (
                "给定一个有序数组和目标值，使用二分查找返回目标下标。"
            )
        },
    ).json()
    session, context = _tool_context(
        session_factory,
        created["problem_id"],
    )

    try:
        result = ToolRegistry().execute(
            name="update_learning_record",
            arguments_json='{"mastery_status":"已掌握"}',
            context=context,
        )
        problem = session.get(Problem, created["problem_id"])
        assert problem is not None
        assert problem.mastery_status == "未掌握"
    finally:
        session.close()

    assert result.status == "pending_confirmation"
    assert result.arguments == {"mastery_status": "已掌握"}


def test_learning_memory_is_deduplicated(
    client,
    session_factory: sessionmaker[Session],
) -> None:
    created = client.post(
        "/api/problems/solve",
        json={
            "content": (
                "给定一个有序数组和目标值，使用二分查找返回目标下标。"
            )
        },
    ).json()
    session, context = _tool_context(
        session_factory,
        created["problem_id"],
    )
    arguments = (
        '{"memory_type":"misconception",'
        '"content":"容易写错右边界。"}'
    )

    try:
        first = ToolRegistry().execute(
            name="save_learning_memory",
            arguments_json=arguments,
            context=context,
        )
        second = ToolRegistry().execute(
            name="save_learning_memory",
            arguments_json=arguments,
            context=context,
        )
    finally:
        session.rollback()
        session.close()

    assert first.payload["saved"] is True
    assert second.payload == {"saved": False, "reason": "duplicate"}


def test_learning_memory_limit_is_enforced(
    client,
    session_factory: sessionmaker[Session],
) -> None:
    created = client.post(
        "/api/problems/solve",
        json={
            "content": (
                "给定一个有序数组和目标值，使用二分查找返回目标下标。"
            )
        },
    ).json()
    session, context = _tool_context(
        session_factory,
        created["problem_id"],
    )

    try:
        session.add_all(
            [
                LearningMemory(
                    problem_id=created["problem_id"],
                    memory_type="review_focus",
                    content=f"复习重点 {index}",
                )
                for index in range(20)
            ]
        )
        session.commit()
        result = ToolRegistry().execute(
            name="save_learning_memory",
            arguments_json=(
                '{"memory_type":"review_focus",'
                '"content":"第 21 条复习重点"}'
            ),
            context=context,
        )
    finally:
        session.close()

    assert result.status == "failed"
    assert result.payload["error"] == "memory_limit_reached"
