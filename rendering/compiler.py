"""Tectonic LaTeX compilation worker with auto-provisioning and self-healing retries."""

import os
import platform
import shutil
import subprocess
import tempfile
import time
import urllib.request
import tarfile
from pathlib import Path
from typing import Optional, Tuple

from core.config import settings
from core.exceptions import CompilerNotFoundError, LaTeXCompilationError
from core.models.document import RenderResult
from rendering.sanitizers import escape_latex


def _tectonic_download_url() -> str:
    """Returns the correct Tectonic static binary URL for the current CPU architecture."""
    machine = platform.machine().lower()
    if machine in ("arm64", "aarch64"):
        return (
            "https://github.com/tectonic-typesetting/tectonic/releases/download/"
            "tectonic%400.15.0/tectonic-0.15.0-aarch64-unknown-linux-musl.tar.gz"
        )
    return (
        "https://github.com/tectonic-typesetting/tectonic/releases/download/"
        "tectonic%400.15.0/tectonic-0.15.0-x86_64-unknown-linux-musl.tar.gz"
    )


def get_saccade_bin_dir() -> Path:
    """Returns the local Saccade binary directory (.bin or ~/.saccade/bin)."""
    workspace_bin = Path(".bin").resolve()
    if workspace_bin.is_dir() or Path("pyproject.toml").is_file():
        workspace_bin.mkdir(parents=True, exist_ok=True)
        return workspace_bin
    bin_dir = settings.data_dir / "bin"
    bin_dir.mkdir(parents=True, exist_ok=True)
    return bin_dir


def resolve_compiler_binary() -> Optional[Path]:
    """Finds the path to a usable LaTeX compiler (Tectonic preferred)."""
    # 1. Custom configured path
    if settings.tectonic_path:
        p = Path(settings.tectonic_path).resolve()
        if p.is_file() and os.access(p, os.X_OK):
            return p

    # 2. Workspace local .bin/tectonic
    workspace_bin = Path(".bin/tectonic").resolve()
    if workspace_bin.is_file() and os.access(workspace_bin, os.X_OK):
        return workspace_bin

    # 3. Virtualenv bin/tectonic
    venv_bin = Path(".venv/bin/tectonic").resolve()
    if venv_bin.is_file() and os.access(venv_bin, os.X_OK):
        return venv_bin

    # 4. System PATH tectonic
    system_tectonic = shutil.which("tectonic")
    if system_tectonic:
        return Path(system_tectonic)

    # 5. User home Saccade bin dir
    local_tectonic = Path(os.path.expanduser("~/.saccade/bin/tectonic"))
    if local_tectonic.is_file() and os.access(local_tectonic, os.X_OK):
        return local_tectonic

    # 6. Fallback to pdflatex or xelatex if available
    for fallback in ["xelatex", "pdflatex"]:
        system_fallback = shutil.which(fallback)
        if system_fallback:
            return Path(system_fallback)

    return None


def download_tectonic_binary(target_dir: Optional[Path] = None) -> Optional[Path]:
    """Auto-provisions the standalone static Tectonic binary for Linux x86_64."""
    if target_dir is None:
        target_dir = get_saccade_bin_dir()

    target_bin = target_dir / "tectonic"
    if target_bin.is_file() and os.access(target_bin, os.X_OK):
        return target_bin

    try:
        archive_path = target_dir / "tectonic.tar.gz"
        urllib.request.urlretrieve(_tectonic_download_url(), archive_path)

        with tarfile.open(archive_path, "r:gz") as tar:
            tar.extractall(path=target_dir)

        if archive_path.is_file():
            archive_path.unlink()

        if target_bin.is_file():
            target_bin.chmod(0o755)
            return target_bin
    except Exception:
        pass

    return None


