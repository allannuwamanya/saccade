"""LaTeX character escaping and sanitization utilities."""

import re
from typing import Any, Dict, List, Union


# Regex mapping for reserved LaTeX characters
LATEX_SUBS = (
    (re.compile(r"\\"), r"\\textbackslash{}"),
    (re.compile(r"([{}_#%&$])"), r"\\\1"),
    (re.compile(r"~"), r"\\textasciitilde{}"),
    (re.compile(r"\^"), r"\\textasciicircum{}"),
    (re.compile(r'"'), "''"),
    (re.compile(r"\n"), r" "),  # Prevent stray unescaped newlines in table cells
)


def escape_latex(text: Union[str, Any]) -> str:
    """Safely escapes all LaTeX special characters in a given string.

    Leaves non-string types converted to string safely.
    Preserves paragraph breaks for cover letters and summaries.
    """
    if text is None:
        return ""
    if not isinstance(text, str):
        text = str(text)

    # Normalize Windows line endings
    text = text.replace("\r\n", "\n")

    # If the text has multiple paragraphs, escape each paragraph independently
    if "\n\n" in text:
        paragraphs = re.split(r"\n\s*\n+", text)
        return "\n\n".join(escape_latex(p) for p in paragraphs if p.strip())

    # Apply character substitutions in strict order (\ must be replaced first)
    for pattern, replacement in LATEX_SUBS:
        text = pattern.sub(replacement, text)

    return text.strip()


def sanitize_for_latex(data: Any) -> Any:
    """Recursively walks nested dicts, lists, or Pydantic models to escape all strings."""
    if hasattr(data, "model_dump"):
        dumped = data.model_dump()
        return sanitize_for_latex(dumped)
    elif isinstance(data, dict):
        return {k: sanitize_for_latex(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [sanitize_for_latex(item) for item in data]
    elif isinstance(data, str):
        return escape_latex(data)
    else:
        return data
