"""Data models for ATS auditing and compliance reporting."""

from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class ATSIssueSeverity(str, Enum):
    HIGH = "high"      # Critical flaw that could cause parser failure (e.g. illegible text)
    MEDIUM = "medium"  # Significant gap (e.g. missing 5+ primary required skills)
    LOW = "low"        # Minor suggestion (e.g. formatting optimization)


class ATSIssue(BaseModel):
    category: str = Field(description="e.g. 'Keywords', 'Formatting', 'Reading Order'")
    severity: ATSIssueSeverity
    message: str = Field(description="Clear explanation of the detected problem")
    suggestion: str = Field(description="Concrete action the user or agent should take to resolve it")


class ATSReport(BaseModel):
    """Explainable ATS scorecard evaluating a tailored document against a target job."""
    overall_score: int = Field(ge=0, le=100, description="Weighted composite score out of 100")
    keyword_score: int = Field(ge=0, le=100, description="Score based on target job keywords matched")
    formatting_score: int = Field(ge=0, le=100, default=100, description="Score based on clean layout and parseability")
    format_score: int = Field(ge=0, le=100, default=100, description="Alias for formatting_score for frontend compatibility")
    reading_order_passed: bool = Field(default=True, description="Whether linear text extraction reads chronologically")
    honesty_score: int = Field(ge=0, le=100, default=100, description="Percentage of claims verified against fact provenance")
    impact_score: int = Field(ge=0, le=100, default=95, description="Google XYZ formula / quantified metrics density score")
    page_budget_score: int = Field(ge=0, le=100, default=100, description="1-page budget and typography density score")
    matched_keywords: List[str] = Field(default_factory=list, description="Keywords from job found in resume")
    missing_keywords: List[str] = Field(default_factory=list, description="Key job terms absent from resume")
    critical_issues: List[str] = Field(default_factory=list, description="High severity ATS blocking issues")
    formatting_warnings: List[str] = Field(default_factory=list, description="Formatting recommendations and warnings")
    recommendations: List[str] = Field(default_factory=list, description="Actionable advice to push score to 100")
    issues: List[ATSIssue] = Field(default_factory=list, description="Actionable issues list")
    extracted_text_preview: Optional[str] = Field(default=None, description="First 500 characters of extracted text")
