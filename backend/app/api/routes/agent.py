import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.agent import (
    AgentConversation,
    AgentMessageRequest,
)
from app.services.agent.errors import (
    AgentActionConflictError,
    AgentLoopLimitError,
    AgentResponseError,
)
from app.services.agent.service import (
    confirm_agent_tool_call,
    get_agent_conversation,
    send_agent_message,
)
from app.services.ai.providers.errors import (
    AIProviderConfigurationError,
    AIProviderTimeoutError,
    AIProviderUnavailableError,
    AIResponseFormatError,
    AISolverError,
)

router = APIRouter(
    prefix="/api/problems/{problem_id}/agent",
    tags=["agent"],
)
DatabaseSession = Annotated[Session, Depends(get_db)]
logger = logging.getLogger(__name__)


def _agent_http_error(error: AISolverError) -> HTTPException:
    if isinstance(error, AIProviderTimeoutError):
        return HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Agent 响应超时，请稍后重试。",
        )
    if isinstance(error, AIProviderConfigurationError):
        return HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Agent 服务配置不可用，请检查后端配置。",
        )
    if isinstance(error, AIProviderUnavailableError):
        return HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Agent 服务暂时不可用，请稍后重试。",
        )
    if isinstance(
        error,
        (
            AIResponseFormatError,
            AgentResponseError,
            AgentLoopLimitError,
        ),
    ):
        return HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Agent 未能完成本次学习回合，请重新提交。",
        )
    return HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="服务器处理失败，请稍后重试。",
    )


@router.get("", response_model=AgentConversation)
def conversation(
    problem_id: int,
    session: DatabaseSession,
) -> AgentConversation:
    result = get_agent_conversation(session, problem_id)
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Problem not found.",
        )
    return result


@router.post("/messages", response_model=AgentConversation)
def message(
    problem_id: int,
    request: AgentMessageRequest,
    session: DatabaseSession,
) -> AgentConversation:
    try:
        result = send_agent_message(
            session,
            problem_id=problem_id,
            content=request.content,
        )
    except AISolverError as error:
        logger.warning(
            "Agent turn failed: category=%s",
            type(error).__name__,
        )
        raise _agent_http_error(error) from error

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Problem not found.",
        )
    return result


@router.post(
    "/tool-calls/{tool_call_id}/confirm",
    response_model=AgentConversation,
)
def confirm_tool_call(
    problem_id: int,
    tool_call_id: int,
    session: DatabaseSession,
) -> AgentConversation:
    try:
        result = confirm_agent_tool_call(
            session,
            problem_id=problem_id,
            tool_call_id=tool_call_id,
        )
    except AgentActionConflictError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="该工具操作当前无法确认。",
        ) from error

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="待确认的工具操作不存在。",
        )
    return result
