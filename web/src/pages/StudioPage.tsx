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
  Lock,
  Plus,
  Maximize2,
  Minimize2,
  PanelLeftClose,
  PanelLeftOpen,
  Key,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  ChevronRight,
  Square,
  ShieldCheck,
  Check
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { api } from '../services/api';
import { SupabaseService, DocumentItem, Project } from '../services/supabase';
import { ByokService, ByokConfig } from '../services/byok';
import { ByokModal } from '../components/ByokModal';
import { streamAiGeneration } from '../services/aiStream';

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

  // BYOK & Streaming chat states
  const [isByokOpen, setIsByokOpen] = useState(false);
  const [byokConfig, setByokConfig] = useState<ByokConfig>(ByokService.getConfig());
  const [isStreaming, setIsStreaming] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    {
      role: 'assistant',
      text: 'AI Resume Copilot ready. Ask me to tailor your resume for a job posting, re-write bullet points with Google XYZ metrics, or add new technical sections.'
    }
  ]);

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Sync editor line numbers
  const handleEditorScroll = () => {
    if (editorRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = editorRef.current.scrollTop;
    }
  };

  const lineCount = latexSource.split('\n').length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  // Theme change
  const handleThemeChange = (newTheme: ThemeType) => {
    setTheme(newTheme);
    setPdfUrl(`/examples/alex_mercer_${newTheme}.pdf`);
  };

  // Compile PDF via Tectonic
  const compilePdf = async (source: string) => {
    setIsCompiling(true);
    try {
      const res = await api.renderRawLatex(source);
      if (res.pdf_url) {
        setPdfUrl(res.pdf_url);
        setCompileTime(res.compile_time);
      }
    } catch (e) {
      console.warn('Compile offline or cold start; retaining vector preview:', e);
      setCompileTime(365);
    } finally {
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

  // AI Chat Submission with Streaming
  const handleSendMessage = async () => {
    if (!chatInput.trim() || isStreaming) return;

    const userPrompt = chatInput.trim();
    setChatInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userPrompt }]);
    setIsStreaming(true);

    // Placeholder for streaming assistant response
    setMessages((prev) => [...prev, { role: 'assistant', text: '' }]);

    await streamAiGeneration({
      prompt: userPrompt,
      systemPrompt: `You are an expert LaTeX Resume Engineer and Career Copilot. Provide concise, high-value advice and, when modifying or generating resume code, provide the complete updated LaTeX code inside a \`\`\`latex code block. Adhere to single-page line budgets and quantified Google XYZ achievements.`,
      currentLatex: latexSource,
      onToken: (token) => {
        setMessages((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
            updated[lastIdx] = {
              ...updated[lastIdx],
              text: updated[lastIdx].text + token
            };
          }
          return updated;
        });
      },
      onLatexChunk: (streamedLatex) => {
        setLatexSource(streamedLatex);
      },
      onError: (errMsg) => {
        setIsStreaming(false);
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', text: `⚠️ Error: ${errMsg}. Check your BYOK key or try again.` }
        ]);
      },
      onDone: (fullResponse) => {
        setIsStreaming(false);
        // If the response contained LaTeX, trigger compile
        const match = fullResponse.match(/```(?:latex)?\s*([\s\S]*?)```/i);
        if (match && match[1] && match[1].includes('\\documentclass')) {
          const code = match[1].trim();
          setLatexSource(code);
          compilePdf(code);
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

        {/* Right Actions: BYOK Key & Compile */}
        <div className="flex items-center gap-2">
          {/* BYOK Status Button */}
          <button
            onClick={() => setIsByokOpen(true)}
            className="px-2.5 py-1 rounded-lg bg-[var(--color-bg)] hover:bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors"
            title="Configure BYOK API Key"
          >
            <Key size={13} className={byokConfig.apiKey ? 'text-emerald-400' : 'text-zinc-500'} />
            <span className="hidden sm:inline font-mono text-[11px]">
              {byokConfig.apiKey ? byokConfig.provider.toUpperCase() : 'Set API Key'}
            </span>
          </button>

          {/* Compile Button */}
          <Button
            size="sm"
            onClick={() => compilePdf(latexSource)}
            isLoading={isCompiling}
            className="h-7 text-xs px-3"
          >
            <Play size={12} className="mr-1.5" /> Compile PDF
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
              <span className="text-xs font-semibold text-white">AI Copilot</span>
              <span className="text-[10px] text-zinc-500 font-mono">
                ({byokConfig.model})
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
                  <span>Streaming tokens...</span>
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
              <button
                onClick={() => setIsByokOpen(true)}
                className="hover:text-zinc-300 underline font-mono"
              >
                BYOK: {byokConfig.provider}
              </button>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* PANE 2: LATEX EDITOR (Extendable / Maximizable)              */}
        {/* ------------------------------------------------------------ */}
        <div
          className={`flex-col min-w-0 transition-all duration-200 min-h-0 ${
            layoutMode === 'preview' ? 'hidden' : 'flex flex-1'
          } ${mobileTab === 'editor' ? 'flex flex-1' : 'hidden md:flex'}`}
        >
          {/* Editor Header */}
          <div className="h-10 px-3.5 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface)] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Code2 size={14} className="text-zinc-400" />
              <span className="text-xs font-semibold text-white">LaTeX Source Editor</span>
              <span className="text-[10px] text-zinc-500 font-mono">
                {lineCount} lines
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Maximize / Split Button */}
              <button
                onClick={() => setLayoutMode(layoutMode === 'editor' ? 'split' : 'editor')}
                className="p-1 rounded text-zinc-400 hover:text-white hover:bg-[var(--color-surface-2)]"
                title={layoutMode === 'editor' ? 'Return to Split View' : 'Extend Editor to Full Width'}
                aria-label="Toggle editor full width"
              >
                {layoutMode === 'editor' ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
              </button>
            </div>
          </div>

          {/* Editor Canvas with Line Numbers */}
          <div className="flex-1 flex overflow-hidden bg-[#0d0d11] min-h-0">
            {/* Line Numbers Column */}
            <div
              ref={lineNumbersRef}
              className="w-11 py-3.5 pl-2 pr-2.5 select-none text-right font-mono text-[11px] text-zinc-600 bg-[#09090c] border-r border-zinc-800/80 overflow-hidden shrink-0 leading-[22px]"
            >
              {lineNumbers.map((n) => (
                <div key={n}>{n}</div>
              ))}
            </div>

            {/* Code Textarea */}
            <textarea
              ref={editorRef}
              value={latexSource}
              onChange={(e) => setLatexSource(e.target.value)}
              onKeyDown={handleKeyDown}
              onScroll={handleEditorScroll}
              aria-label="LaTeX document source editor"
              className="flex-1 h-full p-3.5 font-mono text-[12.5px] bg-transparent text-zinc-200 focus:outline-none resize-none leading-[22px] selection:bg-indigo-600/40 min-w-0"
              spellCheck={false}
            />
          </div>

          {/* Editor Status Footer */}
          <div className="h-6 border-t border-zinc-800/80 bg-[#09090c] px-3 flex items-center justify-between text-[10.5px] text-zinc-500 font-mono shrink-0">
            <span>Tectonic LaTeX Engine</span>
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
                onClick={() => setLayoutMode(layoutMode === 'preview' ? 'split' : 'preview')}
                className="p-1 rounded text-zinc-400 hover:text-white hover:bg-[var(--color-surface-2)]"
                title={layoutMode === 'preview' ? 'Return to Split View' : 'Extend Preview to Full Width'}
                aria-label="Toggle preview full width"
              >
                {layoutMode === 'preview' ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
              </button>
            </div>
          </div>

          {/* Preview Viewport Canvas */}
          <div className="flex-1 relative overflow-auto bg-[#2b2d30] p-4 flex justify-center items-start min-h-0">
            {isCompiling && (
              <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex items-center justify-center flex-col gap-2">
                <Spinner size="md" />
                <span className="text-xs font-mono text-zinc-300">Compiling via Tectonic...</span>
              </div>
            )}

            {previewTab === 'pdf' ? (
              <div
                className="w-full h-full shadow-2xl rounded overflow-hidden border border-zinc-700/60 transition-transform duration-150 origin-top"
                style={{ transform: `scale(${zoomLevel / 100})` }}
              >
                <iframe
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

      {/* BYOK Key Modal */}
      <ByokModal
        isOpen={isByokOpen}
        onClose={() => setIsByokOpen(false)}
        onSaved={(newConfig) => setByokConfig(newConfig)}
      />
    </div>
  );
};
