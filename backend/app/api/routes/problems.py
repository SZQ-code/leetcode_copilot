import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.problem import (
    ProblemDetail,
    ProblemListItem,
    ProblemSolveRequest,
    ProblemUpdateRequest,
)
from app.services.ai_solver import solve_problem
from app.services.ai.providers.errors import (
    AIProviderConfigurationError,
    AIProviderTimeoutError,
    AIProviderUnavailableError,
    AIResponseFormatError,
    AISolverError,
)
from app.services.problem_service import (
    get_problem,
    list_problems,
    save_solved_problem,
    update_problem,
)

router = APIRouter(prefix="/api/problems", tags=["problems"])
DatabaseSession = Annotated[Session, Depends(get_db)]
logger = logging.getLogger(__name__)


def _ai_http_error(error: AISolverError) -> HTTPException:
    if isinstance(error, AIProviderTimeoutError):
        return HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="AI 服务响应超时，请稍后重试。",
        )
    if isinstance(error, AIProviderConfigurationError):
        return HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI 服务配置不可用，请检查后端配置。",
        )
    if isinstance(error, AIProviderUnavailableError):
        return HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI 服务暂时不可用，请稍后重试。",
        )
    if isinstance(error, AIResponseFormatError):
        return HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI 返回内容格式异常，请重新提交。",
        )

    return HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="服务器处理失败，请稍后重试。",
    )


@router.post("/solve", response_model=ProblemDetail)
def solve(
    request: ProblemSolveRequest,
    session: DatabaseSession,
) -> ProblemDetail:
    try:
        generated_solution = solve_problem(request.content)
    except AISolverError as error:
        logger.warning(
            "AI solve failed: category=%s",
            type(error).__name__,
        )
        raise _ai_http_error(error) from error

    return save_solved_problem(
        session,
        original_content=request.content,
        generated_solution=generated_solution,
    )


@router.get("", response_model=list[ProblemListItem])
def history(
    session: DatabaseSession,
    tag: Annotated[
        str | None,
        Query(min_length=1, max_length=100),
    ] = None,
    review_only: bool = False,
) -> list[ProblemListItem]:
    normalized_tag = tag.strip() if tag is not None else None
    if tag is not None and not normalized_tag:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Tag must not be blank.",
        )

    return list_problems(
        session,
        tag=normalized_tag,
        review_only=review_only,
    )


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
