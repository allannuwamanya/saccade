"""Saccade CLI: High-performance terminal interface for AI LaTeX career documents."""

import asyncio
import json
from pathlib import Path
from typing import Optional
import typer
from rich.console import Console
from rich.panel import Panel
from rich.table import Table

from core.constants import ThemeName, DocumentType
from core.models.profile import MasterProfile
from core.models.document import TailoredDocument, StyleOptions
from storage.local_file import LocalFileStorage
from rendering.engine import TemplateEngine
from rendering.compiler import LatexCompiler
from agents.orchestrator import SaccadeOrchestrator
from agents.job_parser import JobParserAgent
from agents.ats_checker import ATSCheckerAgent


app = typer.Typer(
    name="saccade",
    help="AI-Powered LaTeX Platform for Resumes, CVs & Professional Documents.",
    add_completion=False
)
console = Console()


@app.command("init")
def init_profile():
    """Initializes local storage with the default canonical profile template."""
    storage = LocalFileStorage()
    sample_file = Path(__file__).parent.parent.parent / "examples" / "master_profile.json"
    if sample_file.exists():
        data = json.loads(sample_file.read_text(encoding="utf-8"))
        profile = MasterProfile.model_validate(data)
        storage.save_profile(profile)
        console.print(f"[bold green]✓[/bold green] Canonical profile initialized at: {storage.profiles_dir / 'default_profile.json'}")
    else:
        console.print("[bold red]✗[/bold red] Sample profile not found.")


@app.command("import")
def import_resume(
    file_path: str = typer.Argument(..., help="Path to PDF, DOCX, or text resume"),
    profile_id: str = typer.Option("default_profile", "--id", help="Profile ID to save as")
):
    """Imports an existing resume (PDF, DOCX, or text) into the canonical career profile."""
    from agents.intake import ResumeIntakeAgent
    target = Path(file_path)
    if not target.is_file():
        console.print(f"[bold red]✗[/bold red] File not found: {file_path}")
        raise typer.Exit(1)

    with console.status(f"[cyan]Extracting text and parsing {target.name}...[/cyan]"):
        raw_text = ResumeIntakeAgent.extract_text(str(target))
        profile = asyncio.run(
            ResumeIntakeAgent.parse_to_profile(raw_text, source_name=target.name, profile_id=profile_id)
        )
        storage = LocalFileStorage()
        storage.save_profile(profile)

    console.print(f"[bold green]✓ Successfully imported:[/bold green] {profile.basics.name} ({len(profile.work)} experiences, {len(profile.skills)} skill categories)")


@app.command("profile")
def show_profile(profile_id: str = typer.Option("default_profile", "--id", help="Profile identifier")):
    """Displays the user's canonical career profile."""
    storage = LocalFileStorage()
    profile = storage.get_profile(profile_id)
    if not profile:
        console.print(f"[yellow]Profile '{profile_id}' not found. Run `saccade init` to create one.[/yellow]")
        return

    table = Table(title=f"Canonical Profile: {profile.basics.name}", style="cyan")
    table.add_column("Section", style="bold white", width=16)
    table.add_column("Details", style="dim")

    table.add_row("Title", profile.basics.label or "N/A")
    table.add_row("Contact", f"{profile.basics.email or ''} | {profile.basics.phone or ''}")
    table.add_row("Work Entries", f"{len(profile.work)} companies ({', '.join([w.name for w in profile.work])})")
    table.add_row("Education", f"{len(profile.education)} entries")
    table.add_row("Skills", f"{sum(len(s.keywords) for s in profile.skills)} keywords across {len(profile.skills)} groups")

    console.print(table)


@app.command("render")
def render_doc(
    profile_id: str = typer.Option("default_profile", "--profile", help="Profile ID to render"),
    theme: ThemeName = typer.Option(ThemeName.CLASSIC, "--theme", help="LaTeX theme (classic, modern, executive)"),
    output: str = typer.Option("output/resume.pdf", "--output", "-o", help="Output PDF file path")
):
    """Compiles the master profile directly into a LaTeX PDF."""
    storage = LocalFileStorage()
    profile = storage.get_profile(profile_id)
    if not profile:
        console.print(f"[yellow]Profile '{profile_id}' not found. Initializing sample...[/yellow]")
        init_profile()
        profile = storage.get_profile(profile_id)

    doc = TailoredDocument(profile=profile)
    engine = TemplateEngine()
    latex = engine.render(doc, theme=theme)

    compiler = LatexCompiler()
    with console.status(f"[cyan]Compiling with {theme.value} theme...[/cyan]"):
        res = compiler.compile(latex, output_pdf_path=output)

    if res.success:
        console.print(f"[bold green]✓ Successfully generated PDF:[/bold green] {res.output_pdf_path} ({res.compile_time_seconds}s)")
    else:
        console.print(f"[bold red]✗ Compilation failed:[/bold red]\n{res.compilation_log}")


