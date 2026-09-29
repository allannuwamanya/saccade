"""Jinja2 LaTeX template rendering engine."""

from pathlib import Path
from typing import Dict, Any, Optional
import jinja2

from core.constants import ThemeName, DocumentType
from core.exceptions import LaTeXCompilationError
from core.models.document import TailoredDocument, StyleOptions
from rendering.sanitizers import sanitize_for_latex, escape_latex


TEMPLATES_DIR = Path(__file__).parent / "templates"


def get_jinja_latex_environment(template_dir: Path = TEMPLATES_DIR) -> jinja2.Environment:
    """Creates a Jinja2 Environment configured with LaTeX-safe delimiters."""
    env = jinja2.Environment(
        block_start_string=r"\BLOCK{",
        block_end_string=r"}",
        variable_start_string=r"\VAR{",
        variable_end_string=r"}",
        comment_start_string=r"\#{",
        comment_end_string=r"}",
        line_statement_prefix=r"%%",
        line_comment_prefix=r"%#",
        trim_blocks=True,
        lstrip_blocks=True,
        autoescape=False,
        loader=jinja2.FileSystemLoader(str(template_dir))
    )
    env.filters["latex"] = escape_latex
    return env


class TemplateEngine:
    """Renders LaTeX documents from domain models and Jinja2 TeX themes."""

    def __init__(self, templates_dir: Path = TEMPLATES_DIR):
        self.templates_dir = templates_dir
        self.env = get_jinja_latex_environment(templates_dir)

    def render(
        self,
        document: TailoredDocument,
        theme: ThemeName = ThemeName.CLASSIC,
        style: Optional[StyleOptions] = None
    ) -> str:
        """Renders LaTeX source code for a tailored document."""
        if style is None:
            style = StyleOptions()

        # Determine template relative path based on doc type and theme
        if document.document_type == DocumentType.COVER_LETTER:
            template_path = f"letters/{theme.value}.tex"
        else:
            template_path = f"themes/{theme.value}/resume.tex"

        try:
            template = self.env.get_template(template_path)
        except jinja2.TemplateNotFound:
            if document.document_type == DocumentType.COVER_LETTER:
                template_path = f"letters/{ThemeName.CLASSIC.value}.tex"
            else:
                template_path = f"themes/{ThemeName.CLASSIC.value}/resume.tex"
            template = self.env.get_template(template_path)

        # Sanitize all strings in document to prevent LaTeX injection
        sanitized_doc = sanitize_for_latex(document)
        context = {
            "doc": sanitized_doc,
            "profile": sanitized_doc["profile"],
            "basics": sanitized_doc["profile"]["basics"],
            "work": sanitized_doc["profile"]["work"],
            "education": sanitized_doc["profile"]["education"],
            "skills": sanitized_doc["profile"]["skills"],
            "projects": sanitized_doc["profile"]["projects"],
            "certificates": sanitized_doc["profile"]["certificates"],
            "publications": sanitized_doc["profile"]["publications"],
            "style": style.model_dump()
        }

        return template.render(**context)
