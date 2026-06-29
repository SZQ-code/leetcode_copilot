import json
from dataclasses import dataclass
from typing import Any, Callable, Literal

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    StringConstraints,
    ValidationError,
    model_validator,
)
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload
from typing_extensions import Annotated

from app.models import LearningMemory, Problem, Tag
from app.schemas.problem import MasteryStatus
from app.services.category_service import get_category_overview

ToolStatus = Literal[
    "succeeded",
    "failed",
    "pending_confirmation",
]


class EmptyToolArguments(BaseModel):
    model_config = ConfigDict(extra="forbid")


class FindRelatedProblemsArguments(BaseModel):
    model_config = ConfigDict(extra="forbid")

    limit: int = Field(default=3, ge=1, le=5)


MemoryContent = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=1, max_length=500),
]


class SaveLearningMemoryArguments(BaseModel):
    model_config = ConfigDict(extra="forbid")

    memory_type: Literal[
        "misconception",
        "strength",
        "review_focus",
    ]
    content: MemoryContent


PersonalNotes = Annotated[
    str,
    StringConstraints(max_length=5000),
]


class UpdateLearningRecordArguments(BaseModel):
    model_config = ConfigDict(extra="forbid")

    mastery_status: MasteryStatus | None = None
    personal_notes: PersonalNotes | None = None

    @model_validator(mode="after")
    def require_update(self) -> "UpdateLearningRecordArguments":
        if self.mastery_status is None and self.personal_notes is None:
            raise ValueError("At least one update field must be provided.")
        return self


@dataclass
class AgentToolContext:
    session: Session
    problem: Problem


@dataclass(frozen=True)
class ToolExecutionResult:
    status: ToolStatus
    arguments: dict[str, Any]
    payload: dict[str, Any]
    summary: str


ToolHandler = Callable[
    [BaseModel, AgentToolContext],
    ToolExecutionResult,
]


@dataclass(frozen=True)
class ToolSpec:
    name: str
    description: str
    parameters: dict[str, Any]
    arguments_model: type[BaseModel]
    handler: ToolHandler

    def definition(self) -> dict[str, Any]:
        return {
            "type": "function",
            "function": {
                "name": self.name,
                "description": self.description,
                "parameters": self.parameters,
            },
        }


def _ordered_tag_names(problem: Problem) -> list[str]:
    return [
        tag.name
        for tag in sorted(problem.tags, key=lambda tag: tag.id)
    ]


def _get_problem_context(
    _: BaseModel,
    context: AgentToolContext,
) -> ToolExecutionResult:
    problem = context.problem
    solution = problem.solution
    tags = _ordered_tag_names(problem)

    return ToolExecutionResult(
        status="succeeded",
        arguments={},
        payload={
            "problem_id": problem.id,
            "original_content": problem.original_content,
            "title": problem.title,
            "difficulty": problem.difficulty,
            "tags": tags,
            "problem_summary": solution.problem_summary,
            "solution_approach": solution.solution_approach,
            "algorithm_reason": solution.algorithm_reason,
            "python_code": solution.python_code,
            "time_complexity": solution.time_complexity,
            "space_complexity": solution.space_complexity,
            "common_mistakes": solution.common_mistakes,
            "edge_cases": solution.edge_cases,
            "teaching_analysis": solution.teaching_analysis,
            "mastery_status": problem.mastery_status,
            "personal_notes": problem.personal_notes,
        },
        summary=f"已读取题目“{problem.title}”及其学习记录。",
    )