class LatexCompiler:
    """Compiles LaTeX source code into production vector PDFs using Tectonic."""

    def __init__(self, compiler_path: Optional[Path] = None):
        self.compiler_path = compiler_path or resolve_compiler_binary()

    def ensure_compiler(self) -> Path:
        """Ensures a compiler binary is available, attempting auto-download if needed."""
        if not self.compiler_path or not self.compiler_path.is_file():
            self.compiler_path = resolve_compiler_binary()

        if not self.compiler_path:
            # Attempt auto-provisioning
            self.compiler_path = download_tectonic_binary()

        if not self.compiler_path or not self.compiler_path.is_file():
            raise CompilerNotFoundError(
                "No LaTeX compiler found. Please install Tectonic (https://tectonic-typesetting.github.io) "
                "or run `tectonic` on PATH, or set TECTONIC_PATH in your .env."
            )
        return self.compiler_path

    def compile(
        self,
        latex_source: str,
        output_pdf_path: Optional[str] = None,
        timeout: int = 120
    ) -> RenderResult:
        """Compiles LaTeX source string to PDF bytes with self-healing retries."""
        start_time = time.time()
        compiler = self.ensure_compiler()
        is_tectonic = "tectonic" in compiler.name.lower()

        with tempfile.TemporaryDirectory(prefix="saccade_tex_") as tmpdir:
            tmp_path = Path(tmpdir)
            tex_file = tmp_path / "document.tex"
            tex_file.write_text(latex_source, encoding="utf-8")

            # Construct command
            if is_tectonic:
                cmd = [
                    str(compiler),
                    "--outdir", str(tmp_path),
                    "--print",
                    str(tex_file)
                ]
            else:
                cmd = [
                    str(compiler),
                    "-interaction=nonstopmode",
                    "-no-shell-escape",
                    "-output-directory", str(tmp_path),
                    str(tex_file)
                ]

            try:
                result = subprocess.run(
                    cmd,
                    cwd=tmp_path,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.STDOUT,
                    text=True,
                    timeout=timeout
                )
                log_output = result.stdout
                pdf_output = tmp_path / "document.pdf"

                if result.returncode != 0 or not pdf_output.is_file():
                    # Attempt Self-Healing Sanitization Retry
                    fixed_source = self._attempt_self_healing(latex_source, log_output)
                    if fixed_source != latex_source:
                        tex_file.write_text(fixed_source, encoding="utf-8")
                        retry_result = subprocess.run(
                            cmd,
                            cwd=tmp_path,
                            stdout=subprocess.PIPE,
                            stderr=subprocess.STDOUT,
                            text=True,
                            timeout=timeout
                        )
                        log_output += "\n--- RETRY LOG ---\n" + retry_result.stdout
                        if retry_result.returncode == 0 and pdf_output.is_file():
                            latex_source = fixed_source

                if not pdf_output.is_file():
                    raise LaTeXCompilationError(
                        f"LaTeX compilation failed with exit code {result.returncode}",
                        latex_log=log_output,
                        source_code=latex_source
                    )

                pdf_bytes = pdf_output.read_bytes()

                # If an explicit destination path was requested, copy it
                final_path = None
                if output_pdf_path:
                    dest = Path(output_pdf_path).resolve()
                    dest.parent.mkdir(parents=True, exist_ok=True)
                    dest.write_bytes(pdf_bytes)
                    final_path = str(dest)

                elapsed = time.time() - start_time
                return RenderResult(
                    success=True,
                    pdf_bytes=pdf_bytes,
                    latex_source=latex_source,
                    output_pdf_path=final_path,
                    compilation_log=log_output,
                    compile_time_seconds=round(elapsed, 2)
                )

            except subprocess.TimeoutExpired:
                raise LaTeXCompilationError("LaTeX compilation timed out", source_code=latex_source)

    def _attempt_self_healing(self, source: str, log: str) -> str:
        """Detects common syntax or character errors in logs and attempts to patch source."""
        # Check for unescaped special characters
        repaired = source
        if "Missing $ inserted" in log or "Undefined control sequence" in log:
            # Aggressively replace unescaped percentage and dollar signs if left raw
            repaired = repaired.replace(r" %", r" \%").replace(r" $", r" \$")
        return repaired
