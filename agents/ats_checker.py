"""ATS Compliance Auditor: Verifies keyword coverage and simulates parser text extraction."""

import io
from typing import List, Set, Optional
from pypdf import PdfReader

from core.models.profile import MasterProfile
from core.models.job import JobPosting
from core.models.ats import ATSReport, ATSIssue, ATSIssueSeverity
from core.constants import ATS_STOPWORDS


class ATSCheckerAgent:
    """Audits tailored documents for Applicant Tracking System (ATS) compatibility."""

    @classmethod
    def audit(
        cls,
        profile: MasterProfile,
        job: JobPosting,
        pdf_bytes: Optional[bytes] = None
    ) -> ATSReport:
        """Runs a complete ATS compliance and keyword coverage audit."""
        issues: List[ATSIssue] = []

        # 1. Build profile text corpus
        profile_tokens = cls._extract_profile_tokens(profile)

        # 2. Check Job Keyword Coverage
        job_target_terms = set(job.required_skills + job.preferred_skills + job.keywords)
        matched_terms: List[str] = []
        missing_terms: List[str] = []

        for term in job_target_terms:
            t_lower = term.lower().strip()
            if not t_lower or t_lower in ATS_STOPWORDS:
                continue

            if any(t_lower in pt or pt in t_lower for pt in profile_tokens):
                matched_terms.append(term)
            else:
                missing_terms.append(term)

        # Calculate keyword score
        total_eval = len(matched_terms) + len(missing_terms)
        keyword_score = int((len(matched_terms) / total_eval * 100)) if total_eval > 0 else 85

        # Check for critical missing requirements
        for req in job.required_skills:
            if req in missing_terms:
                issues.append(
                    ATSIssue(
                        category="Keywords",
                        severity=ATSIssueSeverity.HIGH,
                        message=f"Missing explicit required skill: '{req}'",
                        suggestion=f"If you have experience with '{req}', ensure it is listed under your Skills section."
                    )
                )

        # 3. Simulate Linear PDF Text Extraction & Reading Order
        reading_order_passed = True
        formatting_score = 100
        extracted_preview = None

        if pdf_bytes:
            try:
                reader = PdfReader(io.BytesIO(pdf_bytes))
                extracted_text = ""
                for page in reader.pages:
                    extracted_text += page.extract_text() or ""

                extracted_preview = extracted_text[:400].strip()

                # Verify that essential sections exist in the extracted text
                lower_extracted = extracted_text.lower()
                for section in ["experience", "education", "skills"]:
                    if section not in lower_extracted:
                        formatting_score -= 15
                        issues.append(
                            ATSIssue(
                                category="Structure",
                                severity=ATSIssueSeverity.MEDIUM,
                                message=f"Section header '{section.title()}' was not detected by linear text extraction.",
                                suggestion="Verify that section headers use standard typography without decorative graphics."
                            )
                        )

            except Exception as e:
                reading_order_passed = False
                formatting_score = 60
                issues.append(
                    ATSIssue(
                        category="Parsing Error",
                        severity=ATSIssueSeverity.HIGH,
                        message=f"PDF linear text extraction encountered an error: {e}",
                        suggestion="Ensure vector fonts are embedded and the PDF is not corrupted."
                    )
                )

        # Composite overall score
        overall_score = int(0.6 * keyword_score + 0.4 * formatting_score)

        return ATSReport(
            overall_score=max(0, min(100, overall_score)),
            keyword_score=keyword_score,
            formatting_score=formatting_score,
            reading_order_passed=reading_order_passed,
            matched_keywords=matched_terms,
            missing_keywords=missing_terms,
            issues=issues,
            extracted_text_preview=extracted_preview
        )

    @classmethod
    def _extract_profile_tokens(cls, profile: MasterProfile) -> Set[str]:
        tokens: Set[str] = set()

        if profile.basics.label:
            tokens.add(profile.basics.label.lower())
        if profile.basics.summary:
            tokens.update(profile.basics.summary.lower().split())

        for w in profile.work:
            tokens.add(w.position.lower())
            tokens.add(w.name.lower())
            for h in w.highlights:
                tokens.update(h.lower().split())

        for s in profile.skills:
            tokens.add(s.name.lower())
            for kw in s.keywords:
                tokens.add(kw.lower())

        for proj in profile.projects:
            tokens.add(proj.name.lower())
            for kw in proj.keywords:
                tokens.add(kw.lower())

        return tokens
