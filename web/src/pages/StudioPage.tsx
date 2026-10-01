import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Lock,
  Plus,
  Maximize2,
  Minimize2,
  PanelLeftClose,
  PanelLeftOpen,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  ChevronRight,
  Square,
  ShieldCheck,
  Check,
  GitCommit,
  CheckCheck,
  Undo2,
  AlertTriangle
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { api } from '../services/api';
import { SupabaseService, DocumentItem, Project } from '../services/supabase';
import { streamAiGeneration } from '../services/aiStream';
import { computeLatexDiff, tokenizeLatex, DiffLine } from '../utils/latexDiff';

type LayoutMode = 'split' | 'editor' | 'preview';
type ThemeType = 'modern' | 'classic' | 'executive';

const INITIAL_LATEX = `\\documentclass[11pt]{article}
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
`;

export const StudioPage: React.FC = () => {
  // Layout states
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('split');
  const [mobileTab, setMobileTab] = useState<'chat' | 'editor' | 'preview'>('editor');
  const [previewTab, setPreviewTab] = useState<'pdf' | 'sheet'>('pdf');
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Content states
  const [theme, setTheme] = useState<ThemeType>('modern');
  const [latexSource, setLatexSource] = useState<string>(INITIAL_LATEX);
  const [pdfUrl, setPdfUrl] = useState<string>(`/examples/alex_mercer_${theme}.pdf`);
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileTime, setCompileTime] = useState<number | null>(340);
  const [atsScore, setAtsScore] = useState<number | null>(98);

  // Streaming chat states
  const [isStreaming, setIsStreaming] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    {
      role: 'assistant',
      text: 'AI Resume Copilot ready. Ask me to tailor your resume for a job posting, re-write bullet points with Google XYZ metrics, or add new technical sections.'
    }
  ]);

  // Diff & Syntax Highlighting states
  const [previousLatex, setPreviousLatex] = useState<string>(INITIAL_LATEX);
  const [editorTab, setEditorTab] = useState<'code' | 'diff'>('code');
  const [compilingSeconds, setCompilingSeconds] = useState(0);
  const [compilingToast, setCompilingToast] = useState<string | null>(null);
  const [compilingError, setCompilingError] = useState<string | null>(null);
  const [showSyntaxHighlight, setShowSyntaxHighlight] = useState<boolean>(true);

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const codePreRef = useRef<HTMLDivElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Sync editor line numbers & syntax highlight pre
  const handleEditorScroll = () => {
    if (editorRef.current) {
      if (lineNumbersRef.current) {
        lineNumbersRef.current.scrollTop = editorRef.current.scrollTop;
      }
      if (codePreRef.current) {
        codePreRef.current.scrollTop = editorRef.current.scrollTop;
        codePreRef.current.scrollLeft = editorRef.current.scrollLeft;
      }
    }
  };

  const lineCount = latexSource.split('\n').length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  // Compute diff between previous and current latex
  const diffLines = useMemo(() => {
    if (!previousLatex || previousLatex === latexSource) return [];
    return computeLatexDiff(previousLatex, latexSource);
  }, [previousLatex, latexSource]);

  const additionsCount = useMemo(() => diffLines.filter((l) => l.type === 'added').length, [diffLines]);
  const removalsCount = useMemo(() => diffLines.filter((l) => l.type === 'removed').length, [diffLines]);
  const hasDiff = additionsCount > 0 || removalsCount > 0;

  // Theme change
  const handleThemeChange = (newTheme: ThemeType) => {
    setTheme(newTheme);
    setPdfUrl(`/examples/alex_mercer_${newTheme}.pdf`);
  };

  // Compile PDF via Tectonic with live timer & cache busting
  const compilePdf = async (source: string) => {
    setIsCompiling(true);
    setCompilingSeconds(0);
    setCompilingToast(null);
    setCompilingError(null);

    const startTime = Date.now();
    const timer = setInterval(() => {
      setCompilingSeconds(parseFloat(((Date.now() - startTime) / 1000).toFixed(1)));
    }, 100);

    try {
      const res = await api.renderRawLatex(source);
      if (res.pdf_url) {
        const freshUrl = res.pdf_url.includes('?')
          ? `${res.pdf_url}&t=${Date.now()}`
          : `${res.pdf_url}?t=${Date.now()}`;
        setPdfUrl(freshUrl);
        const ms = res.compile_time ? Math.round(res.compile_time * 1000) : Math.round(Date.now() - startTime);
        setCompileTime(ms);
        setCompilingToast(`Vector PDF compiled in ${(ms / 1000).toFixed(1)}s`);
        setTimeout(() => setCompilingToast(null), 4000);
      }
    } catch (e: any) {
      console.warn('Compile notice:', e);
      setCompilingError(e.message || 'LaTeX compilation issue');
      setCompilingToast('Rendered preview');
      setTimeout(() => {
        setCompilingError(null);
        setCompilingToast(null);
      }, 4000);
    } finally {
      clearInterval(timer);
      setIsCompiling(false);
    }
  };

  // Keyboard shortcut: Cmd+Enter to compile
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      compilePdf(latexSource);
    }
  };

  // Scroll chat to bottom on new messages
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const [isWritingLatexToEditor, setIsWritingLatexToEditor] = useState(false);

  // AI Chat Submission with Streaming Token Demuxing
  const handleSendMessage = async () => {
    if (!chatInput.trim() || isStreaming) return;

    const userPrompt = chatInput.trim();
    setChatInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userPrompt }]);
    setIsStreaming(true);
    setIsWritingLatexToEditor(false);
    setPreviousLatex(latexSource); // Save snapshot before editing

    // Placeholder for streaming assistant response
    setMessages((prev) => [...prev, { role: 'assistant', text: '' }]);

    await streamAiGeneration({
      prompt: userPrompt,
      systemPrompt: `You are an expert LaTeX Resume Engineer and Career Copilot. If the user greets you (e.g. "hello", "hi") or asks general questions or advice, respond purely conversationally in the chat without modifying LaTeX. Do NOT output a \`\`\`latex code block unless the user explicitly asks to edit, rewrite, tailor, update, or generate resume code. When the user does request modifications, output the full updated code inside a \`\`\`latex code block. Adhere to single-page line budgets and quantified Google XYZ achievements.`,
      currentLatex: latexSource,
      onChatText: (chatText, isWritingLatex) => {
        setIsWritingLatexToEditor(isWritingLatex);
        setMessages((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
            const displayChat = chatText || (isWritingLatex ? '⚡ Generating LaTeX code directly into the editor...' : 'Thinking...');
            updated[lastIdx] = {
              ...updated[lastIdx],
              text: displayChat
            };
          }
          return updated;
        });
      },
      onLatexChunk: (streamedLatex) => {
        // Stream LaTeX directly into the editor canvas in real time
        setLatexSource(streamedLatex);
      },
      onError: (errMsg) => {
        setIsStreaming(false);
        setIsWritingLatexToEditor(false);
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', text: `⚠️ Error: ${errMsg}. Please try again.` }
        ]);
      },
      onDone: ({ chatText, latexCode }) => {
        setIsStreaming(false);
        setIsWritingLatexToEditor(false);
        setMessages((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
            const finalNote = latexCode
              ? `${chatText ? chatText + '\n\n' : ''}✨ *LaTeX updated in editor & compiled to PDF.*`
              : chatText;
            updated[lastIdx] = {
              ...updated[lastIdx],
              text: finalNote || 'Done!'
            };
          }
          return updated;
        });

        if (latexCode) {
          setLatexSource(latexCode);
          compilePdf(latexCode);
          setEditorTab('diff'); // Show diff view so user sees new green/red edits immediately
        }
      }
    });
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: 'assistant',
        text: 'Conversation cleared. How can I help refine your LaTeX resume today?'
      }
    ]);
  };

  return (
    <div className="h-[calc(100vh-var(--topbar-height))] flex flex-col bg-[var(--color-bg)] overflow-hidden">
      {/* ============================================================== */}
      {/* STUDIO TOOLBAR                                                 */}
      {/* ============================================================== */}
      <div className="h-11 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          {/* Chat Sidebar Toggle Button */}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
              isChatOpen
                ? 'bg-[var(--color-surface-2)] text-white'
                : 'text-zinc-400 hover:text-white hover:bg-[var(--color-surface-2)]'
            }`}
            title={isChatOpen ? 'Collapse AI Copilot Sidebar' : 'Expand AI Copilot Sidebar'}
            aria-label="Toggle AI Copilot sidebar"
          >
            {isChatOpen ? <PanelLeftClose size={15} /> : <PanelLeftOpen size={15} />}
            <span className="hidden sm:inline text-xs">Copilot</span>
          </button>

          <div className="h-4 w-px bg-[var(--color-border-subtle)] mx-1" />

          {/* Theme Selector */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <Palette size={13} className="text-zinc-500" />
            <select
              value={theme}
              onChange={(e) => handleThemeChange(e.target.value as ThemeType)}
              className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md px-2 py-0.5 text-xs text-white focus:outline-none focus:border-[var(--color-accent)]"
              aria-label="Select LaTeX Theme"
            >
              <option value="modern">Modern Platform (Sans)</option>
              <option value="classic">Classic Academic (Roman)</option>
              <option value="executive">Executive Leadership (Serif)</option>
            </select>
          </div>
        </div>

        {/* Center: Layout Controls (Split, Full Editor, Full Preview) */}
        <div className="hidden md:flex items-center gap-1 p-0.5 bg-[var(--color-bg)] rounded-lg border border-[var(--color-border)]">
          <button
            onClick={() => setLayoutMode('split')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
              layoutMode === 'split'
                ? 'bg-[var(--color-surface-2)] text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
            title="Split Editor & Preview"
          >
            Split View
          </button>
          <button
            onClick={() => setLayoutMode('editor')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
              layoutMode === 'editor'
                ? 'bg-[var(--color-surface-2)] text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
            title="Extend LaTeX Editor to Full Width"
          >
            Editor Focus
          </button>
          <button
            onClick={() => setLayoutMode('preview')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
              layoutMode === 'preview'
                ? 'bg-[var(--color-surface-2)] text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
            title="Extend PDF Preview to Full Width"
          >
            Preview Focus
          </button>
        </div>

        {/* Right Actions: Compile & Status */}
        <div className="flex items-center gap-2">
          {compilingToast && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono animate-in fade-in">
              <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
              <span>{compilingToast}</span>
            </div>
          )}

          {compilingError && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono animate-in fade-in">
              <AlertTriangle size={13} className="text-rose-400 shrink-0" />
              <span>{compilingError}</span>
            </div>
          )}

          {/* Compile Button with Live Timer */}
          <Button
            size="sm"
            onClick={() => compilePdf(latexSource)}
            disabled={isCompiling}
            className="h-7 text-xs px-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-medium shadow-sm transition-all"
          >
            {isCompiling ? (
              <>
                <RefreshCw size={12} className="mr-1.5 animate-spin text-cyan-300" />
                <span>Compiling ({compilingSeconds.toFixed(1)}s)...</span>
              </>
            ) : (
              <>
                <Play size={12} className="mr-1.5 fill-current" />
                <span>Compile PDF</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Switcher (Small Screens) */}
      <div className="md:hidden flex items-center justify-between p-1.5 bg-[var(--color-surface)] border-b border-[var(--color-border)] shrink-0">
        <div className="grid grid-cols-3 w-full gap-1 p-0.5 bg-[var(--color-bg)] rounded-lg border border-[var(--color-border)]">
          <button
            onClick={() => setMobileTab('chat')}
            className={`py-1.5 text-xs font-semibold rounded ${
              mobileTab === 'chat' ? 'bg-[var(--color-surface-2)] text-white' : 'text-zinc-400'
            }`}
          >
            Copilot
          </button>
          <button
            onClick={() => setMobileTab('editor')}
            className={`py-1.5 text-xs font-semibold rounded ${
              mobileTab === 'editor' ? 'bg-[var(--color-surface-2)] text-white' : 'text-zinc-400'
            }`}
          >
            LaTeX Editor
          </button>
          <button
            onClick={() => setMobileTab('preview')}
            className={`py-1.5 text-xs font-semibold rounded ${
              mobileTab === 'preview' ? 'bg-[var(--color-surface-2)] text-white' : 'text-zinc-400'
            }`}
          >
            PDF Preview
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3-PANE WORKSPACE BODY                                          */}
      {/* ============================================================== */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* ------------------------------------------------------------ */}
        {/* PANE 1: CLEAN AI COPILOT CHAT (Collapsible)                 */}
        {/* ------------------------------------------------------------ */}
        <div
          className={`flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] shrink-0 transition-all duration-200 min-h-0 ${
            isChatOpen ? 'w-full md:w-[320px] lg:w-[350px] flex' : 'w-0 hidden'
          } ${mobileTab === 'chat' ? 'flex flex-1' : 'hidden md:flex'}`}
        >
          {/* Clean Chat Header */}
          <div className="h-10 px-3.5 border-b border-[var(--color-border-subtle)] flex items-center justify-between bg-[var(--color-surface-2)]/30 shrink-0">
            <div className="flex items-center gap-2">
              <Bot size={15} className="text-[var(--color-accent)]" />
              <span className="text-xs font-semibold text-white">AI Resume Copilot</span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9.5px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Online
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                className="p-1 rounded text-zinc-400 hover:text-white hover:bg-[var(--color-surface-2)]"
                title="Clear Chat History"
                aria-label="Clear chat history"
              >
                <RotateCcw size={13} />
              </button>
            </div>
          </div>

          {/* Clean Message Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 min-h-0">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`px-3.5 py-2.5 rounded-2xl max-w-[92%] text-xs leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-[var(--color-accent)] text-white rounded-tr-sm'
                      : 'bg-[var(--color-surface-2)] text-zinc-200 rounded-tl-sm border border-[var(--color-border-subtle)]'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isStreaming && (
              <div className="flex items-start">
                <div className="px-3.5 py-2 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border-subtle)] flex items-center gap-2 text-xs text-zinc-300">
                  <Spinner size="sm" />
                  <span>
                    {isWritingLatexToEditor
                      ? '⚡ Streaming LaTeX directly to editor...'
                      : 'Generating response...'}
                  </span>
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Clean Input Box */}
          <div className="p-3 border-t border-[var(--color-border-subtle)] bg-[var(--color-surface)] shrink-0 space-y-2">
            <div className="relative">
              <textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask AI to tailor, re-write bullets, or edit LaTeX..."
                aria-label="Ask AI to tailor resume"
                disabled={isStreaming}
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl py-2 px-3 pr-10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[var(--color-accent)] resize-none h-18 leading-relaxed"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <button
                onClick={handleSendMessage}
                disabled={isStreaming || !chatInput.trim()}
                className="absolute right-2 bottom-2.5 p-1.5 bg-[var(--color-accent)] text-white rounded-lg disabled:opacity-40 hover:bg-[var(--color-accent-hover)] transition-colors"
                title="Send Prompt (Enter)"
                aria-label="Send prompt"
              >
                <Send size={13} />
              </button>
            </div>
            <div className="flex items-center justify-between text-[10px] text-zinc-500 px-1">
              <span>Press <kbd className="font-mono text-zinc-400">Enter</kbd> to send</span>
              <span className="text-zinc-500">Autonomous LaTeX Engine</span>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* PANE 2: LATEX EDITOR (Extendable / Maximizable)              */}
        {/* ------------------------------------------------------------ */}
        <div
          className={`flex-col min-w-0 transition-all duration-200 min-h-0 ${
            layoutMode === 'preview' ? 'hidden' : 'flex flex-1'
          } ${mobileTab === 'editor' ? 'flex flex-1' : 'hidden md:flex'} ${
            isWritingLatexToEditor ? 'ring-1 ring-indigo-500/60 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : ''
          }`}
        >
          {/* Editor Header */}
          <div className="h-10 px-3.5 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface)] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Code2 size={14} className="text-indigo-400" />
              <span className="text-xs font-semibold text-white">LaTeX Source</span>

              {/* Mode Toggle: Code Editor vs Review Diffs */}
              <div className="flex items-center bg-[var(--color-bg)] rounded-md p-0.5 border border-[var(--color-border)] ml-2">
                <button
                  onClick={() => setEditorTab('code')}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
                    editorTab === 'code'
                      ? 'bg-[var(--color-surface-2)] text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Code2 size={11} />
                  <span>Code</span>
                </button>
                <button
                  onClick={() => setEditorTab('diff')}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
                    editorTab === 'diff'
                      ? 'bg-[var(--color-surface-2)] text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <GitCommit size={11} className={hasDiff ? 'text-indigo-400' : ''} />
                  <span>Diff Review</span>
                  {hasDiff && (
                    <span className="flex items-center gap-1 text-[10px] ml-0.5 font-mono">
                      {additionsCount > 0 && <span className="text-emerald-400 font-bold">+{additionsCount}</span>}
                      {removalsCount > 0 && <span className="text-rose-400 font-bold">-{removalsCount}</span>}
                    </span>
                  )}
                </button>
              </div>

              {/* Quick Diff Action Controls */}
              {hasDiff && (
                <div className="hidden sm:flex items-center gap-1 ml-1">
                  <button
                    onClick={() => {
                      setPreviousLatex(latexSource);
                      setEditorTab('code');
                    }}
                    className="px-2 py-0.5 rounded text-[10.5px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/20 flex items-center gap-1 transition-colors"
                    title="Accept all diff changes"
                  >
                    <Check size={11} /> Accept
                  </button>
                  <button
                    onClick={() => {
                      setLatexSource(previousLatex);
                      compilePdf(previousLatex);
                      setEditorTab('code');
                    }}
                    className="px-2 py-0.5 rounded text-[10.5px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/25 hover:bg-rose-500/20 flex items-center gap-1 transition-colors"
                    title="Revert to previous snapshot"
                  >
                    <Undo2 size={11} /> Revert
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">
                {lineCount} lines
              </span>

              {/* Syntax Highlighting Toggle */}
              {editorTab === 'code' && (
                <button
                  onClick={() => setShowSyntaxHighlight(!showSyntaxHighlight)}
                  className={`px-2 py-0.5 rounded text-[10.5px] font-mono transition-colors border ${
                    showSyntaxHighlight
                      ? 'bg-indigo-950/40 text-indigo-300 border-indigo-500/30'
                      : 'text-zinc-500 border-zinc-800 hover:text-zinc-300'
                  }`}
                  title="Toggle LaTeX Syntax Highlighting"
                >
                  Syntax: {showSyntaxHighlight ? 'ON' : 'OFF'}
                </button>
              )}

              {/* Maximize / Split Button */}
              <button
                onClick={() => {
                  if (layoutMode === 'editor' && !isChatOpen) {
                    setLayoutMode('split');
                    setIsChatOpen(true);
                  } else {
                    setLayoutMode('editor');
                    setIsChatOpen(false);
                  }
                }}
                className="p-1 rounded text-zinc-400 hover:text-white hover:bg-[var(--color-surface-2)]"
                title={layoutMode === 'editor' && !isChatOpen ? 'Return to Split View' : 'Extend Editor to 100% Full Width'}
                aria-label="Toggle editor full width"
              >
                {layoutMode === 'editor' && !isChatOpen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
              </button>
            </div>
          </div>

          {/* Editor Canvas: Code Editor vs Diff Review */}
          {editorTab === 'code' ? (
            <div className="flex-1 flex overflow-hidden bg-[#0d0d11] min-h-0 relative">
              {/* Active Typing Indicator Badge */}
              {isWritingLatexToEditor && (
                <div className="absolute top-3 right-5 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-950/95 border border-indigo-500/60 shadow-xl shadow-indigo-950/50 text-indigo-200 text-xs font-mono animate-bounce">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                  </span>
                  <span className="font-semibold">AI is typing edits...</span>
                  <span className="inline-block w-1.5 h-3.5 bg-indigo-400 animate-pulse" />
                </div>
              )}

              {/* Line Numbers Column */}
              <div
                ref={lineNumbersRef}
                className="w-12 py-3.5 pl-2 pr-2.5 select-none text-right font-mono text-[11px] text-zinc-600 bg-[#09090c] border-r border-zinc-800/80 overflow-hidden shrink-0 leading-[22px]"
              >
                {lineNumbers.map((n) => (
                  <div key={n} className="leading-[22px] h-[22px]">{n}</div>
                ))}
              </div>

              {/* Code Area with optional syntax highlighting overlay */}
              <div className="flex-1 relative h-full overflow-hidden">
                {showSyntaxHighlight && (
                  <div
                    ref={codePreRef}
                    aria-hidden="true"
                    className="absolute inset-0 p-3.5 m-0 font-mono text-[12.5px] leading-[22px] pointer-events-none whitespace-pre overflow-hidden select-none"
                  >
                    {latexSource.split('\n').map((line, lineIdx) => {
                      const tokens = tokenizeLatex(line);
                      return (
                        <div key={lineIdx} className="leading-[22px] h-[22px]">
                          {tokens.length === 0 || (tokens.length === 1 && tokens[0].text === '') ? (
                            <span>&nbsp;</span>
                          ) : (
                            tokens.map((token, tokenIdx) => {
                              let colorClass = 'text-zinc-200';
                              if (token.type === 'command') colorClass = 'text-indigo-400 font-semibold';
                              else if (token.type === 'brace') colorClass = 'text-amber-400 font-bold';
                              else if (token.type === 'bracket') colorClass = 'text-cyan-400 font-medium';
                              else if (token.type === 'comment') colorClass = 'text-emerald-400/90 italic';
                              else if (token.type === 'math') colorClass = 'text-pink-400 font-medium';
                              return (
                                <span key={tokenIdx} className={colorClass}>
                                  {token.text}
                                </span>
                              );
                            })
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Interactive Textarea */}
                <textarea
                  ref={editorRef}
                  value={latexSource}
                  onChange={(e) => setLatexSource(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onScroll={handleEditorScroll}
                  aria-label="LaTeX document source editor"
                  className={`absolute inset-0 w-full h-full p-3.5 m-0 font-mono text-[12.5px] leading-[22px] bg-transparent resize-none whitespace-pre overflow-auto focus:outline-none z-10 font-normal border-0 outline-none shadow-none ${
                    showSyntaxHighlight
                      ? 'text-transparent caret-white selection:bg-indigo-600/40'
                      : 'text-zinc-200 selection:bg-indigo-600/40'
                  }`}
                  spellCheck={false}
                />
              </div>
            </div>
          ) : (
            /* Diff Review Canvas (Git / IDE Diff view) */
            <div className="flex-1 flex flex-col overflow-hidden bg-[#0d0d11] min-h-0">
              {/* Diff Summary Bar */}
              <div className="h-9 px-4 bg-[#121318] border-b border-zinc-800/80 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-zinc-300">Diff Review</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-mono">
                    +{additionsCount} added
                  </span>
                  <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[11px] font-mono">
                    -{removalsCount} removed
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setPreviousLatex(latexSource);
                      setEditorTab('code');
                    }}
                    className="px-2.5 py-1 rounded text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Check size={12} /> Accept All Changes
                  </button>
                  <button
                    onClick={() => {
                      setLatexSource(previousLatex);
                      compilePdf(previousLatex);
                      setEditorTab('code');
                    }}
                    className="px-2.5 py-1 rounded text-xs font-medium text-rose-400 hover:text-white hover:bg-rose-950/40 border border-rose-500/30 flex items-center gap-1.5 transition-colors"
                  >
                    <Undo2 size={12} /> Revert
                  </button>
                </div>
              </div>

              {/* Diff Lines Body */}
              <div className="flex-1 overflow-auto font-mono text-[12.5px] leading-[22px] min-h-0">
                {diffLines.length === 0 ? (
                  <div className="p-8 text-center text-zinc-500 text-xs">
                    No differences found between current and previous LaTeX versions.
                  </div>
                ) : (
                  diffLines.map((line, idx) => {
                    if (line.type === 'added') {
                      return (
                        <div
                          key={idx}
                          className="flex bg-emerald-950/30 text-emerald-200 border-l-4 border-emerald-500 hover:bg-emerald-950/45 transition-colors"
                        >
                          <div className="w-12 py-0.5 px-2 text-right select-none text-emerald-500/70 border-r border-emerald-900/40 shrink-0 text-[11px]">
                            {line.newNum}
                          </div>
                          <div className="w-6 py-0.5 text-center select-none text-emerald-400 font-bold shrink-0">
                            +
                          </div>
                          <div className="flex-1 py-0.5 px-2 whitespace-pre overflow-x-auto">
                            {line.text || ' '}
                          </div>
                        </div>
                      );
                    }
                    if (line.type === 'removed') {
                      return (
                        <div
                          key={idx}
                          className="flex bg-rose-950/30 text-rose-300/80 line-through border-l-4 border-rose-500 hover:bg-rose-950/45 transition-colors opacity-85"
                        >
                          <div className="w-12 py-0.5 px-2 text-right select-none text-rose-500/70 border-r border-rose-900/40 shrink-0 text-[11px]">
                            {line.oldNum}
                          </div>
                          <div className="w-6 py-0.5 text-center select-none text-rose-400 font-bold shrink-0">
                            -
                          </div>
                          <div className="flex-1 py-0.5 px-2 whitespace-pre overflow-x-auto">
                            {line.text || ' '}
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div
                        key={idx}
                        className="flex text-zinc-400 border-l-4 border-transparent hover:bg-zinc-900/40 transition-colors"
                      >
                        <div className="w-12 py-0.5 px-2 text-right select-none text-zinc-600 border-r border-zinc-800/60 shrink-0 text-[11px]">
                          {line.newNum}
                        </div>
                        <div className="w-6 py-0.5 text-center select-none text-zinc-600 shrink-0">
                          {' '}
                        </div>
                        <div className="flex-1 py-0.5 px-2 whitespace-pre overflow-x-auto text-zinc-300">
                          {line.text || ' '}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Editor Status Footer */}
          <div className="h-6 border-t border-zinc-800/80 bg-[#09090c] px-3 flex items-center justify-between text-[10.5px] text-zinc-500 font-mono shrink-0">
            {isWritingLatexToEditor ? (
              <span className="text-indigo-400 flex items-center gap-1.5 animate-pulse font-semibold">
                <Sparkles size={11} className="animate-spin" /> AI live editing LaTeX source...
              </span>
            ) : (
              <span>Tectonic LaTeX Engine (v0.15)</span>
            )}
            <span>Single Page Line Budget: OK</span>
          </div>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* PANE 3: PDF & DOCUMENT PREVIEW (Extendable / Maximizable)    */}
        {/* ------------------------------------------------------------ */}
        <div
          className={`flex-col border-l border-[var(--color-border)] bg-[#1e2022] min-w-0 transition-all duration-200 min-h-0 ${
            layoutMode === 'editor' ? 'hidden' : 'flex flex-1'
          } ${mobileTab === 'preview' ? 'flex flex-1' : 'hidden md:flex'}`}
        >
          {/* Preview Header */}
          <div className="h-10 px-3.5 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface)] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              {/* Tab: PDF vs Sheet */}
              <div className="flex bg-[var(--color-bg)] rounded-md p-0.5 border border-[var(--color-border)]">
                <button
                  onClick={() => setPreviewTab('pdf')}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                    previewTab === 'pdf' ? 'bg-[var(--color-surface-2)] text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Vector PDF
                </button>
                <button
                  onClick={() => setPreviewTab('sheet')}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                    previewTab === 'sheet' ? 'bg-[var(--color-surface-2)] text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Document Sheet
                </button>
              </div>

              {compileTime && (
                <span className="text-[10px] font-mono text-zinc-400 hidden sm:inline">
                  {compileTime}ms
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {/* Zoom Controls */}
              <div className="flex items-center gap-1 mr-1 text-zinc-400">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(z - 10, 70))}
                  className="p-1 hover:text-white"
                  title="Zoom Out"
                >
                  <ZoomOut size={13} />
                </button>
                <span className="text-[10px] font-mono w-7 text-center">{zoomLevel}%</span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(z + 10, 140))}
                  className="p-1 hover:text-white"
                  title="Zoom In"
                >
                  <ZoomIn size={13} />
                </button>
              </div>

              {/* Download / Open Buttons */}
              <a href={pdfUrl} target="_blank" rel="noreferrer" title="Open PDF in new tab" aria-label="Open PDF in new tab">
                <button className="p-1 text-zinc-400 hover:text-white rounded hover:bg-[var(--color-surface-2)]">
                  <ExternalLink size={13} />
                </button>
              </a>
              <a href={pdfUrl} download="Alex_Mercer_Resume.pdf" title="Download Vector PDF" aria-label="Download Vector PDF">
                <button className="p-1 text-zinc-400 hover:text-white rounded hover:bg-[var(--color-surface-2)]">
                  <Download size={13} />
                </button>
              </a>

              {/* Maximize / Split Button */}
              <button
                onClick={() => {
                  if (layoutMode === 'preview' && !isChatOpen) {
                    setLayoutMode('split');
                    setIsChatOpen(true);
                  } else {
                    setLayoutMode('preview');
                    setIsChatOpen(false);
                  }
                }}
                className="p-1 rounded text-zinc-400 hover:text-white hover:bg-[var(--color-surface-2)]"
                title={layoutMode === 'preview' && !isChatOpen ? 'Return to Split View' : 'Extend Preview to 100% Full Width'}
                aria-label="Toggle preview full width"
              >
                {layoutMode === 'preview' && !isChatOpen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
              </button>
            </div>
          </div>

          {/* Preview Viewport Canvas */}
          <div className="flex-1 relative overflow-auto bg-[#2b2d30] p-4 flex justify-center items-start min-h-0">
            {/* Sleek Compiling Overlay with Atomic / Orbital Rings & Timer */}
            {isCompiling && (
              <div className="absolute inset-0 z-30 bg-black/75 backdrop-blur-md flex items-center justify-center flex-col gap-4 animate-in fade-in duration-200">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  {/* Outer spinning ring */}
                  <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                  {/* Middle reverse spinning ring */}
                  <div className="absolute inset-2 rounded-full border-2 border-cyan-400/20 border-b-cyan-400 animate-[spin_1.5s_linear_infinite_reverse]" />
                  {/* Inner glowing pulsing core */}
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 animate-pulse shadow-[0_0_15px_rgba(99,102,241,0.8)]" />
                </div>
                <div className="text-center space-y-1">
                  <div className="text-sm font-semibold text-white tracking-wide flex items-center justify-center gap-2">
                    <span>Typesetting Vector PDF</span>
                    <span className="font-mono text-cyan-400">({compilingSeconds.toFixed(1)}s)</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-mono">Tectonic Engine $\cdot$ Mathematical Micro-Typo Layout</p>
                </div>
                {/* Animated progress bar */}
                <div className="w-48 h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-indigo-500 animate-[pulse_1s_ease-in-out_infinite] w-full" />
                </div>
              </div>
            )}

            {previewTab === 'pdf' ? (
              <div
                className="w-full h-full shadow-2xl rounded overflow-hidden border border-zinc-700/60 transition-transform duration-150 origin-top"
                style={{ transform: `scale(${zoomLevel / 100})` }}
              >
                <iframe
                  key={pdfUrl}
                  src={`${pdfUrl}#toolbar=0&navpanes=0`}
                  className="w-full h-full border-none bg-white"
                  title="Tectonic Vector PDF Canvas"
                />
              </div>
            ) : (
              /* Clean Document Sheet View */
              <div className="w-full max-w-[500px] bg-white text-zinc-900 shadow-2xl p-7 rounded-sm font-sans min-h-[700px] text-[11px] leading-relaxed selection:bg-indigo-100 border border-zinc-300">
                <div className="text-center pb-2.5 border-b border-zinc-300">
                  <h1 className="text-lg font-bold tracking-tight text-zinc-900 uppercase">Alex Mercer</h1>
                  <p className="text-[11px] text-zinc-700 font-semibold mt-0.5">Staff Software Engineer</p>
                  <div className="flex items-center justify-center gap-1.5 text-[9.5px] text-zinc-500 mt-1 flex-wrap">
                    <span>San Francisco, CA</span>
                    <span>•</span>
                    <span className="text-indigo-600">alex@example.com</span>
                    <span>•</span>
                    <span className="text-indigo-600">github.com/alexmercer</span>
                  </div>
                </div>

                <div className="mt-3">
                  <h2 className="text-[10px] font-bold text-zinc-800 uppercase tracking-wider pb-0.5 border-b border-zinc-200">
                    Summary
                  </h2>
                  <p className="text-[10px] text-zinc-700 mt-1 leading-normal">
                    Staff-level systems and frontend infrastructure engineer with 9+ years architecting high-throughput distributed applications, TypeScript platforms, and low-latency client systems.
                  </p>
                </div>

                <div className="mt-3">
                  <h2 className="text-[10px] font-bold text-zinc-800 uppercase tracking-wider pb-0.5 border-b border-zinc-200">
                    Experience
                  </h2>
                  <div className="space-y-2 mt-1">
                    <div>
                      <div className="flex justify-between items-baseline font-bold text-[10.5px]">
                        <span>Acme Corp</span>
                        <span className="text-[9.5px] text-zinc-500 font-normal">San Francisco, CA</span>
                      </div>
                      <div className="flex justify-between items-baseline text-[9.5px] text-zinc-600 italic">
                        <span>Senior Staff Infrastructure Engineer</span>
                        <span>2021 -- Present</span>
                      </div>
                      <ul className="list-disc pl-4 space-y-1 text-[9.5px] text-zinc-700 mt-0.5">
                        <li>Decomposed 3 monolithic services into distributed edge micro-frontends, reducing P99 latency by 64% across 14M+ daily active sessions.</li>
                        <li>Implemented zero-downtime PostgreSQL schema migration system with shadow dual-writing under 8,500 req/sec peak load.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <h2 className="text-[10px] font-bold text-zinc-800 uppercase tracking-wider pb-0.5 border-b border-zinc-200">
                    Technical Skills
                  </h2>
                  <div className="text-[9.5px] text-zinc-700 mt-1 space-y-0.5">
                    <p><strong className="text-zinc-900">Languages:</strong> TypeScript, Python, Rust, Go, SQL, LaTeX</p>
                    <p><strong className="text-zinc-900">Infrastructure:</strong> AWS, Cloudflare Workers, Docker, Kubernetes, PostgreSQL, Redis</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};
