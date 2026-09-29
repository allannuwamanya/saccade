"""OpenAI LLM provider implementation."""

import json
from typing import Any, Dict, Optional, Type
import httpx
from pydantic import BaseModel

from core.config import settings
from core.exceptions import LLMProviderError
from core.llm.base import BaseLLMProvider, LLMResponse


class OpenAILLMProvider(BaseLLMProvider):
    """Integrates with OpenAI API (GPT-4o / GPT-4o-mini)."""

    def __init__(self, api_key: Optional[str] = None, model: str = "gpt-4o"):
        self.api_key = api_key or settings.openai_api_key
        self.model = model
        self.endpoint = "https://api.openai.com/v1/chat/completions"

    def _headers(self) -> Dict[str, str]:
        if not self.api_key:
            raise LLMProviderError("OPENAI_API_KEY is not set.")
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    async def generate_text(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.2
    ) -> LLMResponse:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature
        }

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                res = await client.post(self.endpoint, json=payload, headers=self._headers())
                res.raise_for_status()
                data = res.json()
                content = data["choices"][0]["message"]["content"]
                tokens = data.get("usage", {}).get("total_tokens", 0)
                return LLMResponse(
                    content=content,
                    model=self.model,
                    provider="openai",
                    tokens_used=tokens
                )
        except Exception as e:
            raise LLMProviderError(f"OpenAI API call failed: {e}")

    async def generate_json(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        schema: Optional[Type[BaseModel]] = None
    ) -> Dict[str, Any]:
        messages = []
        json_sys = (system_prompt or "") + "\nRespond with valid, strict JSON only. Do not wrap in markdown quotes."
        messages.append({"role": "system", "content": json_sys})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": self.model,
            "messages": messages,
            "response_format": {"type": "json_object"},
            "temperature": 0.0
        }

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                res = await client.post(self.endpoint, json=payload, headers=self._headers())
                res.raise_for_status()
                data = res.json()
                content = data["choices"][0]["message"]["content"]
                return json.loads(content)
        except Exception as e:
            raise LLMProviderError(f"OpenAI JSON call failed: {e}")
