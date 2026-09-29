"""Data models for job postings and requirement analysis."""

from typing import List, Optional
from pydantic import BaseModel, Field


class JobPosting(BaseModel):
    """Normalized structured representation of a target job posting."""
    id: Optional[str] = None
    title: str = Field(description="Target job title, e.g. 'Senior Backend Engineer'")
    company: Optional[str] = Field(default=None, description="Hiring company name")
    location: Optional[str] = Field(default=None, description="Location or 'Remote'")
    url: Optional[str] = Field(default=None, description="Source URL of posting")
    raw_text: str = Field(default="", description="Full raw posting text")
    summary: Optional[str] = Field(default=None, description="Executive summary of the role")
    required_skills: List[str] = Field(default_factory=list, description="Explicit must-have skills/qualifications")
    preferred_skills: List[str] = Field(default_factory=list, description="Bonus / nice-to-have qualifications")
    keywords: List[str] = Field(default_factory=list, description="Key ATS domain terms, frameworks, concepts")
    seniority_level: Optional[str] = Field(default=None, description="e.g. 'Junior', 'Mid', 'Senior', 'Staff', 'Lead'")
