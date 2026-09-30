import React from 'react';
import {
  Code2, FileText, Cpu, ArrowRight, Zap, Target,
  Lock, CheckCircle, Github, ChevronDown,
  Sparkles, Shield, BarChart3
} from 'lucide-react';
import type { Page } from '../App';

interface LandingPageProps {
  onNavigate: (page: Page) => void;
}

const FEATURES = [
  {
    icon: <FileText size={22} className="text-blue-400" />,
    title: 'Tectonic Rendering Engine',
    desc: 'PDF output compiled with Tectonic — the same engine powering academic publishing. Pixel-perfect typography that passes every ATS parser.',
  },
  {
    icon: <Lock size={22} className="text-emerald-400" />,
    title: 'Honesty Guardrail',
    desc: 'Cryptographically anchored to your master profile. The AI cannot hallucinate qualifications you do not have — ever.',
  },
  {
    icon: <Target size={22} className="text-purple-400" />,
    title: 'ATS Compliance Engine',
    desc: 'Automated keyword density scoring, structural validation, and gap analysis against the target job description before you apply.',
  },
  {
    icon: <Cpu size={22} className="text-orange-400" />,
    title: 'FastMCP Agent Core',
    desc: 'Connect your local Claude, Cursor, or any MCP-compatible agent. Build resumes directly from your IDE without opening a browser.',
  },
  {
    icon: <Zap size={22} className="text-yellow-400" />,
    title: 'Multi-Model BYOK',
    desc: 'Bring your own API keys. Use Claude 3.5 Sonnet, GPT-4o, Gemini Pro, or a fully private Ollama instance. Zero vendor lock-in.',
  },
  {
    icon: <Code2 size={22} className="text-indigo-400" />,
    title: 'Live LaTeX Studio',
    desc: 'AI streams tailored LaTeX directly into your editor. Edit any line, recompile with Cmd+Enter, preview the PDF instantly.',
  },
];

const STEPS = [
  {
    num: '01',
    icon: <Sparkles size={20} />,
    title: 'Upload your master profile',
    desc: 'Import your complete career history — PDF resume, LinkedIn export, or paste raw JSON. Saccade extracts every fact, metric, and skill into a structured master profile.',
  },
  {
    num: '02',
    icon: <Target size={20} />,
    title: 'Paste the job description',
    desc: 'Drop in the JD. The AI selects the optimal subset of your experience, maps keywords to your achievements, and checks alignment against ATS requirements.',
  },
  {
    num: '03',
    icon: <BarChart3 size={20} />,
    title: 'Compile a tailored PDF',
    desc: 'One click compiles a professionally typeset LaTeX resume and cover letter. Download both. Your ATS match score is shown before you even open the file.',
  },
];