def _find_related_problems(
    arguments: BaseModel,
    context: AgentToolContext,
) -> ToolExecutionResult:
    parsed = FindRelatedProblemsArguments.model_validate(arguments)
    tag_names = set(_ordered_tag_names(context.problem))
    if not tag_names:
        return ToolExecutionResult(
            status="succeeded",
            arguments=parsed.model_dump(),
            payload={"problems": []},
            summary="当前题目没有标签，未找到相似题。",
        )

    candidates = context.session.scalars(
        select(Problem)
        .join(Problem.tags)
        .where(
            Problem.id != context.problem.id,
            Tag.name.in_(tag_names),
        )
        .options(selectinload(Problem.tags))
        .distinct()
    ).all()
    ranked = sorted(
        candidates,
        key=lambda problem: (
            -len(tag_names.intersection(_ordered_tag_names(problem))),
            0 if problem.mastery_status != "已掌握" else 1,
            -problem.id,
        ),
    )[: parsed.limit]

    problems = [
        {
            "problem_id": problem.id,
            "title": problem.title,
            "difficulty": problem.difficulty,
            "mastery_status": problem.mastery_status,
            "shared_tags": sorted(
                tag_names.intersection(_ordered_tag_names(problem))
            ),
        }
        for problem in ranked
    ]
    return ToolExecutionResult(
        status="succeeded",
        arguments=parsed.model_dump(),
        payload={"problems": problems},
        summary=f"找到 {len(problems)} 道相似题。",
    )


def _get_learning_profile(
    _: BaseModel,
    context: AgentToolContext,
) -> ToolExecutionResult:
    overview = get_category_overview(context.session)
    weak_tags = [
        {
            "tag": category.tag,
            "review_count": category.review_count,
            "mastery_rate": category.mastery_rate,
        }
        for category in overview.categories[:5]
    ]
    return ToolExecutionResult(
        status="succeeded",
        arguments={},
        payload={
            "total_problems": overview.total_problems,
            "mastered_problems": overview.mastered_problems,
            "review_problems": overview.review_problems,
            "mastery_rate": overview.mastery_rate,
            "weak_tags": weak_tags,
        },
        summary=(
            f"已读取学习画像：掌握率 {overview.mastery_rate}%，"
            f"待复习 {overview.review_problems} 题。"
        ),
    )


def _pending_memories(
    session: Session,
    problem_id: int,
) -> list[LearningMemory]:
    return [
        item
        for item in session.new
        if isinstance(item, LearningMemory)
        and item.problem_id == problem_id
    ]


def _save_learning_memory(
    arguments: BaseModel,
    context: AgentToolContext,
) -> ToolExecutionResult:
    parsed = SaveLearningMemoryArguments.model_validate(arguments)
    values = parsed.model_dump()
    pending = _pending_memories(context.session, context.problem.id)
    duplicate_pending = any(
        item.memory_type == parsed.memory_type
        and item.content == parsed.content
        for item in pending
    )
    duplicate_saved = context.session.scalar(
        select(LearningMemory.id).where(
            LearningMemory.problem_id == context.problem.id,
            LearningMemory.memory_type == parsed.memory_type,
            LearningMemory.content == parsed.content,
        )
    )
    if duplicate_pending or duplicate_saved is not None:
        return ToolExecutionResult(
            status="succeeded",
            arguments=values,
            payload={"saved": False, "reason": "duplicate"},
            summary="这条学习记忆已经存在。",
        )

    saved_count = context.session.scalar(
        select(func.count(LearningMemory.id)).where(
            LearningMemory.problem_id == context.problem.id
        )
    )
    if int(saved_count or 0) + len(pending) >= 20:
        return ToolExecutionResult(
            status="failed",
            arguments=values,
            payload={
                "error": "memory_limit_reached",
                "message": "This problem already has 20 memories.",
            },
            summary="未保存记忆：当前题目的记忆数量已达上限。",
        )

    memory = LearningMemory(
        problem_id=context.problem.id,
        memory_type=parsed.memory_type,
        content=parsed.content,
    )
    context.session.add(memory)
    return ToolExecutionResult(
        status="succeeded",
        arguments=values,
        payload={
            "saved": True,
            "memory_type": parsed.memory_type,
            "content": parsed.content,
        },
        summary="已保存一条长期学习记忆。",
    )


