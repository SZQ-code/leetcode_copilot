from sqlalchemy import case, func, select
from sqlalchemy.orm import Session

from app.models import Problem, Tag
from app.models.associations import problem_tags
from app.schemas.category import CategoryOverview, CategoryStats


def _mastery_rate(mastered_count: int, total_count: int) -> float:
    if total_count == 0:
        return 0.0
    return round(mastered_count / total_count * 100, 1)


def get_category_overview(session: Session) -> CategoryOverview:
    total_problems, mastered_problems = session.execute(
        select(
            func.count(Problem.id),
            func.sum(
                case(
                    (Problem.mastery_status == "已掌握", 1),
                    else_=0,
                )
            ),
        )
    ).one()

    total = int(total_problems or 0)
    mastered = int(mastered_problems or 0)

    rows = session.execute(
        select(
            Tag.name,
            func.count(Problem.id),
            func.sum(
                case(
                    (Problem.mastery_status == "未掌握", 1),
                    else_=0,
                )
            ),
            func.sum(
                case(
                    (Problem.mastery_status == "学习中", 1),
                    else_=0,
                )
            ),
            func.sum(
                case(
                    (Problem.mastery_status == "已掌握", 1),
                    else_=0,
                )
            ),
        )
        .select_from(Tag)
        .join(problem_tags, Tag.id == problem_tags.c.tag_id)
        .join(Problem, Problem.id == problem_tags.c.problem_id)
        .group_by(Tag.id, Tag.name)
    ).all()

    categories = [
        CategoryStats(
            tag=tag,
            total_count=int(total_count),
            unmastered_count=int(unmastered_count or 0),
            learning_count=int(learning_count or 0),
            mastered_count=int(mastered_count or 0),
            review_count=int(unmastered_count or 0) + int(learning_count or 0),
            mastery_rate=_mastery_rate(
                int(mastered_count or 0),
                int(total_count),
            ),
        )
        for (
            tag,
            total_count,
            unmastered_count,
            learning_count,
            mastered_count,
        ) in rows
    ]
    categories.sort(
        key=lambda category: (
            -category.review_count,
            category.mastery_rate,
            category.tag,
        )
    )

    return CategoryOverview(
        total_problems=total,
        mastered_problems=mastered,
        review_problems=total - mastered,
        mastery_rate=_mastery_rate(mastered, total),
        categories=categories,
    )
