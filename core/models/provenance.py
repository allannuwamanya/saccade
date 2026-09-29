"""Data models for fact provenance and the honesty guardrail."""

from datetime import datetime, timezone
from typing import List, Optional
from pydantic import BaseModel, Field


class AtomicFact(BaseModel):
    """An individual atomic, verifiable claim from the user's career history."""
    id: str = Field(description="Unique identifier for this atomic fact, e.g. 'fact_stripe_p99'")
    text: str = Field(description="The canonical claim, e.g. 'Reduced P99 latency by 35ms across 12B daily events'")
    entity: Optional[str] = Field(default=None, description="Company, project, or institution name")
    metrics: List[str] = Field(default_factory=list, description="Verifiable numbers, percentages, or dollar amounts")
    verified: bool = Field(default=True, description="Whether this fact has been confirmed by user or source upload")


class FactProvenance(BaseModel):
    """Provenance tracking metadata linking an experience entry to its source."""
    source_type: str = Field(default="manual", description="'pdf', 'docx', 'linkedin_export', or 'manual'")
    source_ref: Optional[str] = Field(default=None, description="Filename or import identifier")
    imported_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    atomic_facts: List[AtomicFact] = Field(default_factory=list)
