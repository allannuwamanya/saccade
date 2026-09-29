"""Unit tests for domain models."""

import json
from pathlib import Path
import pytest
from core.models.profile import MasterProfile, WorkExperience
from core.models.job import JobPosting
from core.models.ats import ATSReport, ATSIssueSeverity
from core.models.document import TailoredDocument, StyleOptions
from core.constants import ThemeName, DocumentType


def test_master_profile_parsing():
    sample_path = Path("examples/master_profile.json")
    assert sample_path.exists()
    data = json.loads(sample_path.read_text(encoding="utf-8"))

    profile = MasterProfile.model_validate(data)
    assert profile.basics.name == "Alex Mercer"
    assert len(profile.work) == 2
    assert profile.work[0].name == "Stripe"
    assert len(profile.work[0].highlights) == 3
    assert profile.work[0].provenance is not None
    assert len(profile.work[0].provenance.atomic_facts) == 2


def test_job_posting_model():
    job = JobPosting(
        title="Senior Distributed Systems Engineer",
        company="Anthropic",
        required_skills=["Rust", "Kubernetes", "Kafka"],
        keywords=["distributed systems", "concurrency"],
        seniority_level="Senior"
    )
    assert job.title == "Senior Distributed Systems Engineer"
    assert "Rust" in job.required_skills


def test_ats_report_validation():
    report = ATSReport(
        overall_score=92,
        keyword_score=90,
        formatting_score=95,
        reading_order_passed=True,
        matched_keywords=["Rust", "Kafka"],
        missing_keywords=["Kubernetes"]
    )
    assert report.overall_score == 92
    assert report.reading_order_passed is True
