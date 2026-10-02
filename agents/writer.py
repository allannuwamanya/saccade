"""STAR / Google XYZ Writing Agent: Crafts polished, truthful bullets and matching cover letters."""

from typing import List, Optional
from core.constants import BANNED_BUZZWORDS
from core.llm.router import get_llm_provider
from core.models.profile import MasterProfile
from core.models.job import JobPosting
from agents.guardrail import HonestyGuardrail


class STARWriterAgent:
    """Polishes candidate bullets into impact-driven XYZ statements and drafts cover letters."""

    @classmethod
    def polish_highlights(
        cls,
        canonical_profile: MasterProfile,
        tailored_profile: MasterProfile,
        job: JobPosting
    ) -> MasterProfile:
        """Cleans buzzwords and validates bullets against the honesty guardrail. AI rewriting is in generate_cover_letter."""
        fact_pool = HonestyGuardrail.extract_fact_pool(canonical_profile)

        for work in tailored_profile.work:
            clean_highlights = []
            for highlight in work.highlights:
                # 1. Clean buzzwords
                cleaned = cls.filter_banned_buzzwords(highlight)

                # 2. Check with honesty guardrail
                valid, violation = HonestyGuardrail.audit_bullet(cleaned, work.highlights, fact_pool)
                if valid:
                    clean_highlights.append(cleaned)
                else:
                    # If any unverified metric appeared, fall back to the safe original highlight
                    clean_highlights.append(highlight)

            work.highlights = clean_highlights

        return tailored_profile

    @classmethod
    def filter_banned_buzzwords(cls, text: str) -> str:
        """Flags and replaces common low-value filler buzzwords with strong active verbs."""
        replacements = {
            "spearheaded": "led",
            "synergized": "coordinated",
            "leveraged": "utilized",
            "orchestrated": "directed",
            "results-driven": "impact-focused",
            "passionate team player": "collaborative engineer"
        }
        lower = text.lower()
        for word, replacement in replacements.items():
            if word in lower:
                # Case-insensitive replacement preserving casing
                import re
                text = re.sub(re.escape(word), replacement, text, flags=re.IGNORECASE)
        return text

    @classmethod
    async def generate_cover_letter(
        cls,
        profile: MasterProfile,
        job: JobPosting
    ) -> str:
        """Drafts a targeted cover letter connecting real candidate achievements to role requirements."""
        llm = get_llm_provider()

        top_achievements = []
        for w in profile.work[:2]:
            if w.highlights:
                top_achievements.append(f"At {w.name}: {w.highlights[0]}")

        prompt = (
            f"Draft a concise, professional 3-paragraph cover letter for {profile.basics.name} applying for "
            f"the position of '{job.title}' at '{job.company or 'your organization'}'.\n\n"
            f"Candidate Background:\n"
            f"- Title: {profile.basics.label}\n"
            f"- Top verified achievements: {'; '.join(top_achievements)}\n"
            f"- Key skills: {', '.join([s.name for s in profile.skills])}\n\n"
            f"Target Job Requirements:\n"
            f"- Required: {', '.join(job.required_skills)}\n"
            f"- Summary: {job.summary or job.title}\n\n"
            f"Guidelines:\n"
            f"1. Be direct, authentic, and grounded strictly in the provided achievements.\n"
            f"2. Never invent metrics or past employers.\n"
            f"3. Do not use generic filler words like 'spearheaded' or 'synergized'.\n"
            f"4. Focus on body paragraphs only (the template automatically handles the salutation and signoff).\n"
            f"5. Length: 200-300 words."
        )

        resp = await llm.generate_text(prompt)
        content = resp.content.strip()

        # Clean any redundant salutation or signoff
        import re
        content = re.sub(r"^Dear\s+[^,\n]+,\s*", "", content, flags=re.IGNORECASE)
        content = re.sub(r"\n+(?:Sincerely|Best regards|Warm regards|Regards)[\s,]+[^\n]*$", "", content, flags=re.IGNORECASE)
        return content.strip()
