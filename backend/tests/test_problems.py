import pytest
from fastapi.testclient import TestClient
from sqlalchemy import func, select
from sqlalchemy.orm import Session, sessionmaker

from app.models import Problem, Solution, Tag

EXPECTED_FIELDS = {
    "problem_id",
    "original_content",
    "title",
    "difficulty",
    "tags",
    "problem_summary",
    "solution_approach",
    "algorithm_reason",
    "python_code",
    "code_explanation",
    "time_complexity",
    "space_complexity",
    "common_mistakes",
    "edge_cases",
    "teaching_analysis",
    "mastery_status",
    "personal_notes",
    "created_at",
    "updated_at",
}

VALID_PROBLEM = (
    "给定一个整数数组 nums 和一个整数目标值 target，"
    "请你在数组中找出和为目标值的两个整数。"
)


def create_problem(client: TestClient, suffix: str = "") -> dict[str, object]:
    response = client.post(
        "/api/problems/solve",
        json={"content": f"{VALID_PROBLEM}{suffix}"},
    )
    assert response.status_code == 200
    return response.json()


def test_solve_problem_returns_and_persists_complete_detail(
    client: TestClient,
    session_factory: sessionmaker[Session],
) -> None:
    response = client.post("/api/problems/solve", json={"content": VALID_PROBLEM})

    assert response.status_code == 200
    data = response.json()
    assert set(data) == EXPECTED_FIELDS
    assert data["title"] == "两数之和"
    assert data["tags"] == ["数组", "哈希表"]
    assert data["time_complexity"] == "O(n)"
    assert data["space_complexity"] == "O(n)"
    assert data["original_content"] == VALID_PROBLEM
    assert data["mastery_status"] == "未掌握"
    assert data["personal_notes"] == ""
    assert isinstance(data["problem_id"], int)

    with session_factory() as session:
        assert session.scalar(select(func.count(Problem.id))) == 1
        assert session.scalar(select(func.count(Solution.id))) == 1
        assert session.scalar(select(func.count(Tag.id))) == 2


def test_history_is_newest_first_and_reuses_tags(
    client: TestClient,
    session_factory: sessionmaker[Session],
) -> None:
    first = create_problem(client, "第一次提交")
    second = create_problem(client, "第二次提交")

    response = client.get("/api/problems")

    assert response.status_code == 200
    history = response.json()
    assert [item["problem_id"] for item in history] == [
        second["problem_id"],
        first["problem_id"],
    ]
    assert history[0]["tags"] == ["数组", "哈希表"]

    with session_factory() as session:
        assert session.scalar(select(func.count(Problem.id))) == 2
        assert session.scalar(select(func.count(Tag.id))) == 2


def test_problem_detail_can_be_loaded_in_a_new_session(
    client: TestClient,
    session_factory: sessionmaker[Session],
) -> None:
    created = create_problem(client)

    with session_factory() as session:
        persisted = session.get(Problem, created["problem_id"])
        assert persisted is not None
        assert persisted.original_content == VALID_PROBLEM

    response = client.get(f"/api/problems/{created['problem_id']}")

    assert response.status_code == 200
    detail = response.json()
    assert detail["problem_id"] == created["problem_id"]
    assert detail["python_code"] == created["python_code"]


def test_problem_mastery_status_and_notes_can_be_updated(
    client: TestClient,
) -> None:
    created = create_problem(client)
    problem_id = created["problem_id"]

    response = client.patch(
        f"/api/problems/{problem_id}",
        json={
            "mastery_status": "学习中",
            "personal_notes": "复习时重点解释为什么先查补数。",
        },
    )

    assert response.status_code == 200
    updated = response.json()
    assert updated["mastery_status"] == "学习中"
    assert updated["personal_notes"] == "复习时重点解释为什么先查补数。"

    response = client.patch(
        f"/api/problems/{problem_id}",
        json={"mastery_status": "已掌握"},
    )
    assert response.status_code == 200
    assert response.json()["mastery_status"] == "已掌握"
    assert response.json()["personal_notes"] == "复习时重点解释为什么先查补数。"

    reloaded = client.get(f"/api/problems/{problem_id}")
    assert reloaded.json()["mastery_status"] == "已掌握"
    assert reloaded.json()["personal_notes"] == "复习时重点解释为什么先查补数。"


@pytest.mark.parametrize(
    "payload",
    [
        {},
        {"mastery_status": "不知道"},
        {"mastery_status": None},
        {"personal_notes": None},
        {"personal_notes": "x" * 5001},
    ],
)
def test_problem_update_rejects_invalid_payload(
    client: TestClient,
    payload: dict[str, object],
) -> None:
    created = create_problem(client)

    response = client.patch(
        f"/api/problems/{created['problem_id']}",
        json=payload,
    )

    assert response.status_code == 422


def test_missing_problem_returns_404(client: TestClient) -> None:
    assert client.get("/api/problems/99999").status_code == 404
    assert (
        client.patch(
            "/api/problems/99999",
            json={"mastery_status": "学习中"},
        ).status_code
        == 404
    )


@pytest.mark.parametrize(
    "content",
    [
        "",
        "short",
        "          ",
        "  123456789  ",
    ],
)
def test_solve_problem_rejects_short_content(
    client: TestClient,
    content: str,
) -> None:
    response = client.post(
        "/api/problems/solve",
        json={"content": content},
    )

    assert response.status_code == 422
