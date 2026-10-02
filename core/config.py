"""Application settings and environment configuration."""

import os
import warnings
from pathlib import Path
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, AliasChoices

from core.constants import LLMProviderType


class Settings(BaseSettings):
    """Central configuration for Saccade."""

    # LLM Provider Configuration
    llm_provider: LLMProviderType = Field(
        default=LLMProviderType.MOCK,
        validation_alias=AliasChoices("SACCADE_LLM_PROVIDER", "LLM_PROVIDER")
    )

    # API Keys
    anthropic_api_key: Optional[str] = Field(default=None, alias="ANTHROPIC_API_KEY")
    openai_api_key: Optional[str] = Field(default=None, alias="OPENAI_API_KEY")
    gemini_api_key: Optional[str] = Field(default=None, alias="GEMINI_API_KEY")

    # Local Ollama
    ollama_base_url: str = Field(default="http://localhost:11434", alias="OLLAMA_BASE_URL")
    ollama_model: str = Field(default="llama3:8b", alias="OLLAMA_MODEL")

    # LaTeX / Tectonic
    tectonic_path: Optional[str] = Field(default=None, alias="TECTONIC_PATH")

    # Storage Paths
    data_dir: Path = Field(
        default_factory=lambda: Path(".saccade").resolve(),
        alias="SACCADE_DATA_DIR"
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


# Global singleton settings instance
settings = Settings()

if settings.llm_provider == LLMProviderType.MOCK:
    warnings.warn(
        "SACCADE_LLM_PROVIDER is unset or 'mock'. All LLM calls will return "
        "hardcoded deterministic responses. Set a real provider in .env "
        "(e.g. SACCADE_LLM_PROVIDER=anthropic).",
        UserWarning,
        stacklevel=2,
    )
