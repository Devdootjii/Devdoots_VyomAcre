"""
config.py
Centralized application configuration.
All environment-dependent values are loaded via pydantic-settings from a `.env`
file (or real environment variables in production) — nothing is hardcoded.
"""

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # --- Database ---
    DATABASE_URL: str = "postgresql+psycopg2://user:password@localhost:5432/vyomacre"

    # --- App ---
    APP_NAME: str = "VyomAcre Backend"
    APP_ENV: str = "development"  # development | staging | production
    DEBUG: bool = True

    # --- CORS ---
    # Comma-separated list of allowed origins in the .env file, e.g.
    # CORS_ORIGINS=http://localhost:5173,https://vyomacre.vercel.app
    # Defaults to Vite's dev server ports so Balram/Harsh/Ritesh's local
    # frontends work immediately without extra .env setup. Add the
    # deployed Vercel URL here once it exists (Khushi — Day 5-7).
    # Note: browsers reject "*" combined with allow_credentials=True, so
    # keep this as an explicit origin list rather than a wildcard once
    # credentials (cookies/auth headers) are involved.
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

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
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    """Cached settings instance — avoids re-parsing .env on every import."""
    return Settings()


settings = get_settings()