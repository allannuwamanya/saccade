"""Google Gemini LLM provider implementation."""

import json
from typing import Any, Dict, Optional, Type
import httpx
from pydantic import BaseModel

from core.config import settings
from core.exceptions import LLMProviderError
from core.llm.base import BaseLLMProvider, LLMResponse


class GeminiLLMProvider(BaseLLMProvider):
    """Integrates with Google Gemini API (Flash / Pro)."""

    def __init__(self, api_key: Optional[str] = None, model: str = "gemini-2.5-flash"):
        self.api_key = api_key or settings.gemini_api_key
        self.model = model

    def _url(self) -> str:
        if not self.api_key:
            raise LLMProviderError("GEMINI_API_KEY is not set.")
        return f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"

    async def generate_text(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.2
    ) -> LLMResponse:
        contents = []
        if system_prompt:
            contents.append({"role": "user", "parts": [{"text": f"SYSTEM INSTRUCTION: {system_prompt}"}]})
            contents.append({"role": "model", "parts": [{"text": "Understood."}]})
        contents.append({"role": "user", "parts": [{"text": prompt}]})

        payload = {
            "contents": contents,
            "generationConfig": {"temperature": temperature}
        }

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                res = await client.post(self._url(), json=payload)
                res.raise_for_status()
                data = res.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                tokens = data.get("usageMetadata", {}).get("totalTokenCount", 0)
                return LLMResponse(
                    content=text,
                    model=self.model,
                    provider="gemini",
                    tokens_used=tokens
                )
        except Exception as e:
            raise LLMProviderError(f"Gemini API request failed: {e}")

    async def generate_json(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        schema: Optional[Type[BaseModel]] = None
    ) -> Dict[str, Any]:
        json_sys = (system_prompt or "") + "\nRespond with valid, strict JSON only. Do not wrap in markdown quotes."
        resp = await self.generate_text(prompt, system_prompt=json_sys, temperature=0.0)
        cleaned = resp.content.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[-1].rsplit("\n```", 1)[0]
        try:
            return json.loads(cleaned)
        except Exception as e:
            raise LLMProviderError(f"Failed to parse JSON from Gemini response: {e}\nRaw: {resp.content}")
