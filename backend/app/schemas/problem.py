from datetime import datetime
from typing import Annotated, Literal

from pydantic import (
    BaseModel,
    ConfigDict,
    StringConstraints,
    model_validator,
)

ProblemContent = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=10),
]
ProblemDifficulty = Literal["简单", "中等", "困难"]
MasteryStatus = Literal["未掌握", "学习中", "已掌握"]


class ProblemSolveRequest(BaseModel):
    content: ProblemContent


class ProblemSolution(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str
    difficulty: ProblemDifficulty
    tags: list[str]
    problem_summary: str
    solution_approach: str
    algorithm_reason: str
    python_code: str
    code_explanation: list[str]
    time_complexity: str
    space_complexity: str
    common_mistakes: list[str]
    edge_cases: list[str]
    teaching_analysis: str


class ProblemListItem(BaseModel):
    problem_id: int
    title: str
    difficulty: ProblemDifficulty
    tags: list[str]
    mastery_status: MasteryStatus
    created_at: datetime


class ProblemDetail(ProblemSolution):
    problem_id: int
    original_content: str
    mastery_status: MasteryStatus
    personal_notes: str
    created_at: datetime
    updated_at: datetime


PersonalNotes = Annotated[
    str,
    StringConstraints(max_length=5000),
]


class ProblemUpdateRequest(BaseModel):
    mastery_status: MasteryStatus | None = None
    personal_notes: PersonalNotes | None = None

    @model_validator(mode="after")
    def require_update(self) -> "ProblemUpdateRequest":
        if self.mastery_status is None and self.personal_notes is None:
            raise ValueError("At least one update field must be provided.")
        return self
