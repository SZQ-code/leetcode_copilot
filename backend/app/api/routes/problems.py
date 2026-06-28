from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.problem import (
    ProblemDetail,
    ProblemListItem,
    ProblemSolveRequest,
    ProblemUpdateRequest,
)
from app.services.ai_solver import solve_problem
from app.services.problem_service import (
    get_problem,
    list_problems,
    save_solved_problem,
    update_problem,
)

router = APIRouter(prefix="/api/problems", tags=["problems"])
DatabaseSession = Annotated[Session, Depends(get_db)]


@router.post("/solve", response_model=ProblemDetail)
def solve(
    request: ProblemSolveRequest,
    session: DatabaseSession,
) -> ProblemDetail:
    generated_solution = solve_problem(request.content)
    return save_solved_problem(
        session,
        original_content=request.content,
        generated_solution=generated_solution,
    )


@router.get("", response_model=list[ProblemListItem])
def history(session: DatabaseSession) -> list[ProblemListItem]:
    return list_problems(session)


@router.get("/{problem_id}", response_model=ProblemDetail)
def detail(
    problem_id: int,
    session: DatabaseSession,
) -> ProblemDetail:
    problem = get_problem(session, problem_id)
    if problem is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Problem not found.",
        )
    return problem


@router.patch("/{problem_id}", response_model=ProblemDetail)
def update(
    problem_id: int,
    request: ProblemUpdateRequest,
    session: DatabaseSession,
) -> ProblemDetail:
    problem = update_problem(session, problem_id, request)
    if problem is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Problem not found.",
        )
    return problem
