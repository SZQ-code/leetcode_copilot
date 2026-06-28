from typing import Protocol

from app.schemas.problem import ProblemSolution


class AIProvider(Protocol):
    def solve(self, problem_content: str) -> ProblemSolution:
        """Generate a validated solution for an algorithm problem."""

        ...
