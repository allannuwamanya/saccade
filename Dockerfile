# Saccade AI Resume & Career Document Engine
# Production Container with Tectonic LaTeX Engine & FastAPI Studio

FROM python:3.12-slim

# Prevent Python from writing .pyc files and enable unbuffered terminal logging
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000 \
    TECTONIC_PATH=/usr/local/bin/tectonic

# Install essential system dependencies:
# - curl, ca-certificates, tar: for fetching standalone Tectonic binary
# - poppler-utils: pdftotext for PDF resume ingestion
# - fontconfig: system font cache discovery for LaTeX micro-typography
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    tar \
    poppler-utils \
    fontconfig \
    && rm -rf /var/lib/apt/lists/*

# Install standalone static Tectonic binary (x86_64 musl)
RUN curl -fsSL https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic%400.15.0/tectonic-0.15.0-x86_64-unknown-linux-musl.tar.gz \
    | tar -xz -C /usr/local/bin/ \
    && chmod +x /usr/local/bin/tectonic \
    && tectonic --version

WORKDIR /app

# Install Python dependencies first for optimal Docker layer caching
COPY requirements.txt pyproject.toml ./
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt \
    && pip install --no-cache-dir -e .

# Copy application source tree
COPY . .

# Ensure required runtime directories exist with write access
RUN mkdir -p output .saccade && chmod -R 777 output .saccade

EXPOSE 8000

# Health check probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/health || exit 1

# Launch FastAPI web studio and API server
CMD ["sh", "-c", "uvicorn interfaces.api.app:app --host 0.0.0.0 --port ${PORT:-8000}"]
