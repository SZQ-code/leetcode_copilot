from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session, sessionmaker

from app.models import Problem, Tag

VALID_PROBLEM = (
    "给定一个整数数组 nums 和一个整数目标值 target，"
    "请你在数组中找出和为目标值的两个整数。"
)


def create_record(
    client: TestClient,
    session_factory: sessionmaker[Session],
    *,
    suffix: str,
    mastery_status: str,
    tag_names: list[str],
) -> int:
    response = client.post(
        "/api/problems/solve",
        json={"content": f"{VALID_PROBLEM}{suffix}"},
    )
    assert response.status_code == 200
    problem_id = response.json()["problem_id"]

    with session_factory() as session:
        problem = session.get(Problem, problem_id)
        assert problem is not None

        existing_tags = {
            tag.name: tag
            for tag in session.scalars(
                select(Tag).where(Tag.name.in_(tag_names))
            ).all()
        }
        problem.tags = [
            existing_tags[name]
            if name in existing_tags
            else Tag(name=name)
            for name in tag_names
        ]
        problem.mastery_status = mastery_status
        session.commit()

    return problem_id


def seed_learning_records(
    client: TestClient,
    session_factory: sessionmaker[Session],
) -> tuple[int, int, int]:
    unmastered_id = create_record(
        client,
        session_factory,
        suffix="未掌握记录",
        mastery_status="未掌握",
        tag_names=["数组", "哈希表"],
    )
    learning_id = create_record(
        client,
        session_factory,
        suffix="学习中记录",
        mastery_status="学习中",
        tag_names=["数组", "动态规划"],
    )
    mastered_id = create_record(
        client,
        session_factory,
        suffix="已掌握记录",
        mastery_status="已掌握",
        tag_names=["动态规划", "图"],
    )
    return unmastered_id, learning_id, mastered_id


def test_empty_category_overview(client: TestClient) -> None:
    response = client.get("/api/categories")

    assert response.status_code == 200
    assert response.json() == {
        "total_problems": 0,
        "mastered_problems": 0,
        "review_problems": 0,
        "mastery_rate": 0.0,
        "categories": [],
    }


def test_category_overview_counts_rates_and_weakness_order(
    client: TestClient,
    session_factory: sessionmaker[Session],
) -> None:
    seed_learning_records(client, session_factory)

    response = client.get("/api/categories")

    assert response.status_code == 200
    overview = response.json()
    assert overview["total_problems"] == 3
    assert overview["mastered_problems"] == 1
    assert overview["review_problems"] == 2
    assert overview["mastery_rate"] == 33.3

    categories = overview["categories"]
    assert [category["tag"] for category in categories] == [
        "数组",
        "哈希表",
        "动态规划",
        "图",
    ]
    assert categories == [
        {
            "tag": "数组",
            "total_count": 2,
            "unmastered_count": 1,
            "learning_count": 1,
            "mastered_count": 0,
            "review_count": 2,
            "mastery_rate": 0.0,
        },
        {
            "tag": "哈希表",
            "total_count": 1,
            "unmastered_count": 1,
            "learning_count": 0,
            "mastered_count": 0,
            "review_count": 1,
            "mastery_rate": 0.0,
        },
        {
            "tag": "动态规划",
            "total_count": 2,
            "unmastered_count": 0,
            "learning_count": 1,
            "mastered_count": 1,
            "review_count": 1,
            "mastery_rate": 50.0,
        },
        {
            "tag": "图",
            "total_count": 1,
            "unmastered_count": 0,
            "learning_count": 0,
            "mastered_count": 1,
            "review_count": 0,
            "mastery_rate": 100.0,
        },
    ]


def test_problem_list_filters_by_tag_and_review_state(
    client: TestClient,
    session_factory: sessionmaker[Session],
) -> None:
    unmastered_id, learning_id, mastered_id = seed_learning_records(
        client,
        session_factory,
    )

    by_tag = client.get("/api/problems", params={"tag": "动态规划"})
    assert by_tag.status_code == 200
    assert [item["problem_id"] for item in by_tag.json()] == [
        mastered_id,
        learning_id,
    ]

    review_only = client.get(
        "/api/problems",
        params={"review_only": "true"},
    )
    assert review_only.status_code == 200
    assert [item["problem_id"] for item in review_only.json()] == [
        learning_id,
        unmastered_id,
    ]

    combined = client.get(
        "/api/problems",
        params={"tag": "动态规划", "review_only": "true"},
    )
    assert combined.status_code == 200
    assert [item["problem_id"] for item in combined.json()] == [learning_id]

    cleared = client.get(
        "/api/problems",
        params={"tag": "图", "review_only": "true"},
    )
    assert cleared.status_code == 200
    assert cleared.json() == []


def test_problem_list_rejects_invalid_filters(client: TestClient) -> None:
    assert client.get("/api/problems", params={"tag": "   "}).status_code == 422
    assert client.get(
        "/api/problems",
        params={"tag": "x" * 101},
    ).status_code == 422
    assert client.get(
        "/api/problems",
        params={"review_only": "sometimes"},
    ).status_code == 422
