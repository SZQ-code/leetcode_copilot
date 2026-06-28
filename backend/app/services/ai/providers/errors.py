class AISolverError(Exception):
    """Base exception for expected AI solver failures."""


class AIProviderTimeoutError(AISolverError):
    """The configured AI provider did not respond before the timeout."""


class AIProviderConfigurationError(AISolverError):
    """The configured AI provider credentials are invalid or unauthorized."""


class AIProviderUnavailableError(AISolverError):
    """The configured AI provider is temporarily unavailable."""


class AIResponseFormatError(AISolverError):
    """The provider response does not match the solution contract."""
