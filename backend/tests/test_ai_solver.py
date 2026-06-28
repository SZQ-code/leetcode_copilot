from app.schemas.problem import ProblemSolution
from app.services.ai_solver import solve_problem


def test_mock_solver_returns_structured_solution() -> None:
    solution = solve_problem(
        "给定一个整数数组 nums 和一个整数目标值 target，请找出和为目标值的两个整数。"
    )

    assert isinstance(solution, ProblemSolution)
    assert solution.title == "两数之和"
    assert solution.difficulty == "简单"
    assert solution.tags == ["数组", "哈希表"]
    assert solution.time_complexity == "O(n)"
    assert solution.space_complexity == "O(n)"
    assert "def two_sum" in solution.python_code
