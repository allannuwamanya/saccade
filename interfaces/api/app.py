"""FastAPI Backend Server for Saccade Web Studio."""

import os
from pathlib import Path
from typing import Optional, Dict, Any, List
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from core.constants import ThemeName, DocumentType
from core.models.profile import MasterProfile
from core.models.job import JobPosting
from core.models.document import TailoredDocument, StyleOptions
from storage.local_file import LocalFileStorage
from rendering.engine import TemplateEngine
from rendering.compiler import LatexCompiler
from agents.job_parser import JobParserAgent
from agents.ats_checker import ATSCheckerAgent
from agents.orchestrator import SaccadeOrchestrator


app = FastAPI(
    title="Saccade API",
    description="Backend API for Saccade AI LaTeX Resume & Career Document Platform",
    version="0.1.0"
)

# Enable CORS for local web development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

storage = LocalFileStorage()
orchestrator = SaccadeOrchestrator(storage=storage)
template_engine = TemplateEngine()
compiler = LatexCompiler()

OUTPUT_DIR = Path("output").resolve()
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


# Request & Response schemas
class ParseJobRequest(BaseModel):
    source: str = Field(description="Job description URL or raw text")


class TailorRequest(BaseModel):
    job_source: str
    profile_id: str = "default_profile"
    theme: ThemeName = ThemeName.CLASSIC
    generate_cover_letter: bool = False


class RenderDirectRequest(BaseModel):
    profile_id: str = "default_profile"
    theme: ThemeName = ThemeName.CLASSIC
    document_type: DocumentType = DocumentType.RESUME


@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "saccade-api",
        "compiler": str(compiler.compiler_path) if compiler.compiler_path else "none"
    }


@app.get("/api/profile")
async def get_current_profile(profile_id: str = Query("default_profile")):
    profile = storage.get_profile(profile_id)
    if not profile:
        sample_path = Path("examples/master_profile.json").resolve()
        if sample_path.exists():
            import json
            profile = MasterProfile.model_validate(json.loads(sample_path.read_text(encoding="utf-8")))
            storage.save_profile(profile)
        else:
            raise HTTPException(status_code=404, detail=f"Profile '{profile_id}' not found")
    return profile.model_dump()


@app.post("/api/profile")
async def update_profile(profile: MasterProfile):
    saved = storage.save_profile(profile)
    return {"status": "saved", "profile_id": saved.id}


@app.post("/api/job/parse")
async def parse_job(req: ParseJobRequest):
    try:
        job = await JobParserAgent.parse(req.source)
        return job.model_dump()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse job description: {e}")


@app.post("/api/ats")
async def check_ats(req: ParseJobRequest, profile_id: str = Query("default_profile")):
    profile = storage.get_profile(profile_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    job = await JobParserAgent.parse(req.source)
    report = ATSCheckerAgent.audit(profile, job)
    return report.model_dump()


@app.post("/api/tailor")
async def tailor_application(req: TailorRequest):
    try:
        bundle = await orchestrator.run(
            job_source=req.job_source,
            profile_id=req.profile_id,
            theme=req.theme,
            generate_cover_letter=req.generate_cover_letter,
            output_dir=str(OUTPUT_DIR)
        )

        resume_filename = Path(bundle.resume_pdf_path).name if bundle.resume_pdf_path else None
        letter_filename = Path(bundle.cover_letter_pdf_path).name if bundle.cover_letter_pdf_path else None

        return {
            "status": "success",
            "job": bundle.job.model_dump(),
            "ats_report": bundle.ats_report.model_dump(),
            "gap_analysis": bundle.gap_analysis,
            "resume_url": f"/api/pdf/{resume_filename}" if resume_filename else None,
            "cover_letter_url": f"/api/pdf/{letter_filename}" if letter_filename else None,
            "cover_letter_text": bundle.cover_letter_text
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Tailoring failed: {e}")


@app.post("/api/render")
async def render_pdf(req: RenderDirectRequest):
    profile = storage.get_profile(req.profile_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    doc = TailoredDocument(document_type=req.document_type, profile=profile)
    latex_src = template_engine.render(doc, theme=req.theme)

    filename = f"render_{req.profile_id}_{req.theme.value}_{req.document_type.value}.pdf"
    out_path = OUTPUT_DIR / filename

    res = compiler.compile(latex_src, output_pdf_path=str(out_path))
    if not res.success:
        raise HTTPException(status_code=500, detail=f"LaTeX compilation failed: {res.compilation_log}")

    return {
        "status": "success",
        "pdf_url": f"/api/pdf/{filename}",
        "compile_time": res.compile_time_seconds
    }


@app.get("/api/pdf/{filename}")
async def serve_pdf(filename: str):
    file_path = OUTPUT_DIR / filename
    if not file_path.is_file():
        # Check in examples dir as fallback
        alt_path = Path("examples") / filename
        if alt_path.is_file():
            file_path = alt_path
        else:
            raise HTTPException(status_code=404, detail=f"PDF file '{filename}' not found.")

    return FileResponse(
        str(file_path),
        media_type="application/pdf",
        headers={"Content-Disposition": f"inline; filename={filename}"}
    )


# Serve frontend static assets if web/dist or web/public exists
WEB_DIR = Path("web/dist").resolve()
if not WEB_DIR.exists():
    WEB_DIR = Path("web").resolve()

if (WEB_DIR / "index.html").is_file():
    app.mount("/", StaticFiles(directory=str(WEB_DIR), html=True), name="static")
