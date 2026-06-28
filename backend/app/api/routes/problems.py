from fastapi import APIRouter

from app.schemas.problem import ProblemSolution, ProblemSolveRequest
from app.services.ai_solver import solve_problem

router = APIRouter(prefix="/api/problems", tags=["problems"])


@router.post("/solve", response_model=ProblemSolution)
def solve(request: ProblemSolveRequest) -> ProblemSolution:
    return solve_problem(request.content)
