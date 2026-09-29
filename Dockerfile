# ==========================================
# Stage 1: Build Modern React Frontend (Vite)
# ==========================================
FROM node:20-slim AS frontend-builder
WORKDIR /app/web

COPY web/package.json ./
RUN npm install

COPY web/ ./
RUN npm run build

# ==========================================
# Stage 2: Production Saccade Runtime
# ==========================================
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000 \
    TECTONIC_PATH=/usr/local/bin/tectonic

# Install system dependencies
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

# Install Python dependencies
COPY requirements.txt pyproject.toml ./
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt \
    && pip install --no-cache-dir -e .

# Copy application source
COPY . .

# Copy built modern React frontend from Stage 1 into web/dist
COPY --from=frontend-builder /app/web/dist ./web/dist

# Ensure writable runtime directories
RUN mkdir -p output .saccade && chmod -R 777 output .saccade

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/health || exit 1

CMD ["sh", "-c", "uvicorn interfaces.api.app:app --host 0.0.0.0 --port ${PORT:-8000}"]
