"""Custom domain exceptions for Saccade."""

class SaccadeError(Exception):
    """Base exception for all Saccade errors."""
    pass


class ModelValidationError(SaccadeError):
    """Raised when profile or job data fails domain validation."""
    pass


class HallucinationError(SaccadeError):
    """Raised when the honesty guardrail detects an unverified claim."""
    pass


class LaTeXCompilationError(SaccadeError):
    """Raised when LaTeX / Tectonic compilation fails."""
    def __init__(self, message: str, latex_log: str = "", source_code: str = ""):
        super().__init__(message)
        self.latex_log = latex_log
        self.source_code = source_code


class CompilerNotFoundError(SaccadeError):
    """Raised when neither Tectonic nor a fallback LaTeX engine is available."""
    pass


class LLMProviderError(SaccadeError):
    """Raised when an LLM provider call fails or returns invalid output."""
    pass


class StorageError(SaccadeError):
    """Raised when reading or writing profile storage fails."""
    pass
