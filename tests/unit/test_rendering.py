"""Unit tests for LaTeX sanitization, template rendering, and Tectonic compilation."""

import json
from pathlib import Path
import pytest
from core.models.profile import MasterProfile
from core.models.document import TailoredDocument, StyleOptions
from core.constants import ThemeName, DocumentType
from rendering.sanitizers import escape_latex, sanitize_for_latex
from rendering.engine import TemplateEngine
from rendering.compiler import LatexCompiler, resolve_compiler_binary


def test_escape_latex():
    # Reserved characters should be escaped
    assert escape_latex("Profit & Loss: 50% increase, $100k savings #1 priority_task") == (
        r"Profit \& Loss: 50\% increase, \$100k savings \#1 priority\_task"
    )
    # Curly braces
    assert escape_latex("{hello_world}") == r"\{hello\_world\}"
    # Tilde and caret
    assert r"\textasciitilde{}" in escape_latex("~path")
    assert r"\textasciicircum{}" in escape_latex("^caret")


def test_template_engine_renders_classic():
    sample_path = Path("examples/master_profile.json")
    profile = MasterProfile.model_validate(json.loads(sample_path.read_text(encoding="utf-8")))
    doc = TailoredDocument(document_type=DocumentType.RESUME, profile=profile)

    engine = TemplateEngine()
    source = engine.render(doc, theme=ThemeName.CLASSIC)

    assert r"\documentclass" in source
    assert "Alex Mercer" in source
    assert "Stripe" in source
    assert "Chronos Raft" in source


def test_template_engine_renders_modern_and_executive():
    sample_path = Path("examples/master_profile.json")
    profile = MasterProfile.model_validate(json.loads(sample_path.read_text(encoding="utf-8")))
    doc = TailoredDocument(document_type=DocumentType.RESUME, profile=profile)

    engine = TemplateEngine()
    modern_src = engine.render(doc, theme=ThemeName.MODERN)
    assert r"\documentclass" in modern_src
    assert "Alex Mercer" in modern_src

    exec_src = engine.render(doc, theme=ThemeName.EXECUTIVE)
    assert r"\documentclass" in exec_src
    assert "Alex Mercer" in exec_src


def test_cover_letter_template():
    sample_path = Path("examples/master_profile.json")
    profile = MasterProfile.model_validate(json.loads(sample_path.read_text(encoding="utf-8")))
    doc = TailoredDocument(
        document_type=DocumentType.COVER_LETTER,
        target_company="Anthropic",
        target_job_title="Staff Systems Engineer",
        profile=profile,
        cover_letter_content="I am thrilled to submit my application for this role."
    )

    engine = TemplateEngine()
    letter_src = engine.render(doc, theme=ThemeName.CLASSIC)
    assert "Anthropic" in letter_src
    assert "Staff Systems Engineer" in letter_src
    assert "I am thrilled to submit my application" in letter_src
