"""Page Budget Engine: Analyzes and optimizes document layout to fit exact page constraints."""

from typing import List, Dict, Any
from core.models.profile import MasterProfile
from core.models.document import StyleOptions


class PageBudgetEngine:
    """Analyzes character counts and spacing to avoid 1.1-page overflow or orphan words."""

    # Target bounds for standard 10pt letter paper with 0.6in margins
    CHARS_PER_LINE = 95
    MAX_LINES_ONE_PAGE = 52

    @classmethod
    def estimate_lines(cls, profile: MasterProfile) -> int:
        """Estimates the total rendered lines of a profile."""
        lines = 6  # Header block

        if profile.basics.summary:
            lines += 2 + len(profile.basics.summary) // cls.CHARS_PER_LINE

        # Work experience
        for job in profile.work:
            lines += 2  # Company + Title
            if job.summary:
                lines += 1 + len(job.summary) // cls.CHARS_PER_LINE
            for highlight in job.highlights:
                # Bullets take extra margin indentation (~85 chars/line)
                bullet_lines = max(1, (len(highlight) + 80) // 85)
                lines += bullet_lines

        # Education
        for edu in profile.education:
            lines += 2
            if edu.courses:
                lines += 1

        # Skills
        for skill in profile.skills:
            lines += 1

        # Projects
        for proj in profile.projects:
            lines += 2
            for highlight in proj.highlights:
                lines += max(1, (len(highlight) + 80) // 85)

        return lines

    @classmethod
    def suggest_style_options(cls, profile: MasterProfile, target_pages: int = 1) -> StyleOptions:
        """Dynamically tunes margins and font sizes to satisfy the target page budget."""
        estimated = cls.estimate_lines(profile)

        if target_pages == 1:
            if estimated > 58:
                # Dense fit required: 9pt font and 0.5in margins
                return StyleOptions(
                    font_size="9pt",
                    margin_top="0.5in",
                    margin_bottom="0.5in",
                    margin_left="0.5in",
                    margin_right="0.5in",
                    line_spacing=1.05
                )
            elif estimated > 46:
                # Standard fit: 10pt font and 0.55in margins
                return StyleOptions(
                    font_size="10pt",
                    margin_top="0.55in",
                    margin_bottom="0.55in",
                    margin_left="0.55in",
                    margin_right="0.55in",
                    line_spacing=1.1
                )
            else:
                # Relaxed fit: 10pt/11pt font and 0.65in margins
                return StyleOptions(
                    font_size="10pt",
                    margin_top="0.65in",
                    margin_bottom="0.65in",
                    margin_left="0.65in",
                    margin_right="0.65in",
                    line_spacing=1.15
                )

        return StyleOptions()
