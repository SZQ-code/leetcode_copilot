from typing import cast

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload, selectinload

from app.models import Problem, Solution, Tag
from app.schemas.problem import (
    ProblemDetail,
    ProblemDifficulty,
    ProblemListItem,
    ProblemSolution,
    ProblemUpdateRequest,
    MasteryStatus,
)


def _ordered_tag_names(problem: Problem) -> list[str]:
    return [
        tag.name
        for tag in sorted(
            problem.tags,
            key=lambda tag: tag.id,
        )
    ]


def _to_detail(problem: Problem) -> ProblemDetail:
    solution = problem.solution

    return ProblemDetail(
        problem_id=problem.id,
        original_content=problem.original_content,
        title=problem.title,
        difficulty=cast(ProblemDifficulty, problem.difficulty),
        tags=_ordered_tag_names(problem),
        problem_summary=solution.problem_summary,
        solution_approach=solution.solution_approach,
        algorithm_reason=solution.algorithm_reason,
        python_code=solution.python_code,
        code_explanation=solution.code_explanation,
        time_complexity=solution.time_complexity,
        space_complexity=solution.space_complexity,
        common_mistakes=solution.common_mistakes,
        edge_cases=solution.edge_cases,
        teaching_analysis=solution.teaching_analysis,
        mastery_status=cast(MasteryStatus, problem.mastery_status),
        personal_notes=problem.personal_notes,
        created_at=problem.created_at,
        updated_at=problem.updated_at,
    )


def _problem_query():
    return select(Problem).options(
        joinedload(Problem.solution),
        selectinload(Problem.tags),
    )


def save_solved_problem(
    session: Session,
    original_content: str,
    generated_solution: ProblemSolution,
) -> ProblemDetail:
    ordered_tag_names = list(dict.fromkeys(generated_solution.tags))
    existing_tags = {
        tag.name: tag
        for tag in session.scalars(
            select(Tag).where(Tag.name.in_(ordered_tag_names))
        ).all()
    }
    tags = [
        existing_tags[name] if name in existing_tags else Tag(name=name)
        for name in ordered_tag_names
    ]

    problem = Problem(
        original_content=original_content,
        title=generated_solution.title,
        difficulty=generated_solution.difficulty,
        tags=tags,
        solution=Solution(
            problem_summary=generated_solution.problem_summary,
            solution_approach=generated_solution.solution_approach,
            algorithm_reason=generated_solution.algorithm_reason,
            python_code=generated_solution.python_code,
            code_explanation=generated_solution.code_explanation,
            time_complexity=generated_solution.time_complexity,
            space_complexity=generated_solution.space_complexity,
            common_mistakes=generated_solution.common_mistakes,
            edge_cases=generated_solution.edge_cases,
            teaching_analysis=generated_solution.teaching_analysis,
        ),
    )
    session.add(problem)

    try:
        session.commit()
    except Exception:
        session.rollback()
        raise

    return _to_detail(problem)


def list_problems(session: Session) -> list[ProblemListItem]:
    problems = session.scalars(
        select(Problem)
        .options(selectinload(Problem.tags))
        .order_by(Problem.created_at.desc(), Problem.id.desc())
    ).all()

    return [
        ProblemListItem(
            problem_id=problem.id,
            title=problem.title,
            difficulty=cast(ProblemDifficulty, problem.difficulty),
            tags=_ordered_tag_names(problem),
            mastery_status=cast(MasteryStatus, problem.mastery_status),
            created_at=problem.created_at,
        )
        for problem in problems
    ]


def get_problem(
    session: Session,
    problem_id: int,
) -> ProblemDetail | None:
    problem = session.scalar(
        _problem_query().where(Problem.id == problem_id)
    )
    return _to_detail(problem) if problem is not None else None


def update_problem(
    session: Session,
    problem_id: int,
    updates: ProblemUpdateRequest,
) -> ProblemDetail | None:
    problem = session.scalar(
        _problem_query().where(Problem.id == problem_id)
    )
    if problem is None:
        return None

    update_values = updates.model_dump(exclude_unset=True)
    mastery_status = update_values.get("mastery_status")
    personal_notes = update_values.get("personal_notes")

    if mastery_status is not None:
        problem.mastery_status = mastery_status
    if personal_notes is not None:
        problem.personal_notes = personal_notes

    try:
        session.commit()
    except Exception:
        session.rollback()
        raise

    return _to_detail(problem)
