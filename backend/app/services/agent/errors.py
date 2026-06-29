from app.services.ai.providers.errors import AISolverError


class AgentLoopLimitError(AISolverError):
    """The agent exceeded its model-iteration or tool-execution limit."""


class AgentResponseError(AISolverError):
    """The model returned an unusable agent response."""


class AgentActionConflictError(Exception):
    """A pending action cannot be confirmed in its current state."""
