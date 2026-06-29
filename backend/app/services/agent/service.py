from typing import cast

from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.orm import (
    Session,
    joinedload,
    selectinload,
)

from app.models import (
    AgentSession,
    AgentToolCall,
    Problem,
)
from app.models.problem import utc_now
from app.schemas.agent import (
    AgentConversation,
    AgentMessageView,
    AgentToolCallView,
    AgentToolStatus,
    LearningMemoryView,
)
from app.schemas.problem import MasteryStatus
from app.services.agent.errors import AgentActionConflictError
from app.services.agent.runner import AgentRunner
from app.services.agent.tools import UpdateLearningRecordArguments


def _problem_statement():
    return select(Problem).options(
        joinedload(Problem.solution),
        selectinload(Problem.tags),
        selectinload(Problem.learning_memories),
        selectinload(Problem.agent_session).selectinload(
            AgentSession.messages
        ),
        selectinload(Problem.agent_session).selectinload(
            AgentSession.tool_calls
        ),
    )


def get_agent_problem(
    session: Session,
    problem_id: int,
) -> Problem | None:
    return session.scalar(
        _problem_statement().where(Problem.id == problem_id)
    )


def _tool_call_view(tool_call: AgentToolCall) -> AgentToolCallView:
    proposed_mastery_status = None
    proposed_personal_notes = None
    if tool_call.tool_name == "update_learning_record":
        proposed_mastery_status = tool_call.arguments.get(
            "mastery_status"
        )
        proposed_personal_notes = tool_call.arguments.get(
            "personal_notes"
        )

    return AgentToolCallView(
        id=tool_call.id,
        trigger_message_id=tool_call.trigger_message_id,
        tool_name=tool_call.tool_name,
        result_summary=tool_call.result_summary,
        status=cast(AgentToolStatus, tool_call.status),
        duration_ms=tool_call.duration_ms,
        proposed_mastery_status=cast(
            MasteryStatus | None,
            proposed_mastery_status,
        ),
        proposed_personal_notes=proposed_personal_notes,
        created_at=tool_call.created_at,
        confirmed_at=tool_call.confirmed_at,
    )


def to_agent_conversation(problem: Problem) -> AgentConversation:
    agent_session = problem.agent_session
    return AgentConversation(
        problem_id=problem.id,
        session_id=agent_session.id if agent_session else None,
        messages=(
            [
                AgentMessageView.model_validate(message)
                for message in agent_session.messages
            ]
            if agent_session
            else []
        ),
        tool_calls=(
            [
                _tool_call_view(tool_call)
                for tool_call in agent_session.tool_calls
            ]
            if agent_session
            else []
        ),
        memories=[
            LearningMemoryView.model_validate(memory)
            for memory in problem.learning_memories
        ],
        mastery_status=cast(MasteryStatus, problem.mastery_status),
        personal_notes=problem.personal_notes,
    )


def get_agent_conversation(
    session: Session,
    problem_id: int,
) -> AgentConversation | None:
    problem = get_agent_problem(session, problem_id)
    return (
        to_agent_conversation(problem)
        if problem is not None
        else None
    )


def send_agent_message(
    session: Session,
    *,
    problem_id: int,
    content: str,
    runner: AgentRunner | None = None,
) -> AgentConversation | None:
    problem = get_agent_problem(session, problem_id)
    if problem is None:
        return None

    active_runner = runner or AgentRunner()
    active_runner.run(
        database_session=session,
        problem=problem,
        user_content=content,
    )
    session.expire_all()
    refreshed = get_agent_problem(session, problem_id)
    if refreshed is None:
        return None
    return to_agent_conversation(refreshed)


def confirm_agent_tool_call(
    session: Session,
    *,
    problem_id: int,
    tool_call_id: int,
) -> AgentConversation | None:
    problem = get_agent_problem(session, problem_id)
    if problem is None or problem.agent_session is None:
        return None

    tool_call = next(
        (
            item
            for item in problem.agent_session.tool_calls
            if item.id == tool_call_id
        ),
        None,
    )
    if (
        tool_call is None
        or tool_call.tool_name != "update_learning_record"
    ):
        return None
    if tool_call.status == "confirmed":
        return to_agent_conversation(problem)
    if tool_call.status != "pending_confirmation":
        raise AgentActionConflictError(
            "Tool call is not awaiting confirmation."
        )

    try:
        updates = UpdateLearningRecordArguments.model_validate(
            tool_call.arguments,
            strict=True,
        )
    except ValidationError as error:
        raise AgentActionConflictError(
            "Stored tool arguments are invalid."
        ) from error

    if updates.mastery_status is not None:
        problem.mastery_status = updates.mastery_status
    if updates.personal_notes is not None:
        problem.personal_notes = updates.personal_notes
    tool_call.status = "confirmed"
    tool_call.confirmed_at = utc_now()

    try:
        session.commit()
    except Exception:
        session.rollback()
        raise

    session.expire_all()
    refreshed = get_agent_problem(session, problem_id)
    if refreshed is None:
        return None
    return to_agent_conversation(refreshed)