def _update_learning_record(
    arguments: BaseModel,
    _: AgentToolContext,
) -> ToolExecutionResult:
    parsed = UpdateLearningRecordArguments.model_validate(arguments)
    values = parsed.model_dump(exclude_none=True)
    changes: list[str] = []
    if parsed.mastery_status is not None:
        changes.append(f"掌握状态改为“{parsed.mastery_status}”")
    if parsed.personal_notes is not None:
        changes.append("更新个人备注")

    return ToolExecutionResult(
        status="pending_confirmation",
        arguments=values,
        payload={
            "status": "confirmation_required",
            "proposed_changes": values,
        },
        summary="等待确认：" + "，".join(changes) + "。",
    )


def _tool_specs() -> list[ToolSpec]:
    empty_parameters = {
        "type": "object",
        "properties": {},
        "additionalProperties": False,
    }
    return [
        ToolSpec(
            name="get_problem_context",
            description=(
                "Read the current problem, saved solution, tags, mastery "
                "status, and personal notes."
            ),
            parameters=empty_parameters,
            arguments_model=EmptyToolArguments,
            handler=_get_problem_context,
        ),
        ToolSpec(
            name="find_related_problems",
            description=(
                "Find saved problems that share algorithm tags with the "
                "current problem."
            ),
            parameters={
                "type": "object",
                "properties": {
                    "limit": {
                        "type": "integer",
                        "minimum": 1,
                        "maximum": 5,
                        "default": 3,
                    }
                },
                "additionalProperties": False,
            },
            arguments_model=FindRelatedProblemsArguments,
            handler=_find_related_problems,
        ),
        ToolSpec(
            name="get_learning_profile",
            description=(
                "Read overall mastery rate, weak tags, and review counts."
            ),
            parameters=empty_parameters,
            arguments_model=EmptyToolArguments,
            handler=_get_learning_profile,
        ),
        ToolSpec(
            name="save_learning_memory",
            description=(
                "Save a durable misconception, strength, or review focus "
                "when the conversation reveals one."
            ),
            parameters={
                "type": "object",
                "properties": {
                    "memory_type": {
                        "type": "string",
                        "enum": [
                            "misconception",
                            "strength",
                            "review_focus",
                        ],
                    },
                    "content": {"type": "string"},
                },
                "required": ["memory_type", "content"],
                "additionalProperties": False,
            },
            arguments_model=SaveLearningMemoryArguments,
            handler=_save_learning_memory,
        ),
        ToolSpec(
            name="update_learning_record",
            description=(
                "Propose a mastery-status or personal-notes update. "
                "The user must confirm before it is applied."
            ),
            parameters={
                "type": "object",
                "properties": {
                    "mastery_status": {
                        "type": "string",
                        "enum": ["未掌握", "学习中", "已掌握"],
                    },
                    "personal_notes": {"type": "string"},
                },
                "additionalProperties": False,
            },
            arguments_model=UpdateLearningRecordArguments,
            handler=_update_learning_record,
        ),
    ]


class ToolRegistry:
    def __init__(self) -> None:
        self._specs = {spec.name: spec for spec in _tool_specs()}

    def definitions(self) -> list[dict[str, Any]]:
        return [spec.definition() for spec in self._specs.values()]

    def execute(
        self,
        *,
        name: str,
        arguments_json: str,
        context: AgentToolContext,
    ) -> ToolExecutionResult:
        spec = self._specs.get(name)
        if spec is None:
            return ToolExecutionResult(
                status="failed",
                arguments={},
                payload={
                    "error": "unknown_tool",
                    "message": "The requested tool is not available.",
                },
                summary=f"拒绝执行未知工具“{name}”。",
            )

        try:
            raw_arguments = json.loads(arguments_json or "{}")
            if not isinstance(raw_arguments, dict):
                raise ValueError("Tool arguments must be an object.")
            parsed = spec.arguments_model.model_validate(
                raw_arguments,
                strict=True,
            )
        except (json.JSONDecodeError, ValidationError, ValueError):
            return ToolExecutionResult(
                status="failed",
                arguments={},
                payload={
                    "error": "invalid_arguments",
                    "message": "Tool arguments failed validation.",
                },
                summary=f"工具“{name}”参数校验失败。",
            )

        return spec.handler(parsed, context)
