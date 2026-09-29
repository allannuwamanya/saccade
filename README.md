# Saccade 👁️

> **AI-Powered LaTeX Platform for Resumes, CVs & Professional Documents**  
> *True LaTeX Micro-Typography + Truth-Anchored AI Tailoring + Open Agent Core.*

---

## 💡 Overview

**Saccade** solves the classic dilemma in career document creation:
- **Design tools** (Canva, Reactive Resume) lack genuine LaTeX typography and have bolted-on AI.
- **AI resume builders** (Teal, Rezi) hallucinate metrics, produce cookie-cutter bullets, and use plain templates.
- **LaTeX tools** (RenderCV, Overleaf) have no AI, steep learning curves, and no unified career graph.

Saccade creates one **Canonical Career Graph** per user. From that single source of truth, an autonomous agent pipeline tailors, writes, ATS-audits, and typesets publication-grade resumes, CVs, cover letters, and bios.

---

## 🏛️ Modular Architecture

The repository is organized into clean, decoupled domain folders directly at the root for maximum modularity:

```text
saccade/
├── core/                  # Domain models, settings, and BYOK multi-model router
│   ├── models/            # Pydantic schemas (JSON Resume + Provenance + ATS)
│   └── llm/               # Multi-provider LLM interface (Anthropic, OpenAI, Gemini, Ollama)
├── agents/                # Autonomous pipeline agents
│   ├── intake.py          # Profile parser (PDF/DOCX/Notes)
│   ├── job_parser.py      # Job posting extractor (URL / Text)
│   ├── tailor.py          # Relevance scoring & gap analyzer
│   ├── writer.py          # STAR/XYZ bullet & letter drafter
│   ├── ats_checker.py     # ATS compliance & reading-order auditor
│   ├── guardrail.py       # Anti-hallucination fact provenance verifier
│   └── orchestrator.py    # Master workflow coordinator
├── rendering/             # LaTeX typography engine
│   ├── compiler.py        # Tectonic runner (with auto-provisioning)
│   ├── sanitizers.py      # LaTeX character escaping & defense
│   ├── page_budget.py     # Dynamic spacing & 1-page budget solver
│   └── templates/         # Jinja2 LaTeX themes (Classic, Modern, Executive)
├── interfaces/            # Delivery entry points
│   ├── cli/               # Terminal CLI (`saccade tailor`, `saccade render`)
│   ├── mcp/               # FastMCP server for Claude Code, Antigravity, Cursor
│   └── api/               # FastAPI backend for web frontend
├── storage/               # Persistence layer (Local JSON -> Supabase)
├── web/                   # Next.js 15 Web Application (Phase 2)
├── tests/                 # Unit & integration test suites
└── examples/              # Sample profiles, job postings, and rendered outputs
```

---

## 🔌 Entry Points: MCP & Standalone Web

Saccade has **one shared agent core** accessible through multiple surfaces:

1. **Model Context Protocol (MCP) Server (`interfaces/mcp`)**:
   - Primary interface for AI coding environments (**Claude Code**, **Google Antigravity**, **Cursor**, **Claude Desktop**).
   - Allows your agent to inspect your career profile, fetch a job URL, tailor your resume, check ATS scores, and compile a PDF directly from your chat prompt.
2. **Next.js Web Studio (`web/`)**:
   - Complete browser studio with side-by-side live PDF preview and conversational tailoring chat, powered by the same backend API.
3. **Command Line Interface (`interfaces/cli`)**:
   - Fast, local terminal commands for power users and CI/CD pipelines.

---

## 🔒 The Honesty Guarantee & BYOK Privacy

- **Zero Hallucinations**: Bullets are strictly bound to verified facts from your master profile. Missing qualifications produce **Gap Warnings** instead of fabricated metrics.
- **Bring Your Own Key (BYOK)**: Supports Anthropic, OpenAI, Google Gemini, and local offline models via **Ollama** so sensitive career data never leaves your computer.

---

## 🚀 Quickstart (Local Development)

```bash
# 1. Clone repository
git clone https://github.com/allannuwamanya/saccade.git
cd saccade

# 2. Install dependencies
pip install -e .

# 3. Configure environment
cp .env.example .env
# Edit .env with your preferred LLM provider & API keys

# 4. Run CLI
saccade --help
```

---

## 📄 License & Status
Open-Core · Developed under [PRD.md](file:///home/a-n/Documents/BUSINESS/saccade/PRD.md) specifications.
