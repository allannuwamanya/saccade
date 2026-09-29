"""Abstract base class and response types for multi-model LLM providers."""

from abc import ABC, abstractmethod
from typing import Any, Dict, Optional, Type
from pydantic import BaseModel, Field


class LLMResponse(BaseModel):
    """Normalized response payload from any LLM provider."""
    content: str = Field(description="Raw text content returned by the model")
    json_data: Optional[Dict[str, Any]] = Field(default=None, description="Parsed JSON object if requested")
    model: str = Field(description="Model identifier, e.g. 'claude-3-5-sonnet', 'gpt-4o'")
    provider: str = Field(description="Provider name: 'anthropic', 'openai', 'gemini', 'ollama', 'mock'")
    tokens_used: int = Field(default=0, description="Approximate or reported token count")


class BaseLLMProvider(ABC):
    """Provider-agnostic interface for AI completions and structured outputs."""

    @abstractmethod
    async def generate_text(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.2
    ) -> LLMResponse:
        """Generates plain text response."""
        pass

    @abstractmethod
    async def generate_json(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        schema: Optional[Type[BaseModel]] = None
    ) -> Dict[str, Any]:
        """Generates guaranteed JSON-parseable response conforming to schema."""
        pass
