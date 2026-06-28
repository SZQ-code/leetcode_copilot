from app.schemas.problem import ProblemSolution
from app.services.ai.providers.base import AIProvider
from app.services.ai.providers.factory import get_ai_provider


def solve_problem(
    problem_content: str,
    provider: AIProvider | None = None,
) -> ProblemSolution:
    """Generate a structured solution with the active AI provider."""

    active_provider = provider or get_ai_provider()
    return active_provider.solve(problem_content)
