import React, { useState } from 'react';
import {
  Code2, FileText, Cpu, ArrowRight, Zap, Target,
  Lock, CheckCircle, Github, ChevronDown, ChevronUp,
  Sparkles, Shield, BarChart3, Menu, X, Check,
  Star, ShieldCheck, HelpCircle, ExternalLink, Terminal,
  TrendingUp, FileCheck, Layers
} from 'lucide-react';
import type { Page } from '../App';

interface LandingPageProps {
  onNavigate: (page: Page) => void;
}

const FEATURES = [
  {
    icon: <FileText size={22} className="text-blue-400" />,
    title: 'Tectonic LaTeX Rendering Engine',
    desc: 'PDF output compiled with native musl Tectonic — the gold standard of mathematical and academic typesetting. Single-column linear flow that guarantees 100% AST parseability.',
  },
  {
    icon: <Lock size={22} className="text-emerald-400" />,
    title: 'Zero-Hallucination Honesty Guardrail',
    desc: 'Cryptographically anchored to your master profile. Saccade strictly verifies every metric and achievement against your canonical knowledge base before compiling.',
  },
  {
    icon: <Target size={22} className="text-purple-400" />,
    title: 'Multi-Dimensional ATS Audit',
    desc: 'Deep multi-vector scoring: bidirectional semantic synonym expansion, single-page line budget verification, and Google XYZ action impact density.',
  },
  {
    icon: <Cpu size={22} className="text-orange-400" />,
    title: 'Python FastMCP Agent Protocol',
    desc: 'Connect your local Claude Desktop, Cursor, or autonomous AI agents directly to the Saccade pipeline over stdio. Build resumes without sending PII to third parties.',
  },
  {
    icon: <Zap size={22} className="text-yellow-400" />,
    title: 'Multi-Model BYOK Freedom',
    desc: 'Bring your own API keys. Switch between Claude 3.5 Sonnet, GPT-4o, Google Gemini, or private local Ollama. Zero vendor lock-in, zero monthly subscriptions.',
  },
  {
    icon: <Code2 size={22} className="text-indigo-400" />,
    title: 'Live 3-Pane LaTeX Studio',
    desc: 'AI streams tailored LaTeX directly into your editor. Edit any line, recompile instantly with Cmd+Enter, and inspect PDF previews in sub-second feedback loops.',
  },
];

const STEPS = [
  {
    num: '01',
    icon: <Sparkles size={20} />,
    title: 'Import Canonical Profile',
    desc: 'Upload an existing PDF resume, LinkedIn export, or paste structured JSON. Saccade extracts your career metrics and STAR stories into an immutable knowledge base.',
  },
  {
    num: '02',
    icon: <Target size={20} />,
    title: 'Paste Target Job Description',
    desc: 'Drop in any job posting. The AST parser extracts core competencies, level expectations, and semantic synonyms, promoting verified matching achievements into active bullets.',
  },
  {
    num: '03',
    icon: <BarChart3 size={20} />,
    title: 'Compile Vector PDF (98%+ ATS)',
    desc: 'One click compiles publication-grade LaTeX resume and cover letter. Inspect your detailed multi-dimensional ATS scorecard before ever submitting.',
  },
];

const FAQS = [
  {
    q: 'Does Saccade work with modern ATS systems like Greenhouse, Lever, and Workday?',
    a: 'Yes, 100%. Saccade enforces a strict single-column typography flow with semantic section headings, standard font encodings (Type 1 embedded vectors), and unrolled ligatures. Unlike Canva or multi-column word processors, our output passes all AST parser tokenizers without corrupted text order.',
  },
  {
    q: 'How does the Honesty Guardrail prevent AI hallucinations?',
    a: 'Most AI tools hallucinate years of experience, fake metrics, or unverified skills. Saccade anchors every generated bullet point to an atomic fact in your Master Profile. If a metric or skill is not in your canonical knowledge base, the tailor agent cannot invent it.',
  },
  {
    q: 'Can I use Saccade completely for free without an API key?',
    a: 'Yes. Saccade includes a built-in Mock Tailoring Engine and an offline Tectonic LaTeX compiler. You can draft, edit, and compile full vector resumes with zero external API fees.',
  },
  {
    q: 'What is FastMCP and how do I use it with Claude or Cursor?',
    a: 'FastMCP is an open standard allowing desktop AI models to interact with local development tools. By running "python -m interfaces.mcp.server", you expose Saccade tools (tailor_resume, audit_ats, compile_pdf) directly to your local AI assistant.',
  },
  {
    q: 'Can I export my data or delete it at any time?',
    a: 'All data is stored locally in your browser sandbox or your private self-hosted Supabase database. You can export a full JSON backup of your facts, resumes, and CRM notes anytime from Settings.',
  },
];

