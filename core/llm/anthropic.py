"""Anthropic Claude LLM provider implementation."""

import json
from typing import Any, Dict, Optional, Type
import httpx
from pydantic import BaseModel

from core.config import settings
from core.exceptions import LLMProviderError
from core.llm.base import BaseLLMProvider, LLMResponse


class AnthropicLLMProvider(BaseLLMProvider):
    """Integrates with Anthropic API (Claude 3.5 Sonnet / Haiku)."""

    def __init__(self, api_key: Optional[str] = None, model: str = "claude-3-5-sonnet-20241022"):
        self.api_key = api_key or settings.anthropic_api_key
        self.model = model
        self.endpoint = "https://api.anthropic.com/v1/messages"

    def _headers(self) -> Dict[str, str]:
        if not self.api_key:
            raise LLMProviderError("ANTHROPIC_API_KEY is not set.")
        return {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
        }

    async def generate_text(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.2
    ) -> LLMResponse:
        payload = {
            "model": self.model,
            "max_tokens": 4096,
            "temperature": temperature,
            "messages": [{"role": "user", "content": prompt}]
        }
        if system_prompt:
            payload["system"] = system_prompt

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                res = await client.post(self.endpoint, json=payload, headers=self._headers())
                res.raise_for_status()
                data = res.json()
                content = data["content"][0]["text"]
                tokens = data.get("usage", {}).get("output_tokens", 0)
                return LLMResponse(
                    content=content,
                    model=self.model,
                    provider="anthropic",
                    tokens_used=tokens
                )
        except Exception as e:
            raise LLMProviderError(f"Anthropic API call failed: {e}")

    async def generate_json(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        schema: Optional[Type[BaseModel]] = None
    ) -> Dict[str, Any]:
        json_sys = (system_prompt or "") + "\nRespond with valid, strict JSON only. Do not wrap in markdown or backticks."
        resp = await self.generate_text(prompt, system_prompt=json_sys, temperature=0.0)
        cleaned = resp.content.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[-1].rsplit("\n```", 1)[0]
        try:
            return json.loads(cleaned)
        except Exception as e:
            raise LLMProviderError(f"Failed to parse JSON from Anthropic response: {e}\nRaw: {resp.content}")
