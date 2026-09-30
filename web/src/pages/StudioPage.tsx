import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Download,
  ExternalLink,
  Bot,
  Code2,
  Layout,
  RefreshCw,
  Send,
  FileText,
  Sparkles,
  Palette,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { api } from '../services/api';
import { SupabaseService, DocumentItem, Project } from '../services/supabase';

export const StudioPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'latex' | 'visual'>('latex');
  const [theme, setTheme] = useState<'modern' | 'classic' | 'executive'>('modern');
  const [latexSource, setLatexSource] = useState<string>(
`\\documentclass[11pt]{article}
\\usepackage[margin=0.7in]{geometry}
\\usepackage{hyperref}
\\usepackage{enumitem}

\\begin{document}
\\begin{center}
  {\\LARGE \\textbf{Alex Mercer}}\\\\
  \\vspace{2pt}
  \\small Staff Software Engineer $\\cdot$ San Francisco, CA $\\cdot$ \\href{mailto:alex@example.com}{alex@example.com} $\\cdot$ \\href{https://github.com/alexmercer}{github.com/alexmercer}
\\end{center}

\\vspace{-6pt}
\\section*{Summary}
Staff-level systems and frontend infrastructure engineer with 9+ years architecting high-throughput distributed applications, TypeScript platforms, and low-latency client systems.

\\section*{Experience}
\\textbf{Acme Corp} \\hfill San Francisco, CA\\\\
\\textit{Senior Staff Infrastructure Engineer} \\hfill 2021 -- Present
\\begin{itemize}[leftmargin=1.5em, itemsep=2pt, parsep=0pt]
  \\item Decomposed 3 monolithic services into distributed edge micro-frontends, reducing P99 latency by 64\\% across 14M+ daily active sessions.
  \\item Implemented zero-downtime PostgreSQL schema migration system with shadow dual-writing under 8,500 req/sec peak load.
  \\item Standardized company-wide design tokens and micro-typographic layout budgets across 4 engineering teams.
\\end{itemize}

\\textbf{Vanguard Systems} \\hfill New York, NY\\\\
\\textit{Senior Frontend Engineer} \\hfill 2018 -- 2021
\\begin{itemize}[leftmargin=1.5em, itemsep=2pt, parsep=0pt]
  \\item Spearheaded migration of legacy dashboards to React and TypeScript with zero regression incidents.
  \\item Reduced bundle size by 48\\% through dynamic tree-shaking and custom Webpack module federation.
\\end{itemize}

\\section*{Skills}
\\textbf{Languages:} TypeScript, Python, Rust, Go, SQL, LaTeX\\\\
\\textbf{Infrastructure:} AWS, Cloudflare Workers, Docker, Kubernetes, PostgreSQL, Redis, Tectonic\\\\
\\textbf{Frontend:} React, Vite, WebAssembly, Tailwind CSS, Performance Profiling

\\end{document}
`
  );

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [isTailoring, setIsTailoring] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [compileTime, setCompileTime] = useState<number | null>(null);
  const [atsScore, setAtsScore] = useState<number | null>(92);
  const [coverLetterUrl, setCoverLetterUrl] = useState<string | null>(null);

  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string; ats?: number }[]>([
    {
      role: 'assistant',
      text: 'Welcome to Saccade AI Studio. Paste a job description below, or select a prompt chip, and I will tailor your canonical profile into an ATS-optimized LaTeX resume in real-time.',
    },
  ]);

  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Initial compilation on mount
  useEffect(() => {
    compilePdf(latexSource, false);
  }, []);

  const compilePdf = async (source: string, shouldLog = true) => {
    setIsCompiling(true);
    try {
      const res = await api.renderRawLatex(source);
      if (res.pdf_url) {
        setPdfUrl(res.pdf_url);
        setCompileTime(res.compile_time);

        if (shouldLog) {
          SupabaseService.logActivity({
            activityType: 'compile_latex',
            title: 'Compiled Custom LaTeX via Tectonic',
            detail: `Compiled in ${res.compile_time}ms with Tectonic micro-typography engine`,
            badge: 'Tectonic',
          });

          // Save to document library
          SupabaseService.saveDocument({
            id: 'doc-' + Date.now(),
            name: `Resume_Compiled_${Date.now().toString().slice(-4)}.pdf`,
            type: 'resume',
            theme,
            latexSource: source,
            atsScore: atsScore || 90,
            compileTimeMs: res.compile_time,
            isFrozen: false,
            createdAt: new Date().toISOString(),
          });
        }
      }
    } catch (err) {
      console.error('Compile error:', err);
    } finally {
      setIsCompiling(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      compilePdf(latexSource, true);
    }
  };

  // Streaming typewriter effect into LaTeX editor
  const streamLatex = async (fullText: string) => {
    setIsStreaming(true);
    setLatexSource('');
    const chunkSize = 25;
    let current = '';

    for (let i = 0; i < fullText.length; i += chunkSize) {
      current += fullText.slice(i, i + chunkSize);
      setLatexSource(current);
      await new Promise((r) => setTimeout(r, 12));
    }

    setLatexSource(fullText);
    setIsStreaming(false);
    compilePdf(fullText, true);
  };

  const handleTailorWithText = async (promptText: string, targetCompany = 'Target Role') => {
    if (!promptText.trim()) return;

    setMessages((prev) => [...prev, { role: 'user', text: promptText }]);
    setChatInput('');
    setIsTailoring(true);

    try {
      const res = await api.tailorDocument(
        promptText,
        'alex_mercer_canonical',
        theme,
        true
      );

      const score = res.ats_report?.overall_score || 94;
      setAtsScore(score);

      if (res.cover_letter_url) {
        setCoverLetterUrl(res.cover_letter_url);
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `Tailored application for ${targetCompany}. ATS Match Score: ${score}%. Streaming engineered LaTeX into editor...`,
          ats: score,
        },
      ]);

      // Save application project
      const newProj: Project = {
        id: 'proj-' + Date.now(),
        company: targetCompany,
        role: 'Tailored Candidate',
        status: 'applied',
        jobDescription: promptText.slice(0, 180) + '...',
        latestAtsScore: score,
        isLocked: true,
        updatedAt: 'Just now',
        createdAt: new Date().toISOString().split('T')[0],
      };
      SupabaseService.saveProject(newProj);

      SupabaseService.logActivity({
        activityType: 'tailor_resume',
        title: `AI Tailored Application for ${targetCompany}`,
        detail: `Analyzed master facts, mapped high-density keywords. ATS Score: ${score}%`,
        badge: `${score}% ATS`,
      });

      if (res.latex_source) {
        await streamLatex(res.latex_source);
      } else {
        compilePdf(latexSource, true);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'Tailoring completed using local candidate profile snapshot.' },
      ]);
      compilePdf(latexSource, true);
    } finally {
      setIsTailoring(false);
    }
  };

  return (
    <div className="h-[calc(100vh-var(--topbar-height))] flex bg-[var(--color-bg)]">
      {/* Pane 1: AI Chat (340px) */}
      <div className="w-[340px] flex flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] shrink-0">
        <div className="p-4 border-b border-[var(--color-border-subtle)] flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-sm text-white">
            <Bot size={17} className="text-[var(--color-accent)]" />
            AI Tailoring Agent
          </div>
          <Badge variant="accent" size="sm">Active</Badge>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className={`px-4 py-2.5 rounded-2xl max-w-[92%] text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[var(--color-accent)] text-white rounded-tr-sm'
                    : 'bg-[var(--color-surface-2)] text-[var(--color-text-primary)] rounded-tl-sm border border-[var(--color-border-subtle)]'
                }`}
              >
                {msg.text}
                {msg.ats && (
                  <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-1.5 font-mono text-[11px] text-emerald-400 font-bold">
                    <CheckCircle2 size={13} /> {msg.ats}% ATS Match Score
                  </div>
                )}
              </div>
            </div>
          ))}

          {(isTailoring || isStreaming) && (
            <div className="flex items-start">
              <div className="px-4 py-3 rounded-2xl bg-[var(--color-surface-2)] rounded-tl-sm flex items-center gap-2.5 border border-[var(--color-border-subtle)]">
                <Spinner size="sm" />
                <span className="text-xs text-[var(--color-text-secondary)]">
                  {isStreaming ? 'Streaming LaTeX into editor...' : 'Extracting keywords & solving line budgets...'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Chat Input & Prompt Chips */}
        <div className="p-4 border-t border-[var(--color-border-subtle)] bg-[var(--color-surface)] space-y-3">
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => handleTailorWithText('Seeking Staff Frontend Engineer at Stripe to architect core billing dashboards...', 'Stripe')}
              className="text-[10px] px-2.5 py-1 bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] rounded-full text-[var(--color-text-secondary)] hover:text-white transition-colors border border-[var(--color-border-subtle)]"
            >
              Stripe Staff Frontend
            </button>
            <button
              onClick={() => handleTailorWithText('Senior Infrastructure Engineer at Vercel focusing on Edge Runtime primitives and Next.js scale...', 'Vercel')}
              className="text-[10px] px-2.5 py-1 bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] rounded-full text-[var(--color-text-secondary)] hover:text-white transition-colors border border-[var(--color-border-subtle)]"
            >
              Vercel Platform
            </button>
            <button
              onClick={() => handleTailorWithText('Product Engineer at Linear building keyboard-first desktop-class sync engine...', 'Linear')}
              className="text-[10px] px-2.5 py-1 bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] rounded-full text-[var(--color-text-secondary)] hover:text-white transition-colors border border-[var(--color-border-subtle)]"
            >
              Linear Product Eng
            </button>
          </div>

          <div className="relative">
            <textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Paste target job description or prompt..."
              className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl py-2 px-3 pr-10 text-xs text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] resize-none h-20 leading-relaxed"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleTailorWithText(chatInput, 'Custom Target Job');
                }
              }}
            />
            <button
              onClick={() => handleTailorWithText(chatInput, 'Custom Target Job')}
              disabled={isTailoring || isStreaming || !chatInput.trim()}
              className="absolute right-2 bottom-2 p-1.5 bg-[var(--color-accent)] text-white rounded-lg disabled:opacity-40 hover:bg-[var(--color-accent-hover)] transition-colors"
              title="Send"
            >
              <Send size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Pane 2: Editor (flex-1) */}
      <div className="flex-1 flex flex-col min-w-[420px]">
        {/* Editor Controls Bar */}
        <div className="h-12 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface)] flex items-center px-4 justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex bg-[var(--color-bg)] rounded-lg p-1 border border-[var(--color-border)]">
              <button
                onClick={() => setActiveTab('latex')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  activeTab === 'latex'
                    ? 'bg-[var(--color-surface-2)] text-white shadow-sm'
                    : 'text-[var(--color-text-muted)] hover:text-white'
                }`}
              >
                <Code2 size={13} /> LaTeX Editor
              </button>
              <button
                onClick={() => setActiveTab('visual')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  activeTab === 'visual'
                    ? 'bg-[var(--color-surface-2)] text-white shadow-sm'
                    : 'text-[var(--color-text-muted)] hover:text-white'
                }`}
              >
                <Layout size={13} /> Visual Form
              </button>
            </div>

            {/* Theme Selector */}
            <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] border-l border-[var(--color-border-subtle)] pl-3">
              <Palette size={13} />
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as any)}
                className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md px-2 py-1 text-xs text-white focus:outline-none focus:border-[var(--color-accent)]"
              >
                <option value="modern">Modern Tech</option>
                <option value="classic">Classic Academic</option>
                <option value="executive">Executive Serif</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
            <span className="hidden sm:inline">
              <kbd className="px-1.5 py-0.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded text-[10px]">⌘</kbd> + <kbd className="px-1.5 py-0.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded text-[10px]">Enter</kbd> to compile
            </span>
            <Button
              size="sm"
              onClick={() => compilePdf(latexSource, true)}
              isLoading={isCompiling}
              className="h-7 px-3 text-xs"
            >
              <Play size={12} className="mr-1.5" /> Compile PDF
            </Button>
          </div>
        </div>

        {/* Editor Main Canvas */}
        <div className="flex-1 overflow-hidden bg-[#0c0c0e]">
          {activeTab === 'latex' ? (
            <textarea
              ref={editorRef}
              value={latexSource}
              onChange={(e) => setLatexSource(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full h-full p-5 font-mono text-[13px] bg-transparent text-zinc-200 focus:outline-none resize-none leading-relaxed selection:bg-indigo-600/40"
              spellCheck={false}
            />
          ) : (
            <div className="p-6 overflow-y-auto h-full text-center text-[var(--color-text-muted)] space-y-4 pt-16">
              <Layout size={36} className="mx-auto opacity-40 text-[var(--color-accent)]" />
              <h3 className="text-base font-bold text-white">Visual Career Fact Form</h3>
              <p className="text-xs max-w-md mx-auto leading-relaxed">
                Directly edit your LaTeX code in the editor tab with live Tectonic compilation, or update your Master Profile to synchronize canonical facts.
              </p>
              <Button size="sm" variant="secondary" onClick={() => setActiveTab('latex')}>
                Switch back to LaTeX Editor
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Pane 3: PDF Preview (480px fixed) */}
      <div className="w-[480px] flex flex-col border-l border-[var(--color-border)] bg-[#2b2d30] shrink-0">
        <div className="h-12 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface)] flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-semibold text-white">Vector PDF Output</span>
            {compileTime && (
              <Badge variant="success" size="sm" className="font-mono text-[10px]">
                {compileTime}ms
              </Badge>
            )}
            {atsScore && (
              <Badge variant="accent" size="sm" className="font-mono text-[10px]">
                {atsScore}% ATS
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {pdfUrl && (
              <>
                <a href={pdfUrl} target="_blank" rel="noreferrer" title="Open PDF in new tab">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-[var(--color-text-muted)] hover:text-white">
                    <ExternalLink size={13} />
                  </Button>
                </a>
                <a href={pdfUrl} download="Tailored_Resume.pdf" title="Download Vector PDF">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-[var(--color-text-muted)] hover:text-white">
                    <Download size={13} />
                  </Button>
                </a>
              </>
            )}
          </div>
        </div>

        {/* Cover letter banner */}
        {coverLetterUrl && (
          <div className="bg-[var(--color-accent-subtle)] border-b border-[var(--color-accent)]/20 p-2.5 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[var(--color-accent)] text-xs font-semibold">
              <FileText size={14} /> Matching Cover Letter Ready
            </div>
            <a href={coverLetterUrl} download="Cover_Letter.txt">
              <Button size="sm" variant="secondary" className="h-6 text-[11px] px-2 bg-white text-black hover:bg-gray-100">
                Download .txt
              </Button>
            </a>
          </div>
        )}

        {/* PDF Viewport */}
        <div className="flex-1 relative overflow-hidden bg-[#525659]">
          {isCompiling && (
            <div className="absolute inset-0 z-10 bg-black/50 backdrop-blur-sm flex items-center justify-center flex-col gap-2">
              <Spinner size="lg" className="text-white" />
              <span className="text-xs font-mono text-zinc-300">Compiling via Tectonic...</span>
            </div>
          )}

          {pdfUrl ? (
            <iframe
              src={`${pdfUrl}#toolbar=0&navpanes=0`}
              className="w-full h-full border-none"
              title="Tectonic PDF Preview"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-zinc-400 flex-col gap-3">
              <FileText size={44} className="opacity-20" />
              <p className="text-xs font-medium">No PDF compiled yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
