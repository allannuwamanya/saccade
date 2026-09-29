# Saccade MCP (Model Context Protocol) Integration Guide

Saccade exposes its entire career document pipeline as a **Model Context Protocol (MCP)** server. This allows AI coding agents like **Claude Code**, **Google Antigravity**, **Cursor**, and **Claude Desktop** to access your canonical career graph, fetch and parse job postings, tailor bullets, audit ATS compliance, and compile vector-sharp LaTeX PDFs directly from natural conversation.

---

## 🛠️ Exposed MCP Tools

| Tool | Parameters | Description |
| :--- | :--- | :--- |
| `get_profile` | `profile_id: str = "default_profile"` | Returns the full structured JSON Resume master profile. |
| `save_profile` | `profile_json: str` | Persists or updates the canonical career profile. |
| `import_resume` | `file_path: str, profile_id: str` | Ingests a local PDF, DOCX, or text resume into structured JSON with atomic fact provenance. |
| `parse_job_posting` | `source: str` (URL or text) | Fetches public posting and extracts title, company, requirements, preferred skills, and ATS keywords. |
| `tailor_resume` | `job_source: str, theme: str, generate_cover_letter: bool, output_dir: str` | Executes end-to-end tailoring, applies honesty guardrail, runs ATS audit, and renders tailored PDF(s). |
| `audit_ats` | `job_source: str, profile_id: str` | Checks keyword density and verifies linear text readability without compiling a new document. |
| `render_document_pdf`| `profile_id: str, theme: str, output_path: str` | Compiles the canonical profile into a PDF using the specified LaTeX theme (`classic`, `modern`, `executive`). |

---

## 🔌 Host Configuration Instructions

### 1. Claude Code
Run in your terminal:
```bash
claude mcp add saccade -- /home/a-n/Documents/BUSINESS/saccade/.venv/bin/saccade mcp
```

### 2. Cursor
1. Open Cursor Settings $\rightarrow$ **Features** $\rightarrow$ **MCP Servers**.
2. Click **Add New MCP Server**.
3. Fill in:
   - **Name:** `saccade`
   - **Type:** `command`
   - **Command:** `/home/a-n/Documents/BUSINESS/saccade/.venv/bin/saccade mcp`

### 3. Claude Desktop (`claude_desktop_config.json`)
Add to `~/.config/Claude/claude_desktop_config.json` (Linux) or `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS):

```json
{
  "mcpServers": {
    "saccade": {
      "command": "/home/a-n/Documents/BUSINESS/saccade/.venv/bin/saccade",
      "args": ["mcp"],
      "env": {
        "SACCADE_LLM_PROVIDER": "anthropic",
        "ANTHROPIC_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

### 4. Google Antigravity
Add to your Antigravity project configuration:
```json
{
  "mcpServers": {
    "saccade": {
      "command": "/home/a-n/Documents/BUSINESS/saccade/.venv/bin/saccade",
      "args": ["mcp"]
    }
  }
}
```

---

## 💬 Example Agent Chat Prompts

Once connected via MCP, you can instruct your agent with plain language:

- *"Inspect my canonical Saccade profile and tell me which experiences mention Kafka or distributed consensus."*
- *"Import my old resume from `~/Downloads/resume_2024.pdf` into Saccade."*
- *"Tailor my resume for this posting: `https://jobs.lever.co/stripe/...` using the modern theme, generate a matching cover letter, and tell me my ATS score."*
- *"Render my executive resume to `output/alex_exec.pdf` and check if there are any formatting issues."*
