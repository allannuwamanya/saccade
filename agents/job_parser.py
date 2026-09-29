"""Job Parser Agent: Ingests job descriptions from URLs or raw text and extracts structured requirements."""

import re
from typing import Optional, List
import httpx
import trafilatura

from core.exceptions import SaccadeError
from core.llm.router import get_llm_provider
from core.models.job import JobPosting


class JobParserAgent:
    """Parses raw text or extracts clean content from a job posting URL."""

    @classmethod
    async def extract_from_url(cls, url: str) -> str:
        """Fetches clean main text content from a public job posting URL."""
        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            )
        }
        try:
            async with httpx.AsyncClient(timeout=15.0, follow_redirects=True, headers=headers) as client:
                res = await client.get(url)
                res.raise_for_status()
                html = res.text

            # Extract clean main text using trafilatura
            extracted = trafilatura.extract(html, include_links=False, include_images=False)
            if extracted and len(extracted) > 100:
                return extracted
            return html[:5000]
        except Exception as e:
            raise SaccadeError(f"Failed to fetch job posting from URL '{url}': {e}")

    @classmethod
    async def parse(cls, source: str) -> JobPosting:
        """Parses a URL or raw text string into a structured JobPosting."""
        raw_text = source.strip()
        is_url = bool(re.match(r"^https?://", raw_text, re.IGNORECASE))
        source_url = raw_text if is_url else None

        if is_url:
            raw_text = await cls.extract_from_url(raw_text)

        # Use configured LLM provider to extract structured requirements
        llm = get_llm_provider()
        prompt = (
            f"Analyze the following job description and extract the structured information in JSON format:\n\n"
            f"\"\"\"\n{raw_text[:4000]}\n\"\"\"\n\n"
            f"Return a JSON object with these keys:\n"
            f"- 'title': string (job title)\n"
            f"- 'company': string (or null if unknown)\n"
            f"- 'location': string (or null)\n"
            f"- 'required_skills': list of strings (explicit required skills/technologies)\n"
            f"- 'preferred_skills': list of strings (nice-to-have qualifications)\n"
            f"- 'keywords': list of strings (domain concepts and core ATS terms)\n"
            f"- 'seniority_level': string ('Junior', 'Mid', 'Senior', 'Staff', or 'Lead')"
        )

        try:
            parsed = await llm.generate_json(prompt, schema=JobPosting)
            return JobPosting(
                id=f"job_{abs(hash(raw_text[:100])) % 100000}",
                title=parsed.get("title", "Target Role"),
                company=parsed.get("company"),
                location=parsed.get("location"),
                url=source_url,
                raw_text=raw_text,
                required_skills=parsed.get("required_skills", []),
                preferred_skills=parsed.get("preferred_skills", []),
                keywords=parsed.get("keywords", []),
                seniority_level=parsed.get("seniority_level", "Senior")
            )
        except Exception:
            # Fallback heuristic parser if LLM is unavailable
            return cls._heuristic_fallback(raw_text, source_url)

    @classmethod
    def _heuristic_fallback(cls, raw_text: str, source_url: Optional[str] = None) -> JobPosting:
        lines = [line.strip() for line in raw_text.split("\n") if line.strip()]
        title = lines[0] if lines else "Software Engineer"
        keywords = list(set(re.findall(r"\b[A-Z][a-zA-Z0-9\+#\.]+\b", raw_text)))[:10]
        return JobPosting(
            title=title[:80],
            raw_text=raw_text,
            url=source_url,
            required_skills=keywords[:5],
            preferred_skills=keywords[5:8],
            keywords=keywords,
            seniority_level="Senior"
        )
