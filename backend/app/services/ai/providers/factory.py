from app.core.config import Settings, get_settings
from app.services.ai.providers.base import AIProvider
from app.services.ai.providers.deepseek import DeepSeekProvider
from app.services.ai.providers.mock import MockProvider


def get_ai_provider(settings: Settings | None = None) -> AIProvider:
    active_settings = settings or get_settings()

    if active_settings.deepseek_api_key is None:
        return MockProvider()

    return DeepSeekProvider(active_settings)
