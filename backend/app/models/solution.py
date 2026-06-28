from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.problem import Problem


class Solution(Base):
    __tablename__ = "solutions"

    id: Mapped[int] = mapped_column(primary_key=True)
    problem_id: Mapped[int] = mapped_column(
        ForeignKey("problems.id", ondelete="CASCADE"),
        unique=True,
    )
    problem_summary: Mapped[str] = mapped_column(Text)
    solution_approach: Mapped[str] = mapped_column(Text)
    algorithm_reason: Mapped[str] = mapped_column(Text)
    python_code: Mapped[str] = mapped_column(Text)
    code_explanation: Mapped[list[str]] = mapped_column(JSON)
    time_complexity: Mapped[str] = mapped_column(String(100))
    space_complexity: Mapped[str] = mapped_column(String(100))
    common_mistakes: Mapped[list[str]] = mapped_column(JSON)
    edge_cases: Mapped[list[str]] = mapped_column(JSON)
    teaching_analysis: Mapped[str] = mapped_column(Text)

    problem: Mapped["Problem"] = relationship(back_populates="solution")
