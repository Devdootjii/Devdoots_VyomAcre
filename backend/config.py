"""
config.py
Centralized application configuration — loads everything from .env
via pydantic-settings. Nothing hardcoded.
"""

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Dummy URL removed. System will fail fast if .env is missing.
    DATABASE_URL: str 

    APP_NAME: str = "VyomAcre Backend"
    APP_ENV: str = "development"
    DEBUG: bool = True

    CORS_ORIGINS: str = "*"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    @property
    def cors_origin_list(self) -> list[str]:
        if self.CORS_ORIGINS.strip() == "*":
            return ["*"]
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()