"""Integration test verifying all FastMCP tools for AI coding agent hosts."""

import pytest
from interfaces.mcp.server import (
    get_profile,
    save_profile,
    parse_job_posting,
    tailor_resume,
    audit_ats,
    render_document_pdf
)


@pytest.mark.asyncio
async def test_mcp_get_profile():
    res = await get_profile("default_profile")
    assert "basics" in res
    assert res["basics"]["name"] == "Alex Mercer"


@pytest.mark.asyncio
async def test_mcp_parse_job_posting():
    res = await parse_job_posting("Senior Backend Engineer at Stripe. Required: Rust, Kafka, Distributed Systems.")
    assert "title" in res
    assert len(res["required_skills"]) > 0 or len(res["keywords"]) > 0


@pytest.mark.asyncio
async def test_mcp_audit_ats():
    res = await audit_ats("Distributed Systems Engineer. Must have: Rust, Kafka.")
    assert "overall_score" in res
    assert res["overall_score"] > 0
    assert "matched_keywords" in res


@pytest.mark.asyncio
async def test_mcp_tailor_resume():
    res = await tailor_resume(
        job_source="Senior Distributed Systems Engineer. Requires Rust, Distributed Systems.",
        theme="modern",
        generate_cover_letter=True,
        output_dir="output/mcp_test"
    )
    assert res["status"] == "success"
    assert res["ats_score"] > 0
    assert res["resume_pdf_path"] is not None
    assert res["cover_letter_pdf_path"] is not None


@pytest.mark.asyncio
async def test_mcp_render_document_pdf():
    res = await render_document_pdf(theme="executive", output_path="output/mcp_test/exec.pdf")
    assert "Successfully compiled PDF" in res
