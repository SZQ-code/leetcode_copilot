from typing import Annotated, Literal

from pydantic import BaseModel, StringConstraints

ProblemContent = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=10),
]


class ProblemSolveRequest(BaseModel):
    content: ProblemContent


class ProblemSolution(BaseModel):
    title: str
    difficulty: Literal["简单", "中等", "困难"]
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
