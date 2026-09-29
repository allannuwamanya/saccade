"""Canonical Career Profile Schema (Extended JSON Resume Standard)."""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, EmailStr
from core.models.provenance import FactProvenance


class SocialProfile(BaseModel):
    network: str = Field(description="e.g. 'GitHub', 'LinkedIn'")
    username: str
    url: Optional[str] = None


class ProfileLocation(BaseModel):
    address: Optional[str] = None
    postalCode: Optional[str] = None
    city: Optional[str] = None
    countryCode: Optional[str] = None
    region: Optional[str] = None


class ProfileBasics(BaseModel):
    name: str = Field(description="Full legal or professional name")
    label: Optional[str] = Field(default=None, description="e.g. 'Staff Distributed Systems Engineer'")
    image: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    url: Optional[str] = None
    summary: Optional[str] = None
    location: Optional[ProfileLocation] = None
    profiles: List[SocialProfile] = Field(default_factory=list)


class WorkExperience(BaseModel):
    id: Optional[str] = None
    name: str = Field(description="Company or employer name")
    position: str = Field(description="Job title")
    url: Optional[str] = None
    startDate: Optional[str] = Field(default=None, description="YYYY-MM or YYYY-MM-DD")
    endDate: Optional[str] = Field(default=None, description="YYYY-MM or 'Present'")
    summary: Optional[str] = None
    highlights: List[str] = Field(default_factory=list, description="Bullet points detailing achievements")
    provenance: Optional[FactProvenance] = None


class Education(BaseModel):
    id: Optional[str] = None
    institution: str = Field(description="University or school name")
    url: Optional[str] = None
    area: Optional[str] = Field(default=None, description="Field of study or major, e.g. 'Computer Science'")
    studyType: Optional[str] = Field(default=None, description="Degree type, e.g. 'B.S.', 'Ph.D.'")
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    score: Optional[str] = Field(default=None, description="GPA or honors, e.g. '3.9 / 4.0'")
    courses: List[str] = Field(default_factory=list)


class Skill(BaseModel):
    name: str = Field(description="Skill category, e.g. 'Languages', 'Cloud Infrastructure'")
    level: Optional[str] = Field(default=None, description="e.g. 'Expert', 'Intermediate'")
    keywords: List[str] = Field(default_factory=list, description="Specific tools, e.g. ['Rust', 'Kafka', 'Kubernetes']")


class Project(BaseModel):
    name: str = Field(description="Project title")
    description: Optional[str] = None
    highlights: List[str] = Field(default_factory=list)
    keywords: List[str] = Field(default_factory=list)
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    url: Optional[str] = None


class Certificate(BaseModel):
    name: str
    date: Optional[str] = None
    issuer: Optional[str] = None
    url: Optional[str] = None


class Publication(BaseModel):
    name: str = Field(description="Publication title")
    publisher: Optional[str] = None
    releaseDate: Optional[str] = None
    url: Optional[str] = None
    summary: Optional[str] = None


class Language(BaseModel):
    language: str
    fluency: Optional[str] = None


class MasterProfile(BaseModel):
    """The user's canonical, verifiable career profile (Single Source of Truth)."""
    id: Optional[str] = Field(default="default_profile", description="Unique profile identifier")
    basics: ProfileBasics
    work: List[WorkExperience] = Field(default_factory=list)
    education: List[Education] = Field(default_factory=list)
    skills: List[Skill] = Field(default_factory=list)
    projects: List[Project] = Field(default_factory=list)
    certificates: List[Certificate] = Field(default_factory=list)
    publications: List[Publication] = Field(default_factory=list)
    languages: List[Language] = Field(default_factory=list)
    custom_sections: Dict[str, Any] = Field(default_factory=dict)
