"""Master Orchestrator: Coordinates the full end-to-end resume tailoring & compilation pipeline."""

from typing import Optional, Dict, Any, List
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict

from core.constants import ThemeName, DocumentType
from core.models.profile import MasterProfile
from core.models.job import JobPosting
from core.models.document import TailoredDocument, StyleOptions, RenderResult
from core.models.ats import ATSReport
from storage.local_file import LocalFileStorage
from rendering.engine import TemplateEngine
from rendering.compiler import LatexCompiler
from rendering.page_budget import PageBudgetEngine
from agents.job_parser import JobParserAgent
from agents.tailor import TailoringAgent
from agents.writer import STARWriterAgent
from agents.ats_checker import ATSCheckerAgent


class TailoredApplicationBundle(BaseModel):
    """The complete output bundle for a tailored job application."""
    job: JobPosting
    tailored_profile: MasterProfile
    resume_pdf_path: Optional[str] = None
    cover_letter_pdf_path: Optional[str] = None
    ats_report: ATSReport
    gap_analysis: List[str]
    latex_source: str
    cover_letter_text: Optional[str] = None

    model_config = ConfigDict(arbitrary_types_allowed=True)


class SaccadeOrchestrator:
    """Coordinates intake, tailoring, writing, ATS audit, and LaTeX compilation."""

    def __init__(self, storage: Optional[LocalFileStorage] = None):
        self.storage = storage or LocalFileStorage()
        self.template_engine = TemplateEngine()
        self.compiler = LatexCompiler()

    async def run(
        self,
        job_source: str,
        profile: Optional[MasterProfile] = None,
        profile_id: str = "default_profile",
        theme: ThemeName = ThemeName.CLASSIC,
        generate_cover_letter: bool = False,
        output_dir: Optional[str] = None
    ) -> TailoredApplicationBundle:
        """Executes the full pipeline from job input to compiled, ATS-checked PDF."""

        # 1. Retrieve Canonical Profile
        if profile is None:
            profile = self.storage.get_profile(profile_id)
            if profile is None:
                # If no profile stored yet, load sample default
                sample_file = Path(__file__).parent.parent / "examples" / "master_profile.json"
                if sample_file.exists():
                    import json
                    profile = MasterProfile.model_validate(json.loads(sample_file.read_text(encoding="utf-8")))
                    self.storage.save_profile(profile)
                else:
                    raise ValueError(f"Profile '{profile_id}' not found and no sample profile available.")

        # 2. Ingest & Parse Job Posting
        job = await JobParserAgent.parse(job_source)

        # 3. Tailor Profile & Gap Analysis
        tailored_profile, gaps = TailoringAgent.tailor(profile, job)

        # 4. Polish Bullets with Honesty Guardrail
        polished_profile = STARWriterAgent.polish_highlights(profile, tailored_profile, job)

        # 5. Page Budget Optimization
        style = PageBudgetEngine.suggest_style_options(polished_profile, target_pages=1)

        # 6. Typeset & Compile Tailored Resume
        doc = TailoredDocument(
            document_type=DocumentType.RESUME,
            target_job_title=job.title,
            target_company=job.company,
            profile=polished_profile,
            gap_summary="; ".join(gaps)
        )
        latex_src = self.template_engine.render(doc, theme=theme, style=style)

        out_path = None
        if output_dir:
            out_dir_path = Path(output_dir)
            out_dir_path.mkdir(parents=True, exist_ok=True)
            safe_title = "".join(c if c.isalnum() else "_" for c in job.title)[:30]
            out_path = str(out_dir_path / f"resume_{safe_title}.pdf")

        render_res = self.compiler.compile(latex_src, output_pdf_path=out_path)

        # 7. ATS Compliance Check
        ats_report = ATSCheckerAgent.audit(
            polished_profile,
            job,
            pdf_bytes=render_res.pdf_bytes
        )

        # 8. Optional: Cover Letter Generation
        cover_letter_text = None
        cover_letter_pdf_path = None
        if generate_cover_letter:
            cover_letter_text = await STARWriterAgent.generate_cover_letter(polished_profile, job)
            letter_doc = TailoredDocument(
                document_type=DocumentType.COVER_LETTER,
                target_job_title=job.title,
                target_company=job.company,
                profile=polished_profile,
                cover_letter_content=cover_letter_text
            )
            letter_tex = self.template_engine.render(letter_doc, theme=theme, style=style)
            letter_out = None
            if output_dir:
                letter_out = str(Path(output_dir) / f"cover_letter_{safe_title}.pdf")
            letter_res = self.compiler.compile(letter_tex, output_pdf_path=letter_out)
            cover_letter_pdf_path = letter_res.output_pdf_path

        # 9. Save Application History Record
        self.storage.save_application_record({
            "target_role": job.title,
            "target_company": job.company,
            "job_url": job.url,
            "ats_score": ats_report.overall_score,
            "gaps": gaps,
            "resume_path": render_res.output_pdf_path,
            "cover_letter_path": cover_letter_pdf_path
        })

        return TailoredApplicationBundle(
            job=job,
            tailored_profile=polished_profile,
            resume_pdf_path=render_res.output_pdf_path,
            cover_letter_pdf_path=cover_letter_pdf_path,
            ats_report=ats_report,
            gap_analysis=gaps,
            latex_source=latex_src,
            cover_letter_text=cover_letter_text
        )
