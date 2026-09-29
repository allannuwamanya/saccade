"""Local private LLM provider via Ollama for zero-data-retention."""

import json
from typing import Any, Dict, Optional, Type
import httpx
from pydantic import BaseModel

from core.config import settings
from core.exceptions import LLMProviderError
from core.llm.base import BaseLLMProvider, LLMResponse


class OllamaLLMProvider(BaseLLMProvider):
    """Integrates with locally running Ollama instances (e.g. Llama 3, Mistral, Qwen)."""

    def __init__(self, base_url: Optional[str] = None, model: Optional[str] = None):
        self.base_url = (base_url or settings.ollama_base_url).rstrip("/")
        self.model = model or settings.ollama_model

    async def generate_text(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.2
    ) -> LLMResponse:
        endpoint = f"{self.base_url}/api/generate"
        payload = {
            "model": self.model,
            "prompt": prompt,
            "system": system_prompt or "",
            "stream": False,
            "options": {"temperature": temperature}
        }

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                res = await client.post(endpoint, json=payload)
                res.raise_for_status()
                data = res.json()
                return LLMResponse(
                    content=data.get("response", ""),
                    model=self.model,
                    provider="ollama",
                    tokens_used=data.get("eval_count", 0)
                )
        except Exception as e:
            raise LLMProviderError(f"Ollama request failed: {e}")

    async def generate_json(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        schema: Optional[Type[BaseModel]] = None
    ) -> Dict[str, Any]:
        endpoint = f"{self.base_url}/api/generate"
        json_system = (system_prompt or "") + "\nRespond with valid, strict JSON only. Do not wrap in markdown quotes."
        payload = {
            "model": self.model,
            "prompt": prompt,
            "system": json_system,
            "stream": False,
            "format": "json"
        }

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                res = await client.post(endpoint, json=payload)
                res.raise_for_status()
                data = res.json()
                raw_response = data.get("response", "{}")
                return json.loads(raw_response)
        except Exception as e:
            raise LLMProviderError(f"Ollama JSON generation failed: {e}")
