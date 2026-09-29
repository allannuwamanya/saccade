"""Integration tests for the Resume Intake Agent (PDF, DOCX, text ingestion)."""

import io
from pathlib import Path
import pytest
from starlette.testclient import TestClient

from agents.intake import ResumeIntakeAgent
from interfaces.api.app import app


@pytest.fixture
def client():
    return TestClient(app)


def test_intake_extracts_text_from_pdf():
    pdf_path = Path("examples/alex_mercer_classic.pdf")
    assert pdf_path.exists()
    text = ResumeIntakeAgent.extract_text(str(pdf_path))
    assert "Alex Mercer" in text
    assert "Stripe" in text
    assert "Distributed Systems" in text


def test_intake_extracts_text_from_raw_string():
    sample_text = "Jane Doe\nStaff Machine Learning Engineer\njane@example.com\n\nExperience:\nSenior AI Researcher at OpenAI"
    text = ResumeIntakeAgent.extract_text("resume.txt", file_bytes=sample_text.encode("utf-8"))
    assert "Jane Doe" in text
    assert "OpenAI" in text


@pytest.mark.asyncio
async def test_intake_parses_into_master_profile():
    sample_text = (
        "Johnathan Vance\n"
        "Lead Infrastructure Engineer\n"
        "john@example.com | +1-555-0123 | Seattle, WA\n\n"
        "Summary:\nSpecializing in Kubernetes and large-scale cloud networks.\n\n"
        "Experience:\n"
        "Amazon Web Services (AWS) - Principal Systems Architect\n"
        "2020-01 to Present\n"
        "- Scaled VPC control plane across 30 availability zones reducing latency by 45%.\n"
        "- Managed $12M annual infrastructure capacity.\n\n"
        "Skills:\n"
        "Cloud: AWS, Kubernetes, Terraform, Docker\n"
        "Languages: Go, Python, Bash"
    )

    profile = await ResumeIntakeAgent.parse_to_profile(
        raw_text=sample_text,
        source_name="vance_resume.txt",
        profile_id="vance_canonical"
    )

    assert profile.basics.name is not None
    assert len(profile.skills) > 0

    # Verify provenance attached
    if profile.work:
        assert profile.work[0].provenance is not None
        assert profile.work[0].provenance.source_type == "upload"
        assert profile.work[0].provenance.source_ref == "vance_resume.txt"


def test_api_upload_endpoint(client):
    content = b"Candidate Name\nSoftware Engineer\ntest@example.com\n\nSkills: Python, FastAPI, Docker"
    files = {"file": ("my_resume.txt", io.BytesIO(content), "text/plain")}

    res = client.post("/api/profile/upload?profile_id=upload_test_profile", files=files)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert "profile" in data
    assert data["profile_id"] == "upload_test_profile"
