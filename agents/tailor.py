"""Tailoring Agent: Reweights truthful experiences and generates actionable gap analyses."""

from typing import List, Tuple, Set, Dict, Any
from copy import deepcopy

from core.models.profile import MasterProfile, WorkExperience, Skill
from core.models.job import JobPosting
from agents.ats_checker import ATSCheckerAgent


class TailoringAgent:
    """Selects and prioritizes relevant truthful experiences matching target role requirements."""

    @classmethod
    def tailor(
        cls,
        profile: MasterProfile,
        job: JobPosting,
        max_work_items: int = 4,
        max_bullets_per_job: int = 4
    ) -> Tuple[MasterProfile, List[str]]:
        """Tailors a profile against target job requirements, producing a gap analysis."""
        tailored = deepcopy(profile)

        # 1. Build job keyword set
        job_keywords: Set[str] = set()
        for kw in job.required_skills + job.preferred_skills + job.keywords:
            job_keywords.add(kw.lower().strip())

        # 2. Extract profile skill tokens
        profile_skills: Set[str] = set()
        for s in profile.skills:
            for kw in s.keywords:
                profile_skills.add(kw.lower().strip())

        # 3. Perform Gap Analysis
        gaps: List[str] = []
        for req in job.required_skills:
            req_lower = req.lower().strip()
            # Check if this requirement is present in profile skills or highlights
            matched = any(req_lower in ps or ps in req_lower for ps in profile_skills)
            if not matched:
                # Check within work highlights
                matched = any(
                    req_lower in h.lower()
                    for w in profile.work
                    for h in w.highlights
                )
            if not matched:
                gaps.append(f"Missing required qualification: '{req}'")

        # 4. Score and reweight Work Experiences
        scored_work: List[Tuple[float, WorkExperience]] = []
        for work in tailored.work:
            score = cls._score_experience(work, job_keywords)

            # Reorder bullets within this work experience to prioritize relevant ones
            scored_highlights: List[Tuple[int, str]] = []
            for h in work.highlights:
                h_score = sum(1 for kw in job_keywords if kw in h.lower())
                scored_highlights.append((h_score, h))

            scored_highlights.sort(key=lambda x: x[0], reverse=True)
            work.highlights = [h for _, h in scored_highlights[:max_bullets_per_job]]
            scored_work.append((score, work))

        # Sort experiences by relevance score
        scored_work.sort(key=lambda x: x[0], reverse=True)
        tailored.work = [w for _, w in scored_work[:max_work_items]]

        # 5. Prioritize Skills matching the job and incorporate verified domain synonyms
        for skill_group in tailored.skills:
            matching = [k for k in skill_group.keywords if k.lower() in job_keywords]
            other = [k for k in skill_group.keywords if k.lower() not in job_keywords]

            # Promote verified domain synonyms matching target role
            for kw in job.keywords + job.required_skills + job.preferred_skills:
                kw_lower = kw.lower().strip()
                if kw_lower in ATSCheckerAgent.DOMAIN_SYNONYMS:
                    synonyms = ATSCheckerAgent.DOMAIN_SYNONYMS[kw_lower]
                    if any(any(syn in k.lower() for k in skill_group.keywords) for syn in synonyms):
                        if not any(k.lower() == kw_lower for k in matching):
                            matching.append(kw.title() if kw.islower() else kw)

            skill_group.keywords = matching + other

        return tailored, gaps

    @classmethod
    def _score_experience(cls, work: WorkExperience, job_keywords: Set[str]) -> float:
        """Calculates a relevance score for an experience against job keywords."""
        score = 0.0
        # Title match
        for kw in job_keywords:
            if kw in work.position.lower():
                score += 3.0
            if work.summary and kw in work.summary.lower():
                score += 1.5

        # Highlights match
        for h in work.highlights:
            for kw in job_keywords:
                if kw in h.lower():
                    score += 2.0

        return score
