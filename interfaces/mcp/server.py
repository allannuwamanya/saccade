"""FastMCP Server for Saccade: Exposes the full resume & career agent pipeline to AI coding agents."""

import json
from pathlib import Path
from typing import Optional, Dict, Any
from fastmcp import FastMCP

from core.constants import ThemeName, DocumentType
from core.models.profile import MasterProfile
from core.models.document import TailoredDocument
from storage.local_file import LocalFileStorage
from rendering.engine import TemplateEngine
from rendering.compiler import LatexCompiler
from agents.job_parser import JobParserAgent
from agents.ats_checker import ATSCheckerAgent
from agents.orchestrator import SaccadeOrchestrator


mcp = FastMCP("saccade")


@mcp.tool()
async def get_profile(profile_id: str = "default_profile") -> Dict[str, Any]:
    """Retrieves the canonical, structured career profile for the given user/profile ID."""
    storage = LocalFileStorage()
    profile = storage.get_profile(profile_id)
    if not profile:
        sample_path = Path(__file__).parent.parent.parent / "examples" / "master_profile.json"
        if sample_path.exists():
            data = json.loads(sample_path.read_text(encoding="utf-8"))
            profile = MasterProfile.model_validate(data)
            storage.save_profile(profile)
        else:
            return {"error": f"Profile '{profile_id}' not found."}

    return profile.model_dump()


@mcp.tool()
async def save_profile(profile_json: str) -> str:
    """Saves or updates a canonical career profile in the local repository."""
    storage = LocalFileStorage()
    try:
        data = json.loads(profile_json)
        profile = MasterProfile.model_validate(data)
        saved = storage.save_profile(profile)
        return f"Successfully saved canonical profile '{saved.id}' with {len(saved.work)} work entries."
    except Exception as e:
        return f"Error saving profile: {e}"


@mcp.tool()
async def import_resume(file_path: str, profile_id: str = "default_profile") -> Dict[str, Any]:
    """Ingests a PDF, DOCX, or text resume file, converts it into canonical JSON Resume format, and saves it."""
    from agents.intake import ResumeIntakeAgent
    raw_text = ResumeIntakeAgent.extract_text(file_path)
    profile = await ResumeIntakeAgent.parse_to_profile(
        raw_text=raw_text,
        source_name=Path(file_path).name,
        profile_id=profile_id
    )
    storage = LocalFileStorage()
    saved = storage.save_profile(profile)
    return {
        "status": "success",
        "profile_id": saved.id,
        "name": saved.basics.name,
        "experiences_count": len(saved.work),
        "skills_count": len(saved.skills)
    }


@mcp.tool()
async def parse_job_posting(source: str) -> Dict[str, Any]:
    """Parses a job description from a public URL or raw pasted text into structured requirements."""
    job = await JobParserAgent.parse(source)
    return job.model_dump()


@mcp.tool()
async def tailor_resume(
    job_source: str,
    profile_id: str = "default_profile",
    theme: str = "classic",
    generate_cover_letter: bool = False,
    output_dir: str = "output"
) -> Dict[str, Any]:
    """Tailors a resume against a target job, verifies ATS compliance, and compiles to PDF."""
    try:
        active_theme = ThemeName(theme.lower())
    except ValueError:
        active_theme = ThemeName.CLASSIC

    orchestrator = SaccadeOrchestrator()
    bundle = await orchestrator.run(
        job_source=job_source,
        profile_id=profile_id,
        theme=active_theme,
        generate_cover_letter=generate_cover_letter,
        output_dir=output_dir
    )

    return {
        "status": "success",
        "target_role": bundle.job.title,
        "target_company": bundle.job.company,
        "ats_score": bundle.ats_report.overall_score,
        "resume_pdf_path": bundle.resume_pdf_path,
        "cover_letter_pdf_path": bundle.cover_letter_pdf_path,
        "skill_gaps": bundle.gap_analysis,
        "matched_keywords": bundle.ats_report.matched_keywords,
        "missing_keywords": bundle.ats_report.missing_keywords
    }


@mcp.tool()
async def audit_ats(
    job_source: str,
    profile_id: str = "default_profile"
) -> Dict[str, Any]:
    """Performs an ATS keyword density and compliance check of a profile against a job description."""
    storage = LocalFileStorage()
    profile = storage.get_profile(profile_id)
    if not profile:
        sample_path = Path(__file__).parent.parent.parent / "examples" / "master_profile.json"
        profile = MasterProfile.model_validate(json.loads(sample_path.read_text(encoding="utf-8")))

    job = await JobParserAgent.parse(job_source)
    report = ATSCheckerAgent.audit(profile, job)
    return report.model_dump()


@mcp.tool()
async def render_document_pdf(
    profile_id: str = "default_profile",
    theme: str = "classic",
    output_path: str = "output/resume.pdf"
) -> str:
    """Compiles the canonical profile into a publication-grade LaTeX PDF."""
    storage = LocalFileStorage()
    profile = storage.get_profile(profile_id)
    if not profile:
        sample_path = Path(__file__).parent.parent.parent / "examples" / "master_profile.json"
        profile = MasterProfile.model_validate(json.loads(sample_path.read_text(encoding="utf-8")))

    try:
        active_theme = ThemeName(theme.lower())
    except ValueError:
        active_theme = ThemeName.CLASSIC

    doc = TailoredDocument(profile=profile)
    engine = TemplateEngine()
    latex = engine.render(doc, theme=active_theme)

    compiler = LatexCompiler()
    res = compiler.compile(latex, output_pdf_path=output_path)

    if res.success:
        return f"Successfully compiled PDF: {res.output_pdf_path} (compiled in {res.compile_time_seconds}s)"
    else:
        return f"Compilation error:\n{res.compilation_log}"


if __name__ == "__main__":
    mcp.run()
