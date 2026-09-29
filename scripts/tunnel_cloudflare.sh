#!/usr/bin/env bash
# Saccade - Cloudflare Quick Tunnel Helper
# Exposes local Saccade instance (http://localhost:8000) to the public internet via Cloudflare
set -euo pipefail

PORT="${1:-8000}"
BIN_DIR="$(pwd)/.bin"
CLOUDFLARED_BIN="${BIN_DIR}/cloudflared"

mkdir -p "${BIN_DIR}"

if ! command -v cloudflared &>/dev/null && [ ! -f "${CLOUDFLARED_BIN}" ]; then
    echo "⬇️  Downloading Cloudflare Tunnel CLI (cloudflared)..."
    curl -fsSL https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o "${CLOUDFLARED_BIN}"
    chmod +x "${CLOUDFLARED_BIN}"
    echo "✅ cloudflared installed to ${CLOUDFLARED_BIN}"
fi

CMD="cloudflared"
if [ -f "${CLOUDFLARED_BIN}" ]; then
    CMD="${CLOUDFLARED_BIN}"
fi

echo "🚀 Starting Cloudflare Tunnel for http://localhost:${PORT}..."
echo "⚡ A public https://*.trycloudflare.com link will appear below momentarily."
echo "Press Ctrl+C to terminate the tunnel."
echo "------------------------------------------------------------"

exec "${CMD}" tunnel --url "http://localhost:${PORT}"
