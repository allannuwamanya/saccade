"""Pre-compilation LaTeX source guard: blocks dangerous command patterns."""

import re
from typing import List

# Commands that can read arbitrary files, write to disk, or execute shell commands.
# Tectonic disables \write18 by design, but the pdflatex fallback does not.
# We block the entire set regardless of which engine is active.
_DANGEROUS_PATTERNS: List[str] = [
    r"\\write18\b",            # shell escape (pdflatex)
    r"\\openout\b",            # arbitrary file write
    r"\\input\s*\{/",          # absolute-path file read
    r"\\include\s*\{/",        # absolute-path include
    r"\\immediate\s*\\write",  # deferred file/shell write
    r"\\catcode\s*`",          # redefine character codes
    r"\\def\s*\\",             # redefine control sequences
    r"\\let\s*\\",             # alias control sequences
    r"\\expandafter\s*\\",     # macro expansion tricks
]

_COMPILED = [re.compile(p, re.IGNORECASE) for p in _DANGEROUS_PATTERNS]


def assert_safe_latex(source: str) -> None:
    """Raise ValueError if source contains any blocked LaTeX command."""
    for pattern in _COMPILED:
        if pattern.search(source):
            raise ValueError(
                f"Blocked potentially dangerous LaTeX command "
                f"(matched pattern: {pattern.pattern!r}). "
                "Raw LaTeX input must not contain shell-escape, file-write, "
                "or macro-redefinition commands."
            )