export const LandingPage = ({ onNavigate }: LandingPageProps) => {
  return (
    <div className="bg-[var(--color-bg)] text-[var(--color-text-primary)]">

      {/* ── NAVBAR ─────────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 h-16 border-b border-white/[0.06] bg-[var(--color-bg)]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between gap-8">
          {/* Logo */}
          <div className="flex items-center gap-2.5 font-semibold text-lg tracking-tight">
            <div className="w-7 h-7 rounded-lg bg-[var(--color-accent)] flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="text-white text-xs font-black">S</span>
            </div>
            <span className="text-white">Saccade</span>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm text-[var(--color-text-secondary)]">
            <a href="#features" className="hover:text-white transition-colors duration-150">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors duration-150">How it works</a>
            <a
              href="https://github.com/allannuwamanya/saccade"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors duration-150 flex items-center gap-1.5"
            >
              <Github size={14} /> GitHub
            </a>
          </nav>

          {/* CTAs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('auth')}
              className="hidden sm:block text-sm font-medium text-[var(--color-text-secondary)] hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
            >
              Sign in
            </button>
            <button
              onClick={() => onNavigate('auth')}
              className="flex items-center gap-1.5 text-sm font-semibold text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] transition-colors px-4 py-2 rounded-lg shadow-lg shadow-indigo-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]"
            >
              Launch Studio <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-16 pb-24 overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px]" aria-hidden="true" />
        {/* Radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" aria-hidden="true" />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-sm text-[var(--color-text-secondary)] mb-8 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Studio is live — free during early access
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.05] mb-6">
            Stop writing resumes.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400">
              Start compiling them.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed">
            Saccade is an AI-native LaTeX resume engine. It tailors your master profile to any job description, compiles a pixel-perfect PDF, and scores your ATS match — all in seconds.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <button
              onClick={() => onNavigate('auth')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-semibold text-base transition-all duration-150 shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
            >
              Create Free Account <ArrowRight size={16} />
            </button>
            <button
              onClick={() => onNavigate('auth')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold text-base transition-all duration-150 backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            >
              Try Demo →
            </button>
          </div>

          {/* Studio preview mockup */}
          <div className="relative mx-auto max-w-4xl">
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-indigo-500/30 via-purple-500/10 to-transparent pointer-events-none z-10" />
            <div className="relative rounded-2xl border border-white/[0.08] bg-[#0f0f12] shadow-2xl shadow-black/60 overflow-hidden">
              {/* Title bar */}
              <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.06] bg-[#0c0c0f]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="px-8 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-xs text-[var(--color-text-muted)]">
                    saccade.studio — Tailoring for Stripe Senior Engineer
                  </div>
                </div>
              </div>

              {/* 3-pane mock */}
              <div className="grid grid-cols-3 h-[280px] text-left">
                {/* Chat pane */}
                <div className="border-r border-white/[0.06] p-4 flex flex-col gap-3 overflow-hidden">
                  <p className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-widest">AI Copilot</p>
                  <div className="flex flex-col gap-2">
                    <div className="self-start bg-white/[0.06] rounded-xl rounded-tl-sm px-3 py-2 text-xs text-[var(--color-text-secondary)] max-w-[90%]">
                      Tailor my resume for Stripe's Senior Frontend Engineer role
                    </div>
                    <div className="self-end bg-indigo-600/20 border border-indigo-500/20 rounded-xl rounded-tr-sm px-3 py-2 text-xs text-indigo-300 max-w-[90%]">
                      Analysing 47 facts from your profile... matching 12 keywords ✓
                    </div>
                    <div className="self-end bg-indigo-600/20 border border-indigo-500/20 rounded-xl rounded-tr-sm px-3 py-2 text-xs text-indigo-300 max-w-[90%]">
                      ATS Match: <strong>94%</strong> · Streaming LaTeX →
                    </div>
                  </div>
                  <div className="mt-auto flex items-center gap-2 border border-white/[0.08] rounded-xl px-3 py-2 bg-white/[0.02]">
                    <div className="flex-1 h-2 bg-white/10 rounded-full" />
                    <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
                      <ArrowRight size={10} className="text-white" />
                    </div>
                  </div>
                </div>

                {/* Editor pane */}
                <div className="border-r border-white/[0.06] p-4 font-mono text-[9px] leading-relaxed text-[var(--color-text-muted)] overflow-hidden">
                  <p className="text-[10px] font-sans font-semibold text-[var(--color-text-muted)] uppercase tracking-widest mb-3">LaTeX Editor</p>
                  <span className="text-purple-400">\documentclass</span>[11pt]<span className="text-yellow-400">{'{'}</span><span className="text-green-400">article</span><span className="text-yellow-400">{'}'}</span><br />
                  <span className="text-purple-400">\usepackage</span><span className="text-yellow-400">{'{'}</span><span className="text-green-400">geometry</span><span className="text-yellow-400">{'}'}</span><br />
                  <br />
                  <span className="text-blue-400">\begin</span><span className="text-yellow-400">{'{'}</span>document<span className="text-yellow-400">{'}'}</span><br />
                  <br />
                  <span className="text-purple-400">\section*</span><span className="text-yellow-400">{'{'}</span><span className="text-white">Alex Mercer</span><span className="text-yellow-400">{'}'}</span><br />
                  <span className="text-[var(--color-text-muted)]">Staff Engineer · TypeScript · React</span><br />
                  <br />
                  <span className="text-purple-400">\subsection*</span><span className="text-yellow-400">{'{'}</span><span className="text-white">Experience</span><span className="text-yellow-400">{'}'}</span><br />
                  <span className="text-purple-400">\textbf</span><span className="text-yellow-400">{'{'}</span><span className="text-orange-300">Acme Corp</span><span className="text-yellow-400">{'}'}</span><br />
                  <span className="text-[var(--color-text-muted)]">Led migration of 3 monoliths...</span>
                  <div className="mt-2 w-1.5 h-4 bg-indigo-400 inline-block animate-pulse" />
                </div>

                {/* PDF pane */}
                <div className="bg-[#f8f8f6] p-5 flex flex-col gap-2 overflow-hidden">
                  <p className="text-[10px] font-sans font-semibold text-zinc-400 uppercase tracking-widest mb-1">PDF Preview</p>
                  <div className="h-4 w-36 bg-zinc-300 rounded mx-auto mb-2" />
                  <div className="space-y-1.5">
                    <div className="h-1.5 w-full bg-zinc-200 rounded" />
                    <div className="h-1.5 w-5/6 bg-zinc-200 rounded" />
                    <div className="h-1.5 w-4/6 bg-zinc-200 rounded" />
                  </div>
                  <div className="h-px bg-zinc-200 my-2" />
                  <div className="h-3 w-24 bg-zinc-300 rounded mb-1" />
                  <div className="space-y-1.5">
                    <div className="h-1.5 w-full bg-zinc-200 rounded" />
                    <div className="h-1.5 w-full bg-zinc-200 rounded" />
                    <div className="h-1.5 w-3/4 bg-zinc-200 rounded" />
                  </div>
                  <div className="h-px bg-zinc-200 my-2" />
                  <div className="h-3 w-20 bg-zinc-300 rounded mb-1" />
                  <div className="flex flex-wrap gap-1">
                    {['React', 'TypeScript', 'GraphQL', 'AWS'].map(s => (
                      <span key={s} className="text-[8px] px-1.5 py-0.5 bg-zinc-100 border border-zinc-200 rounded text-zinc-500">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="mt-16 flex flex-col items-center gap-2 text-[var(--color-text-muted)] animate-bounce">
            <span className="text-xs">Scroll to explore</span>
            <ChevronDown size={16} />
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ──────────────────────────────────────────── */}
      <section className="border-y border-white/[0.06] bg-white/[0.01] py-8">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mb-6">
            Built on technologies used by the world's best engineering teams
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 text-sm font-semibold text-[var(--color-text-muted)]">
            {['Tectonic LaTeX', 'FastMCP', 'Claude 3.5', 'GPT-4o', 'Gemini Pro', 'Ollama'].map(t => (
              <span key={t} className="opacity-50 hover:opacity-80 transition-opacity">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────────── */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-16">
            <p className="text-sm font-semibold text-[var(--color-accent)] uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-4xl font-bold text-white mb-4">
              Engineering-grade application pipeline
            </h2>
            <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed">
              Stop fighting word processors. Your resume is structured data. Treat it that way.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="group relative p-6 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-200"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <div className="relative">
                  <div className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-5">
                    {f.icon}
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────── */}
      <section id="how-it-works" className="py-32 px-6 border-t border-white/[0.06] bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-20">
            <p className="text-sm font-semibold text-[var(--color-accent)] uppercase tracking-widest mb-3">Protocol</p>
            <h2 className="text-4xl font-bold text-white mb-4">Three steps. One perfect PDF.</h2>
            <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed">
              From master profile to tailored, ATS-scored application in under 30 seconds.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <div key={i} className="relative">
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-full w-full h-px bg-gradient-to-r from-white/10 to-transparent -z-10" />
                )}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 text-[var(--color-accent)] flex items-center justify-center font-mono font-bold text-sm">
                    {step.num}
                  </div>
                  <div className="h-px flex-1 bg-white/[0.06] lg:hidden" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                <p className="text-[var(--color-text-secondary)] leading-relaxed text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ───────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.02] p-10 text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 via-transparent to-purple-600/5 pointer-events-none" />
            <div className="relative">
              <div className="flex justify-center text-yellow-400 text-lg mb-6 gap-1">
                {[...Array(5)].map((_, i) => <span key={i}>★</span>)}
              </div>
              <blockquote className="text-xl sm:text-2xl font-medium text-white mb-8 leading-relaxed max-w-2xl mx-auto">
                "Saccade changed how I apply for roles. No more word processor formatting nightmares — just clean, structured PDFs that actually get past the screeners."
              </blockquote>
              <div className="flex items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                  AM
                </div>
                <div className="text-left">
                  <div className="font-semibold text-white">Alex Mercer</div>
                  <div className="text-sm text-[var(--color-text-muted)]">Staff Software Engineer</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ──────────────────────────────────────────── */}
      <section className="py-32 px-6 border-t border-white/[0.06] bg-white/[0.01]">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 text-sm text-[var(--color-accent)] mb-8">
            <CheckCircle size={14} /> Free during early access
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6 leading-tight">
            Your next role starts with a better resume.
          </h2>
          <p className="text-lg text-[var(--color-text-secondary)] mb-10 leading-relaxed">
            Join the engineers who treat career progression like a production deployment.
          </p>
          <button
            onClick={() => onNavigate('auth')}
            className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-semibold text-lg transition-all duration-150 shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]"
          >
            Get started for free <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] py-12 px-6 bg-[var(--color-bg)]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 font-semibold text-white">
            <div className="w-6 h-6 rounded-lg bg-[var(--color-accent)] flex items-center justify-center">
              <span className="text-white text-[10px] font-black">S</span>
            </div>
            Saccade
          </div>
          <div className="flex items-center gap-6 text-sm text-[var(--color-text-muted)]">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            <a href="https://github.com/allannuwamanya/saccade" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub</a>
          </div>
          <p className="text-sm text-[var(--color-text-muted)]">
            &copy; {new Date().getFullYear()} Saccade. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
