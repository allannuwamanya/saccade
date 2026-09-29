"""Global constants and defaults for Saccade."""

from enum import Enum


class DocumentType(str, Enum):
    RESUME = "resume"
    COVER_LETTER = "cover_letter"
    CV = "cv"
    BIO = "bio"


class ThemeName(str, Enum):
    CLASSIC = "classic"    # Academic / Serif (Overleaf style)
    MODERN = "modern"      # Contemporary Tech Sans-Serif
    EXECUTIVE = "executive"# Dense Leadership / 2-column style


class LLMProviderType(str, Enum):
    ANTHROPIC = "anthropic"
    OPENAI = "openai"
    GEMINI = "gemini"
    OLLAMA = "ollama"
    MOCK = "mock"          # Deterministic offline provider for unit testing & dry runs


# Standard ATS common stop words
ATS_STOPWORDS = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
    "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being",
    "below", "between", "both", "but", "by", "can", "can't", "cannot", "could",
    "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down",
    "during", "each", "few", "for", "from", "further", "had", "hadn't", "has",
    "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her",
    "here", "here's", "hers", "herself", "him", "himself", "his", "how", "how's",
    "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it",
    "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", "my",
    "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other",
    "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "shan't",
    "she", "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such",
    "than", "that", "that's", "the", "their", "theirs", "them", "themselves",
    "then", "there", "there's", "these", "they", "they'd", "they'll", "they're",
    "they've", "this", "those", "through", "to", "too", "under", "until", "up",
    "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were",
    "weren't", "what", "what's", "when", "when's", "where", "where's", "which",
    "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would",
    "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours",
    "yourself", "yourselves"
}

# Overused buzzwords to detect & avoid in the honest writing pass
BANNED_BUZZWORDS = [
    "spearheaded", "synergized", "leveraged", "paradigm shift",
    "go-getter", "dynamic self-starter", "thought leader",
    "passionate team player", "results-driven professional",
    "rockstar", "ninja", "guru", "orchestrated", "empowered"
]
