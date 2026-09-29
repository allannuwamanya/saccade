"""Factory and router for multi-model LLM providers."""

from typing import Optional
from core.config import settings
from core.constants import LLMProviderType
from core.llm.base import BaseLLMProvider
from core.llm.mock import MockLLMProvider
from core.llm.anthropic import AnthropicLLMProvider
from core.llm.openai import OpenAILLMProvider
from core.llm.gemini import GeminiLLMProvider
from core.llm.ollama import OllamaLLMProvider


def get_llm_provider(
    provider_type: Optional[LLMProviderType] = None,
    api_key: Optional[str] = None,
    model: Optional[str] = None
) -> BaseLLMProvider:
    """Returns an instantiated LLM provider based on settings or explicit overrides."""
    active_type = provider_type or settings.llm_provider

    if active_type == LLMProviderType.ANTHROPIC:
        return AnthropicLLMProvider(api_key=api_key, model=model or "claude-3-5-sonnet-20241022")
    elif active_type == LLMProviderType.OPENAI:
        return OpenAILLMProvider(api_key=api_key, model=model or "gpt-4o")
    elif active_type == LLMProviderType.GEMINI:
        return GeminiLLMProvider(api_key=api_key, model=model or "gemini-2.5-flash")
    elif active_type == LLMProviderType.OLLAMA:
        return OllamaLLMProvider(model=model or settings.ollama_model)
    else:
        return MockLLMProvider(model_name=model or "mock-deterministic-v1")
