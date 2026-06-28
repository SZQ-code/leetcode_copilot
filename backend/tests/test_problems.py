import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

EXPECTED_FIELDS = {
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
}


def test_solve_problem_returns_complete_mock_solution() -> None:
    response = client.post(
        "/api/problems/solve",
        json={
            "content": (
                "给定一个整数数组 nums 和一个整数目标值 target，"
                "请你在数组中找出和为目标值的两个整数。"
            )
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert set(data) == EXPECTED_FIELDS
    assert data["title"] == "两数之和"
    assert data["tags"] == ["数组", "哈希表"]
    assert data["time_complexity"] == "O(n)"
    assert data["space_complexity"] == "O(n)"


@pytest.mark.parametrize(
    "content",
    [
        "",
        "short",
        "          ",
        "  123456789  ",
    ],
)
def test_solve_problem_rejects_short_content(content: str) -> None:
    response = client.post(
        "/api/problems/solve",
        json={"content": content},
    )

    assert response.status_code == 422
