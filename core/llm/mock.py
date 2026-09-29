"""Deterministic mock LLM provider for unit testing, offline execution, and dry-runs."""

import json
from typing import Any, Dict, Optional, Type
from pydantic import BaseModel

from core.llm.base import BaseLLMProvider, LLMResponse


class MockLLMProvider(BaseLLMProvider):
    """Provides deterministic responses for automated test suites and offline pipelines."""

    def __init__(self, model_name: str = "mock-deterministic-v1"):
        self.model_name = model_name

    async def generate_text(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.2
    ) -> LLMResponse:
        content = "Dear Hiring Manager,\n\nI am writing to express my enthusiasm for this role. With my background in high-performance systems and backend engineering, I am confident in my ability to deliver immediate value to your team.\n\nSincerely,\nCandidate"
        return LLMResponse(
            content=content,
            model=self.model_name,
            provider="mock",
            tokens_used=42
        )

    async def generate_json(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        schema: Optional[Type[BaseModel]] = None
    ) -> Dict[str, Any]:
        prompt_lower = prompt.lower()

        # Resume intake mock
        if "resume" in prompt_lower or "intake" in prompt_lower or "career profile" in prompt_lower:
            return {
                "basics": {
                    "name": "Johnathan Vance",
                    "label": "Lead Infrastructure Engineer",
                    "email": "john@example.com",
                    "phone": "+1-555-0123",
                    "summary": "Specializing in Kubernetes and large-scale cloud networks."
                },
                "work": [
                    {
                        "name": "Amazon Web Services (AWS)",
                        "position": "Principal Systems Architect",
                        "startDate": "2020-01",
                        "endDate": "Present",
                        "highlights": [
                            "Scaled VPC control plane across 30 availability zones reducing latency by 45%.",
                            "Managed $12M annual infrastructure capacity."
                        ]
                    }
                ],
                "skills": [
                    {
                        "name": "Cloud & Infrastructure",
                        "keywords": ["AWS", "Kubernetes", "Terraform", "Docker"]
                    },
                    {
                        "name": "Languages",
                        "keywords": ["Go", "Python", "Bash"]
                    }
                ]
            }

        # Job parsing mock
        if "job" in prompt_lower or "posting" in prompt_lower:
            return {
                "title": "Senior Distributed Systems Engineer",
                "company": "Target Tech Corp",
                "location": "San Francisco, CA / Remote",
                "required_skills": ["Rust", "Distributed Systems", "PostgreSQL", "Kafka"],
                "preferred_skills": ["Raft Consensus", "Kubernetes", "gRPC"],
                "keywords": ["distributed systems", "concurrency", "low latency", "microservices"],
                "seniority_level": "Senior"
            }

        # Tailoring mock
        if "tailor" in prompt_lower or "relevance" in prompt_lower or "gap" in prompt_lower:
            return {
                "selected_work_indices": [0, 1],
                "selected_project_indices": [0],
                "gaps": ["Kubernetes production operations experience not explicitly noted in profile"],
                "match_score": 88
            }

        # STAR bullet refinement mock
        if "star" in prompt_lower or "xyz" in prompt_lower or "bullet" in prompt_lower:
            return {
                "refined_highlights": [
                    "Architected multi-region failover pipeline reducing P99 latency by 35ms across 12B daily events.",
                    "Led migration of primary ledger database to CockroachDB with zero production downtime."
                ]
            }

        # Generic structured fallback
        return {
            "status": "success",
            "message": "Deterministic mock structured response."
        }
