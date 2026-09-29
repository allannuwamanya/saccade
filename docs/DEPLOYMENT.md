# Free Hosting & Cloud Deployment Guide for Saccade

This guide explains how to host **Saccade** online **100% free of charge**, including Cloudflare options and cloud container platforms.

---

## Architecture Reality: Why Tectonic Needs a Linux Container

Saccade uses **Tectonic**, an automated, self-contained native LaTeX compiler binary (`x86_64` ELF).
- **Pure Cloudflare Workers / Edge Isolates**: Cloudflare Workers run inside V8 JavaScript isolates without a Linux kernel or subprocess execution capability (`fork`/`exec`). Therefore, native Tectonic cannot compile LaTeX directly within an isolated Worker without WebAssembly recompilation.
- **The Ideal Free Stack**:
  1. **Container Backend (Render / Hugging Face)**: Runs the FastAPI server and native Tectonic compiler inside a Linux Docker container on a free tier.
  2. **Cloudflare Edge (Pages / Tunnel)**: Delivers the Web Studio globally with ultra-low latency, SSL, custom domain routing, and DDoS protection for $0/month.

---

## Option 1: Render.com (Recommended Free Web Service)

Render provides free Linux web service instances with automatic HTTPS, continuous deployment from GitHub, and custom domains.

### Features
- **Cost**: $0 / month (750 free instance hours per month)
- **Environment**: Docker container with Python 3.12 + native Tectonic
- **Custom Domains**: Free with automated SSL certificate provisioning

### One-Click Deploy via Render Dashboard
1. Go to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** > **Web Service**.
3. Connect your GitHub repository (`https://github.com/allannuwamanya/saccade`).
4. Select runtime **Docker**.
5. Set the Plan to **Free**.
6. Set Environment Variables (optional):
   - `LLM_PROVIDER`: `mock` (or `anthropic` / `openai` / `gemini` if you provide an API key)
7. Click **Create Web Service**. Render will build the Docker container and provide a live URL:
   `https://saccade.onrender.com`

---

## Option 2: Cloudflare Quick Tunnel (Instant Zero-Setup Public URL)

If you are running Saccade locally or on a VPS/home server, **Cloudflare Tunnel (`cloudflared`)** exposes your local instance to the world through Cloudflare's global edge network without opening any firewall ports or configuring router NAT.

### Running with Saccade's Tunnel Script
In your terminal, start the Saccade server:
```bash
python -m uvicorn interfaces.api.app:app --host 0.0.0.0 --port 8000
```
In another terminal, run:
```bash
./scripts/tunnel_cloudflare.sh
```
This automatically fetches `cloudflared` if not already installed and outputs a secure public URL:
```text
https://random-assigned-name.trycloudflare.com
```
You can share this link with anyone, test on mobile devices, or use it for live demos.

### Binding to your own Custom Domain on Cloudflare
If you have a domain managed by Cloudflare DNS (e.g. `yourdomain.com`):
```bash
# 1. Authenticate with Cloudflare
cloudflared tunnel login

# 2. Create named tunnel
cloudflared tunnel create saccade-tunnel

# 3. Route DNS
cloudflared tunnel route dns saccade-tunnel saccade.yourdomain.com

# 4. Run tunnel
cloudflared tunnel run --url http://localhost:8000 saccade-tunnel
```

---

## Option 3: Cloudflare Pages + Render API (Decoupled Jamstack)

For maximum frontend performance:
1. **Frontend on Cloudflare Pages**:
   - Repository: `allannuwamanya/saccade`
   - Build output directory: `web`
   - Build command: (leave empty, static HTML/CSS/JS)
   - Cloudflare Pages will serve the Web Studio globally with zero latency.
2. **API Proxying**:
   - The repository includes [`web/_redirects`](file:///home/a-n/Documents/BUSINESS/saccade/web/_redirects):
     ```text
     /api/* https://saccade.onrender.com/api/:splat 200
     ```
   - Cloudflare Pages transparently forwards all `/api/*` and PDF download calls to your Render backend service.

---

## Option 4: Hugging Face Spaces (Free Docker 16GB RAM)

Hugging Face Spaces offers a generous free tier (2 vCPU, 16 GB RAM Docker containers) ideal for AI tools.
1. Create a new Space at [huggingface.co/spaces](https://huggingface.co/spaces).
2. Choose **Docker** as the SDK.
3. Link your GitHub repository or push the Dockerfile.
4. Set container port to `8000`.

---

## Health Check & Verification

Once deployed to any online host, verify the deployment:
```bash
# 1. Check health & compiler detection
curl https://<YOUR_DEPLOYED_URL>/health

# Expected response:
# {"status":"healthy","service":"saccade-api","compiler":"/usr/local/bin/tectonic"}

# 2. Test live render
curl -X POST https://<YOUR_DEPLOYED_URL>/api/render \
  -H "Content-Type: application/json" \
  -d '{"profile_id":"default_profile","theme":"modern","document_type":"resume"}'
```
