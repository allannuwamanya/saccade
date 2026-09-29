"""Integration tests for the complete Saccade agent pipeline."""

import json
from pathlib import Path
import pytest
from core.models.profile import MasterProfile
from core.models.job import JobPosting
from agents.job_parser import JobParserAgent
from agents.tailor import TailoringAgent
from agents.writer import STARWriterAgent
from agents.guardrail import HonestyGuardrail
from agents.ats_checker import ATSCheckerAgent
from agents.orchestrator import SaccadeOrchestrator


@pytest.fixture
def master_profile() -> MasterProfile:
    data = json.loads(Path("examples/master_profile.json").read_text(encoding="utf-8"))
    return MasterProfile.model_validate(data)


@pytest.fixture
def job_posting_text() -> str:
    return Path("examples/target_job_stripe.txt").read_text(encoding="utf-8")


@pytest.mark.asyncio
async def test_job_parser_extracts_requirements(job_posting_text):
    job = await JobParserAgent.parse(job_posting_text)
    assert "Distributed Systems" in job.title or "Stripe" in job.raw_text
    assert len(job.required_skills) > 0 or len(job.keywords) > 0


def test_tailoring_reweights_and_identifies_gaps(master_profile):
    job = JobPosting(
        title="Senior Kubernetes Infrastructure Engineer",
        required_skills=["Kubernetes", "EKS", "Terraform", "Istio Service Mesh"],
        keywords=["kubernetes", "service mesh", "cloud"]
    )
    tailored, gaps = TailoringAgent.tailor(master_profile, job)

    assert len(tailored.work) > 0
    # The job requires 'Istio Service Mesh' and 'Terraform' which are missing in Alex Mercer's profile
    assert any("Istio" in g or "Terraform" in g for g in gaps)


def test_honesty_guardrail_catches_hallucinations(master_profile):
    fact_pool = HonestyGuardrail.extract_fact_pool(master_profile)

    # Truthful claim present in profile
    truthful_bullet = "Architected multi-region failover pipeline reducing P99 latency by 35ms across 12B daily events."
    valid, violation = HonestyGuardrail.audit_bullet(truthful_bullet, master_profile.work[0].highlights, fact_pool)
    assert valid is True
    assert violation is None

    # Hallucinated metric invented by a rogue agent
    hallucinated_bullet = "Spearheaded cloud optimization reducing infrastructure costs by 95% saving $15M annually."
    valid, violation = HonestyGuardrail.audit_bullet(hallucinated_bullet, master_profile.work[0].highlights, fact_pool)
    assert valid is False
    assert violation is not None
    assert "95%" in violation.unverified_claim or "$15m" in violation.unverified_claim.lower()


def test_ats_checker_audit(master_profile):
    job = JobPosting(
        title="Senior Distributed Systems Engineer",
        required_skills=["Rust", "Kafka", "Distributed Systems", "Kubernetes"],
        preferred_skills=["CockroachDB"],
        keywords=["distributed systems", "concurrency"]
    )
    report = ATSCheckerAgent.audit(master_profile, job)
    assert report.overall_score > 70
    assert "Rust" in report.matched_keywords
    assert report.reading_order_passed is True


@pytest.mark.asyncio
async def test_orchestrator_end_to_end(master_profile, job_posting_text):
    orchestrator = SaccadeOrchestrator()
    bundle = await orchestrator.run(
        job_source=job_posting_text,
        profile=master_profile,
        generate_cover_letter=True,
        output_dir="output/test_run"
    )

    assert bundle.job.title is not None
    assert bundle.ats_report.overall_score > 0
    assert bundle.resume_pdf_path is not None
    assert Path(bundle.resume_pdf_path).exists()
    assert bundle.cover_letter_pdf_path is not None
    assert Path(bundle.cover_letter_pdf_path).exists()