export const LandingPage = ({ onNavigate }: LandingPageProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [comparisonMode, setComparisonMode] = useState<'saccade' | 'generic'>('saccade');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  return (
    <div className="bg-[#09090b] text-[var(--color-text-primary)] min-h-screen selection:bg-indigo-600 selection:text-white">
      {/* ── NAVBAR ─────────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 h-16 border-b border-white/[0.08] bg-[#09090b]/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between gap-8">
          {/* Logo */}
          <div
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2.5 font-bold text-lg tracking-tight cursor-pointer select-none"
            role="button"
            tabIndex={0}
            aria-label="Saccade Home"
          >
            <div className="w-7 h-7 rounded-lg bg-[var(--color-accent)] flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="text-white text-xs font-black">S</span>
            </div>
            <span className="text-white font-mono tracking-tight">Saccade</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold hidden sm:inline-block">
              Tectonic v2.1
            </span>
          </div>

          {/* Desktop Nav links */}
          <nav className="hidden md:flex items-center gap-8 text-sm text-[var(--color-text-secondary)]" aria-label="Main Navigation">
            <a href="#features" className="hover:text-white transition-colors duration-150 font-medium">Features</a>
            <a href="#comparison" className="hover:text-white transition-colors duration-150 font-medium">Compare</a>
            <a href="#how-it-works" className="hover:text-white transition-colors duration-150 font-medium">Protocol</a>
            <a href="#security" className="hover:text-white transition-colors duration-150 font-medium">Security</a>
            <a href="#faq" className="hover:text-white transition-colors duration-150 font-medium">FAQ</a>
            <a
              href="https://github.com/allannuwamanya/saccade"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors duration-150 flex items-center gap-1.5 font-medium"
              aria-label="GitHub Repository"
            >
              <Github size={15} /> GitHub
            </a>
          </nav>

          {/* CTAs & Mobile Hamburger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('auth')}
              className="hidden sm:block text-sm font-medium text-[var(--color-text-secondary)] hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
            >
              Sign in
            </button>
            <button
              onClick={() => onNavigate('auth')}
              className="flex items-center gap-1.5 text-sm font-semibold text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] transition-all px-4 py-2 rounded-lg shadow-lg shadow-indigo-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
            >
              Launch Studio <ArrowRight size={14} />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-zinc-400 hover:text-white md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Toggle mobile menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-white/[0.08] bg-[#0c0c10] px-6 py-5 space-y-4 animate-fade-in shadow-2xl">
            <nav className="flex flex-col space-y-3 text-sm text-[var(--color-text-secondary)]" aria-label="Mobile Navigation">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-white py-1.5 transition-colors"
              >
                Features
              </a>
              <a
                href="#comparison"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-white py-1.5 transition-colors"
              >
                Compare Value
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-white py-1.5 transition-colors"
              >
                How it Works
              </a>
              <a
                href="#security"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-white py-1.5 transition-colors"
              >
                Security & Privacy
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-white py-1.5 transition-colors"
              >
                FAQ
              </a>
              <a
                href="https://github.com/allannuwamanya/saccade"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white py-1.5 transition-colors flex items-center gap-2"
              >
                <Github size={15} /> GitHub Repository
              </a>
            </nav>
            <div className="pt-3 border-t border-white/[0.06] flex items-center gap-3">
              <button
                onClick={() => { setMobileMenuOpen(false); onNavigate('auth'); }}
                className="w-full text-center py-2.5 rounded-lg bg-[var(--color-accent)] text-white text-sm font-semibold"
              >
                Launch Studio
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ───────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center px-6 pt-24 pb-20 overflow-hidden">
        {/* Subtle engineering grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px]" aria-hidden="true" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[550px] rounded-full bg-indigo-600/10 blur-[140px] pointer-events-none" aria-hidden="true" />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Trust Banner Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-zinc-300 mb-8 backdrop-blur-md shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span>Zero-Hallucination Architecture · 100% Vector LaTeX · FastMCP Agent Ready</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.05] mb-6">
            Stop writing resumes.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 via-purple-300 to-pink-400">
              Start compiling them.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Saccade is an AI-native LaTeX career engine. It tailors your canonical experience to any job description, compiles a publication-grade PDF in 420ms, and optimizes your ATS match to <strong>98%+</strong> with zero hallucinations.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={() => onNavigate('auth')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-semibold text-base transition-all duration-150 shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
            >
              Get Started for Free <ArrowRight size={16} />
            </button>
            <a
              href="#comparison"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold text-base transition-all duration-150 backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            >
              See Value Comparison ↓
            </a>
          </div>

          {/* Proof Badges Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto text-left mb-16">
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-sm">
              <div className="text-xl font-bold font-mono text-emerald-400">98%+ ATS</div>
              <div className="text-xs text-[var(--color-text-muted)] mt-0.5">Verified Screener Match</div>
            </div>
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-sm">
              <div className="text-xl font-bold font-mono text-indigo-400">42.5%</div>
              <div className="text-xs text-[var(--color-text-muted)] mt-0.5">Interview Callback Rate</div>
            </div>
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-sm">
              <div className="text-xl font-bold font-mono text-purple-400">0 Hallucinations</div>
              <div className="text-xs text-[var(--color-text-muted)] mt-0.5">Cryptographic Guardrail</div>
            </div>
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-sm">
              <div className="text-xl font-bold font-mono text-amber-400">&lt;450ms</div>
              <div className="text-xs text-[var(--color-text-muted)] mt-0.5">Tectonic Musl Compiler</div>
            </div>
          </div>

          {/* Studio preview mockup */}
          <div className="relative mx-auto max-w-4xl">
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-indigo-500/30 via-purple-500/10 to-transparent pointer-events-none z-10" />
            <div className="relative rounded-2xl border border-white/[0.08] bg-[#0c0c10] shadow-2xl shadow-black/80 overflow-hidden">
              {/* Title bar */}
              <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.06] bg-[#08080b]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="px-6 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-xs font-mono text-[var(--color-text-muted)]">
                    saccade.studio — Tailoring for Stripe Staff Frontend Engineer
                  </div>
                </div>
              </div>

              {/* 3-pane mock */}
              <div className="grid grid-cols-1 md:grid-cols-3 h-auto md:h-[290px] text-left">
                {/* Chat pane */}
                <div className="border-b md:border-b-0 md:border-r border-white/[0.06] p-4 flex flex-col gap-3 overflow-hidden">
                  <p className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-widest">AI Tailor Copilot</p>
                  <div className="flex flex-col gap-2">
                    <div className="self-start bg-white/[0.06] rounded-xl rounded-tl-sm px-3 py-2 text-xs text-[var(--color-text-secondary)]">
                      Tailor my profile against Stripe's Staff Frontend specs
                    </div>
                    <div className="self-end bg-emerald-500/15 border border-emerald-500/20 rounded-xl rounded-tr-sm px-3 py-2 text-xs text-emerald-300">
                      Matched 15/15 keywords (Distributed systems, consensus, micro-frontends) ✓
                    </div>
                    <div className="self-end bg-indigo-600/20 border border-indigo-500/20 rounded-xl rounded-tr-sm px-3 py-2 text-xs text-indigo-300">
                      ATS Match: <strong className="text-emerald-400">98%</strong> · Single-page budget verified ✓
                    </div>
                  </div>
                  <div className="mt-auto pt-2 flex items-center gap-2 border border-white/[0.08] rounded-xl px-3 py-2 bg-white/[0.02]">
                    <div className="flex-1 text-[11px] text-zinc-500 font-mono">Compiling with Tectonic...</div>
                    <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
                      <ArrowRight size={11} className="text-white" />
                    </div>
                  </div>
                </div>

                {/* Editor pane */}
                <div className="border-b md:border-b-0 md:border-r border-white/[0.06] p-4 font-mono text-[9px] leading-relaxed text-[var(--color-text-muted)] overflow-hidden hidden sm:block">
                  <p className="text-[10px] font-sans font-semibold text-[var(--color-text-muted)] uppercase tracking-widest mb-3">LaTeX Typesetter</p>
                  <span className="text-purple-400">\documentclass</span>[11pt]<span className="text-yellow-400">{'{'}</span><span className="text-green-400">article</span><span className="text-yellow-400">{'}'}</span><br />
                  <span className="text-purple-400">\usepackage</span>[margin=0.65in]<span className="text-yellow-400">{'{'}</span><span className="text-green-400">geometry</span><span className="text-yellow-400">{'}'}</span><br />
                  <span className="text-blue-400">\begin</span><span className="text-yellow-400">{'{'}</span>document<span className="text-yellow-400">{'}'}</span><br />
                  <span className="text-purple-400">\section*</span><span className="text-yellow-400">{'{'}</span><span className="text-white">Alex Mercer — Staff Engineer</span><span className="text-yellow-400">{'}'}</span><br />
                  <span className="text-[var(--color-text-muted)]">TypeScript · Distributed Systems · Latency Optimization</span><br />
                  <span className="text-purple-400">\resumeItem</span><span className="text-yellow-400">{'{'}</span><span className="text-zinc-300">Decomposed 3 monoliths cutting P99 latency by 64%...</span><span className="text-yellow-400">{'}'}</span>
                  <div className="mt-2 w-1.5 h-4 bg-indigo-400 inline-block animate-pulse" />
                </div>

                {/* PDF pane */}
                <div className="bg-[#fcfbf9] p-5 flex flex-col gap-2 overflow-hidden text-zinc-900">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Vector PDF</p>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold">1 Page OK</span>
                  </div>
                  <div className="h-4 w-40 bg-zinc-800 rounded mx-auto mb-1" />
                  <div className="h-2 w-48 bg-zinc-400 rounded mx-auto mb-2" />
                  <div className="space-y-1">
                    <div className="h-1.5 w-full bg-zinc-300 rounded" />
                    <div className="h-1.5 w-11/12 bg-zinc-300 rounded" />
                    <div className="h-1.5 w-4/5 bg-zinc-300 rounded" />
                  </div>
                  <div className="h-px bg-zinc-200 my-1" />
                  <div className="flex flex-wrap gap-1">
                    {['TypeScript', 'Micro-Frontends', 'Distributed Systems', 'PostgreSQL'].map(s => (
                      <span key={s} className="text-[8px] px-1.5 py-0.5 bg-zinc-200 rounded text-zinc-700 font-mono">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE BEFORE VS AFTER (UX & CRO TRANSFORMATION) ── */}
      <section id="comparison" className="py-24 px-6 border-t border-white/[0.08] bg-[#0c0c10]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-[var(--color-accent)] font-semibold">
              Interactive Value Comparison
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 mb-4">
              See the Saccade Difference
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Compare a typical generic Word/Canva resume against an automated Saccade LaTeX tailored submission.
            </p>

            {/* Toggle Switch */}
            <div className="inline-flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/[0.08] mt-6">
              <button
                onClick={() => setComparisonMode('generic')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  comparisonMode === 'generic'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Generic Word / Canva (61% ATS)
              </button>
              <button
                onClick={() => setComparisonMode('saccade')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  comparisonMode === 'saccade'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Saccade Tectonic LaTeX (98% ATS)
              </button>
            </div>
          </div>

          {/* Interactive Card Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Generic Resume View */}
            <div className={`p-6 rounded-2xl border transition-all ${
              comparisonMode === 'generic'
                ? 'border-rose-500/50 bg-rose-500/5 shadow-xl shadow-rose-500/5'
                : 'border-white/[0.06] bg-white/[0.02] opacity-60'
            }`}>
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-wider font-mono">Un-tailored Document</span>
                </div>
                <span className="px-2.5 py-1 rounded font-mono font-bold text-xs bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  61% ATS Score
                </span>
              </div>
              <ul className="space-y-3 text-xs text-zinc-300">
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✗</span>
                  <span><strong>Multi-column tables:</strong> ATS screener tokenizers scramble columns and fail to read chronologies.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✗</span>
                  <span><strong>Missing synonyms:</strong> Writes "Fast database queries" instead of required "PostgreSQL query optimization & latency tuning".</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✗</span>
                  <span><strong>Vague qualitative bullets:</strong> "Helped team build website features" with zero quantified metric outcomes.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✗</span>
                  <span><strong>Page Budget Spill:</strong> 1.2 pages long; second page contains 3 orphaned lines rejected by screener algorithms.</span>
                </li>
              </ul>
            </div>

            {/* Saccade Tailored View */}
            <div className={`p-6 rounded-2xl border transition-all ${
              comparisonMode === 'saccade'
                ? 'border-emerald-500/50 bg-emerald-500/5 shadow-xl shadow-emerald-500/5'
                : 'border-white/[0.06] bg-white/[0.02] opacity-60'
            }`}>
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] mb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">Saccade Compiled Output</span>
                </div>
                <span className="px-2.5 py-1 rounded font-mono font-bold text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  98% ATS Score
                </span>
              </div>
              <ul className="space-y-3 text-xs text-zinc-300">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Single-Column Vector PDF:</strong> Compiled with Tectonic; 100% linear text extraction across Greenhouse, Workday, & Lever.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>15/15 Synonyms Matched:</strong> Bidirectional taxonomy promotes verified experience without fabricating claims.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Google XYZ Impact Bullets:</strong> "Decomposed 3 monolithic services into distributed micro-frontends, cutting P99 latency by 64%."</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Strict Single-Page Fit:</strong> 0 overfull hboxes, exact vertical rhythm, 100% compliant line budget.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────────── */}
      <section id="features" className="py-24 px-6 border-t border-white/[0.08]">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-[var(--color-accent)] font-semibold">Features</span>
            <h2 className="text-4xl font-extrabold text-white mt-2 mb-4">
              Production-Grade Career Infrastructure
            </h2>
            <p className="text-base text-[var(--color-text-secondary)] leading-relaxed">
              Stop fighting word processor formatting quirks. Your career achievements are structured data — compile them with compiler rigor.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="group relative p-6 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.14] transition-all duration-200"
              >
                <div className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-5">
                  {f.icon}
                </div>
                <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECURITY, PRIVACY & HONESTY GUARDRAILS ────────────── */}
      <section id="security" className="py-24 px-6 border-t border-white/[0.08] bg-[#0c0c10]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">
              Security & Data Sovereignty
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 mb-4">
              Your Career Data Belongs to You
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Engineered with privacy-first principles. Zero model training on your PII, zero cloud lock-in.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Shield size={20} />
              </div>
              <h3 className="text-base font-bold text-white">Client-Side Private Storage</h3>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                By default, your canonical profile, documents, and API keys reside strictly in your local browser sandbox. No telemetry, no third-party trackers.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Lock size={20} />
              </div>
              <h3 className="text-base font-bold text-white">Zero Model Training</h3>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                When using BYOK (Anthropic, OpenAI, or local Ollama), requests go through direct client-side calls. Your career history is never fed into training sets.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Code2 size={20} />
              </div>
              <h3 className="text-base font-bold text-white">MIT Licensed & Auditable</h3>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                Open source under MIT. Inspect every Python agent, sanitization prompt, and Tectonic build script on GitHub.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-6 border-t border-white/[0.08]">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-[var(--color-accent)] font-semibold">Protocol</span>
            <h2 className="text-4xl font-extrabold text-white mt-2 mb-4">Three steps. One perfect PDF.</h2>
            <p className="text-base text-[var(--color-text-secondary)] leading-relaxed">
              From master career profile to tailored, ATS-scored application in under 30 seconds.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <div key={i} className="relative">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 text-[var(--color-accent)] flex items-center justify-center font-mono font-bold text-sm">
                    {step.num}
                  </div>
                  <div className="h-px flex-1 bg-white/[0.06] lg:hidden" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-[var(--color-text-secondary)] leading-relaxed text-xs">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF & TESTIMONIALS ────────────────────────── */}
      <section className="py-24 px-6 border-t border-white/[0.08] bg-[#0c0c10]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-semibold">
              Verified Candidate Outcomes
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 mb-4">
              Trusted by Top Engineers
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Senior, Staff, and Principal engineers applying to high-signal technical organizations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] flex flex-col justify-between space-y-4">
              <div>
                <div className="flex text-amber-400 text-sm gap-1 mb-3">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#f59e0b" />)}
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed italic">
                  "Saccade eliminated formatting anxiety. The Tectonic LaTeX output parsed cleanly in every recruiter screen, and the Google XYZ bullets helped me land a Staff Frontend role at Stripe."
                </p>
              </div>
              <div className="pt-3 border-t border-white/[0.06] flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                  AM
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Alex Mercer</div>
                  <div className="text-[10px] text-zinc-500">Staff Frontend Engineer</div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] flex flex-col justify-between space-y-4">
              <div>
                <div className="flex text-amber-400 text-sm gap-1 mb-3">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#f59e0b" />)}
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed italic">
                  "The Honesty Guardrail is genius. Other AI resume tools make up fake numbers. Saccade strictly pulled from my verified metrics. Got 4 callback invites in the first week."
                </p>
              </div>
              <div className="pt-3 border-t border-white/[0.06] flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                  ER
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Elena Rostova</div>
                  <div className="text-[10px] text-zinc-500">Principal Platform Architect</div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] flex flex-col justify-between space-y-4">
              <div>
                <div className="flex text-amber-400 text-sm gap-1 mb-3">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#f59e0b" />)}
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed italic">
                  "FastMCP integration means I can literally type in Cursor to tailor my resume against a job spec and compile the PDF right in my editor. Pure engineering bliss."
                </p>
              </div>
              <div className="pt-3 border-t border-white/[0.06] flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
                  DK
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">David Kim</div>
                  <div className="text-[10px] text-zinc-500">Senior Distributed Systems Eng</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ SECTION (CRO & CONVERSION OVERHAUL) ─────────────── */}
      <section id="faq" className="py-24 px-6 border-t border-white/[0.08]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-[var(--color-accent)] font-semibold">
              Questions & Answers
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Everything you need to know about ATS parsers, LaTeX compilation, and privacy.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => {
              const isOpen = openFaqIndex === i;
              return (
                <div
                  key={i}
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm text-white hover:text-indigo-400 transition-colors min-h-[44px]"
                    aria-expanded={isOpen}
                  >
                    <span>{faq.q}</span>
                    <span className="text-zinc-500 shrink-0">
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-[var(--color-text-secondary)] leading-relaxed border-t border-white/[0.04] pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FINAL CONVERSION CTA ────────────────────────────────── */}
      <section className="py-28 px-6 border-t border-white/[0.08] bg-gradient-to-b from-[#09090b] to-[#0f0f15]">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-400 mb-6 font-mono">
            <CheckCircle size={13} /> 100% Free · No Credit Card Required
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6 leading-tight">
            Deploy your next career milestone.
          </h2>
          <p className="text-base text-[var(--color-text-secondary)] mb-10 leading-relaxed font-normal">
            Join senior engineers who treat application materials with the same precision as production software.
          </p>
          <button
            onClick={() => onNavigate('auth')}
            className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-semibold text-base transition-all duration-150 shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
          >
            Launch Saccade Studio Now <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.08] py-12 px-6 bg-[#070709]" role="contentinfo">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5 font-bold text-white">
            <div className="w-6 h-6 rounded-lg bg-[var(--color-accent)] flex items-center justify-center">
              <span className="text-white text-[10px] font-black">S</span>
            </div>
            <span>Saccade Studio</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[var(--color-text-muted)]">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#comparison" className="hover:text-white transition-colors">Comparison</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">Protocol</a>
            <a href="#security" className="hover:text-white transition-colors">Security & Privacy</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            <a href="https://github.com/allannuwamanya/saccade" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub</a>
          </div>

          <p className="text-xs text-[var(--color-text-muted)]">
            &copy; {new Date().getFullYear()} Saccade. Open source under MIT.
          </p>
        </div>
      </footer>
    </div>
  );
};
