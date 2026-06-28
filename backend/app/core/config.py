from functools import lru_cache
from pathlib import Path
from typing import Any

from pydantic import Field, SecretStr, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIRECTORY = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BACKEND_DIRECTORY / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    deepseek_api_key: SecretStr | None = None
    deepseek_base_url: str = "https://api.deepseek.com"
    deepseek_model: str = "deepseek-v4-flash"
    deepseek_timeout_seconds: float = Field(default=60, gt=0)
    deepseek_max_tokens: int = Field(default=8192, gt=0)

    @field_validator("deepseek_api_key", mode="before")
    @classmethod
    def normalize_api_key(cls, value: Any) -> Any:
        if isinstance(value, str):
            normalized = value.strip()
            return normalized or None
        return value

    @field_validator("deepseek_base_url", "deepseek_model")
    @classmethod
    def require_non_empty_text(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("Configuration value must not be blank.")
        return normalized


@lru_cache
def get_settings() -> Settings:
    return Settings()