@app.command("tailor")
def tailor_resume(
    job_source: str = typer.Argument(..., help="Job posting URL or text file path"),
    profile_id: str = typer.Option("default_profile", "--profile", help="Profile ID to tailor"),
    theme: ThemeName = typer.Option(ThemeName.CLASSIC, "--theme", help="LaTeX theme"),
    cover_letter: bool = typer.Option(False, "--cover-letter", help="Also generate matching cover letter"),
    output_dir: str = typer.Option("output", "--output-dir", "-o", help="Directory for generated PDFs")
):
    """Tailors the master profile against a job description, checks ATS, and renders PDF."""
    # Check if job_source is a file path
    if Path(job_source).is_file():
        job_source = Path(job_source).read_text(encoding="utf-8")

    orchestrator = SaccadeOrchestrator()

    with console.status("[bold cyan]Running Saccade agent pipeline (Parse -> Tailor -> Guardrail -> ATS -> Render)...[/bold cyan]"):
        bundle = asyncio.run(
            orchestrator.run(
                job_source=job_source,
                profile_id=profile_id,
                theme=theme,
                generate_cover_letter=cover_letter,
                output_dir=output_dir
            )
        )

    # Display Results Panel
    console.print(Panel(
        f"[bold green]Target Role:[/bold green] {bundle.job.title} at {bundle.job.company or 'Target Company'}\n"
        f"[bold green]ATS Match Score:[/bold green] {bundle.ats_report.overall_score}/100\n"
        f"[bold green]Resume PDF:[/bold green] {bundle.resume_pdf_path}\n" +
        (f"[bold green]Cover Letter PDF:[/bold green] {bundle.cover_letter_pdf_path}\n" if bundle.cover_letter_pdf_path else ""),
        title="✨ Saccade Tailoring Complete",
        style="green"
    ))

    # Display Gap Analysis if any
    if bundle.gap_analysis:
        console.print("\n[bold yellow]⚠️ Identified Skill Gaps:[/bold yellow]")
        for gap in bundle.gap_analysis:
            console.print(f"  • {gap}")


@app.command("ats")
def audit_ats(
    job_source: str = typer.Argument(..., help="Job posting URL or text file path"),
    profile_id: str = typer.Option("default_profile", "--profile", help="Profile ID to audit")
):
    """Runs a standalone ATS compatibility and keyword coverage audit."""
    if Path(job_source).is_file():
        job_source = Path(job_source).read_text(encoding="utf-8")

    storage = LocalFileStorage()
    profile = storage.get_profile(profile_id)
    if not profile:
        init_profile()
        profile = storage.get_profile(profile_id)

    job = asyncio.run(JobParserAgent.parse(job_source))
    report = ATSCheckerAgent.audit(profile, job)

    table = Table(title=f"ATS Audit Report: {job.title}", style="magenta")
    table.add_column("Metric", style="bold")
    table.add_column("Value")

    table.add_row("Overall Score", f"{report.overall_score}/100")
    table.add_row("Keyword Score", f"{report.keyword_score}/100")
    table.add_row("Formatting Score", f"{report.formatting_score}/100")
    table.add_row("Reading Order Passed", "Yes" if report.reading_order_passed else "No")
    table.add_row("Matched Keywords", ", ".join(report.matched_keywords[:8]))
    table.add_row("Missing Keywords", ", ".join(report.missing_keywords[:8]) or "None")

    console.print(table)


@app.command("serve")
def serve_web(
    host: str = typer.Option("127.0.0.1", "--host", "-h", help="Host address to bind"),
    port: int = typer.Option(8000, "--port", "-p", help="Port to listen on")
):
    """Starts the Saccade Web Studio and API server."""
    import uvicorn
    console.print(f"[bold green]🚀 Starting Saccade Studio at:[/bold green] [underline cyan]http://{host}:{port}[/underline cyan]")
    uvicorn.run("interfaces.api.app:app", host=host, port=port, reload=False)


if __name__ == "__main__":
    app()
