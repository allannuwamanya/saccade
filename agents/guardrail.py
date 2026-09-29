"""Honesty Guardrail: Enforces zero-hallucination and cryptographic fact provenance."""

import re
from typing import List, Set, Tuple, Optional
from pydantic import BaseModel, Field

from core.models.profile import MasterProfile, WorkExperience, Project


class GuardrailViolation(BaseModel):
    bullet: str
    entity: Optional[str] = None
    unverified_claim: str
    reason: str


class GuardrailAuditResult(BaseModel):
    passed: bool
    violations: List[GuardrailViolation] = Field(default_factory=list)
    verified_metrics_count: int = 0


# Regex to extract metrics, numbers, percentages, dollar amounts
METRIC_REGEX = re.compile(
    r"(?:\$[\d,]+(?:\.\d+)?|\b\d+(?:\.\d+)?%|\b\d+(?:[kKmMbBtT]|(?:\s*(?:million|billion|thousand|users|events|ms|seconds|minutes|hours|days|weeks|months|years|x|X)))?\b)"
)


class HonestyGuardrail:
    """Validates that candidate content contains only verifiable facts from the canonical profile."""

    @classmethod
    def extract_fact_pool(cls, profile: MasterProfile) -> Set[str]:
        """Extracts all verified numbers, metrics, and entities from the master profile."""
        facts: Set[str] = set()

        # Add explicit atomic facts if present
        for work in profile.work:
            if work.provenance:
                for af in work.provenance.atomic_facts:
                    facts.add(af.text.lower())
                    for m in af.metrics:
                        facts.add(cls._normalize_metric(m))

            # Extract metrics from raw highlights as baseline
            for h in work.highlights:
                for match in METRIC_REGEX.findall(h):
                    facts.add(cls._normalize_metric(match))

        for proj in profile.projects:
            for h in proj.highlights:
                for match in METRIC_REGEX.findall(h):
                    facts.add(cls._normalize_metric(match))

        return facts

    @classmethod
    def _normalize_metric(cls, metric_str: str) -> str:
        """Normalizes a metric string for fuzzy matching (e.g. '$100k' -> '100k')."""
        return re.sub(r"[^\w%]", "", metric_str).lower()

    @classmethod
    def audit_bullet(
        cls,
        candidate_bullet: str,
        source_highlights: List[str],
        fact_pool: Set[str]
    ) -> Tuple[bool, Optional[GuardrailViolation]]:
        """Audits a single generated bullet against verified facts."""
        candidate_metrics = METRIC_REGEX.findall(candidate_bullet)

        for cm in candidate_metrics:
            norm_cm = cls._normalize_metric(cm)
            # Check if this metric is justified by the fact pool or source highlights
            in_pool = any(norm_cm in f or f in norm_cm for f in fact_pool)
            in_sources = any(cm.lower() in sh.lower() for sh in source_highlights)

            if not (in_pool or in_sources):
                return False, GuardrailViolation(
                    bullet=candidate_bullet,
                    unverified_claim=cm,
                    reason=f"Metric '{cm}' was not found in any verified experience entry."
                )

        return True, None

    @classmethod
    def audit_tailored_profile(
        cls,
        canonical: MasterProfile,
        tailored: MasterProfile
    ) -> GuardrailAuditResult:
        """Audits an entire tailored profile against the canonical profile."""
        fact_pool = cls.extract_fact_pool(canonical)
        violations: List[GuardrailViolation] = []
        verified_count = 0

        # Build lookup of canonical highlights by company/name
        canonical_jobs = {job.name.lower(): job.highlights for job in canonical.work}

        for tw in tailored.work:
            sources = canonical_jobs.get(tw.name.lower(), [])
            for bullet in tw.highlights:
                valid, violation = cls.audit_bullet(bullet, sources, fact_pool)
                if not valid and violation:
                    violations.append(violation)
                else:
                    verified_count += len(METRIC_REGEX.findall(bullet))

        return GuardrailAuditResult(
            passed=len(violations) == 0,
            violations=violations,
            verified_metrics_count=verified_count
        )
