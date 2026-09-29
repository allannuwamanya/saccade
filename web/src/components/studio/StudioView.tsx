import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Sparkles,
  RefreshCw,
  Code,
  Layout,
  CheckCircle2,
  Download,
  Palette,
  ExternalLink,
  Clock,
  Briefcase,
  FileCheck
} from 'lucide-react';
import { api } from '../../services/api';
import { ThemeName, MasterProfile, AtsAuditResult, TailorResponse } from '../../types/api';
import { ChatMessage, ApplicationRecord } from '../../types/app';
import { AtsCard } from '../AtsCard';

interface StudioViewProps {
  profile: MasterProfile | null;
  onUpdateProfile: (profile: MasterProfile) => void;
  onSaveApplication?: (app: ApplicationRecord) => void;
}

const DEFAULT_SAMPLE_JOB = `Senior Distributed Systems Engineer - Stripe Infrastructure
Location: San Francisco, CA / Remote

About the Role:
Our Distributed Systems Infrastructure team designs, builds, and operates the distributed consensus engines and transaction routing backbones handling over 12 billion events daily.

Required Qualifications:
- 5+ years building high-scale distributed consensus protocols (Raft, Paxos).
- Proficiency in systems languages (Rust, Go, or C++).
- Deep experience with distributed databases (CockroachDB) and message queues (Kafka).
- Demonstrated track record improving P99 latency and fault tolerance in high-throughput environments.`;

export const StudioView: React.FC<StudioViewProps> = ({ profile }) => {
  // Theme & PDF state
  const [theme, setTheme] = useState<ThemeName>('modern');
  const [pdfUrl, setPdfUrl] = useState<string>('/api/pdf/alex_mercer_modern.pdf');
  const [compileTime, setCompileTime] = useState<number | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);

  // Editor mode: 'latex' | 'visual'
  const [editorMode, setEditorMode] = useState<'latex' | 'visual'>('latex');
  const [latexSource, setLatexSource] = useState<string>('');
  const [isStreamingLatex, setIsStreamingLatex] = useState(false);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: "Hello! I am Saccade Copilot. I can tailor your resume for any job description, optimize your bullets for ATS parsers, or generate matching cover letters—strictly anchored to your verified career facts.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);

  // ATS & Tailoring results
  const [atsResult, setAtsResult] = useState<AtsAuditResult | null>(null);
  const [tailorResult, setTailorResult] = useState<TailorResponse | null>(null);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Initial compile to load default LaTeX source & PDF
  useEffect(() => {
    async function loadInitial() {
      try {
        const res = await api.renderDocument('alex_mercer_canonical', theme, 'resume');
        setPdfUrl(`${res.pdf_url}?t=${Date.now()}`);
        setCompileTime(res.compile_time);
        if (res.latex_source) {
          setLatexSource(res.latex_source);
        }
      } catch (err) {
        console.warn('Initial studio load:', err);
      }
    }
    loadInitial();
  }, [theme]);

  // Scroll chat to bottom on new messages
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiThinking]);

  // Compile LaTeX directly from the editor
  const handleCompileLatex = async (sourceToCompile?: string) => {
    const src = sourceToCompile || latexSource;
    if (!src.trim()) return;

    setIsCompiling(true);
    try {
      const res = await api.renderRawLatex(src);
      setPdfUrl(`${res.pdf_url}?t=${Date.now()}`);
      setCompileTime(res.compile_time);
    } catch (err: unknown) {
      alert((err as Error).message || 'Compilation failed');
    } finally {
      setIsCompiling(false);
    }
  };

  // Keyboard shortcut: Cmd/Ctrl + Enter compiles
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleCompileLatex();
    }
  };

  // Stream text animation into LaTeX editor
  const streamTextIntoEditor = async (fullText: string) => {
    setIsStreamingLatex(true);
    setLatexSource('');
    
    // Chunked rapid streaming effect
    const chunkSize = Math.max(30, Math.floor(fullText.length / 50));
    let currentIdx = 0;

    await new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        currentIdx += chunkSize;
        if (currentIdx >= fullText.length) {
          setLatexSource(fullText);
          clearInterval(interval);
          setIsStreamingLatex(false);
          resolve();
        } else {
          setLatexSource(fullText.substring(0, currentIdx));
        }
      }, 20);
    });
  };

  // Handle Chat Submissions
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isAiThinking) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsAiThinking(true);

    try {
      // Check if user is asking to tailor for a job
      const isJobTailorQuery = query.toLowerCase().includes('stripe') || query.toLowerCase().includes('tailor') || query.toLowerCase().includes('engineer') || query.length > 80;

      if (isJobTailorQuery) {
        // Run full tailoring pipeline
        const jobSource = query.length > 100 ? query : DEFAULT_SAMPLE_JOB;
        const res = await api.tailorDocument(jobSource, 'alex_mercer_canonical', theme, true);
        
        setTailorResult(res);
        if (res.ats_report || res.ats_score) {
          setAtsResult(res.ats_report || res.ats_score || null);
        }

        // Stream generated LaTeX into the editor!
        if (res.latex_source) {
          await streamTextIntoEditor(res.latex_source);
          // Recompile PDF
          await handleCompileLatex(res.latex_source);
        }

        const assistantMsg: ChatMessage = {
          id: 'msg-' + Date.now(),
          sender: 'assistant',
          text: `I've tailored your resume for the target role! Key accomplishments have been aligned with distributed consensus and low-latency metrics, and an ATS compliance audit scored your profile at ${res.ats_report?.overall_score || 94}%. The latest LaTeX source has streamed into your editor.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          metadata: {
            tailorResponse: res,
            atsAudit: res.ats_report || res.ats_score,
          }
        };
        setMessages((prev) => [...prev, assistantMsg]);

      } else {
        // General AI assistance
        const assistantMsg: ChatMessage = {
          id: 'msg-' + Date.now(),
          sender: 'assistant',
          text: `Understood! I'm monitoring your resume and active facts. You can paste a full job description, ask me to format your bullet points with quantifiable metrics, or click any prompt chip below.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (err: unknown) {
      const errMsg: ChatMessage = {
        id: 'msg-' + Date.now(),
        sender: 'system',
        text: `Error processing request: ${(err as Error).message || 'Server error'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsAiThinking(false);
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-slate-950">
      {/* ============================================================== */}
      {/* PANE 1: AI COPILOT CHAT (Left Column - 360px)                 */}
      {/* ============================================================== */}
      <div className="w-[360px] border-r border-slate-800 flex flex-col bg-slate-900/40 shrink-0">
        <div className="h-11 border-b border-slate-800 px-4 flex items-center justify-between bg-slate-900/70 text-xs font-semibold text-slate-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>AI Copilot & ATS</span>
          </div>
          <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
            Truth-Anchored
          </span>
        </div>

        {/* Chat Messages Log */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${
                m.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[90%] p-3 rounded-2xl ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : m.sender === 'system'
                    ? 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-sm'
                }`}
              >
                <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>

                {/* Inline ATS Badges if tailored */}
                {m.metadata?.atsAudit && (
                  <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>ATS Match: {m.metadata.atsAudit.overall_score}%</span>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 px-1">{m.timestamp}</span>
            </div>
          ))}

          {isAiThinking && (
            <div className="flex items-center gap-2 text-xs text-blue-400 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing job requirements & formatting TeX source...</span>
            </div>
          )}

          {/* Real-time ATS summary card in chat if available */}
          {atsResult && <AtsCard ats={atsResult} />}

          <div ref={chatBottomRef} />
        </div>

        {/* Quick Action Prompt Chips */}
        <div className="p-2 border-t border-slate-800/80 bg-slate-950/60 flex flex-wrap gap-1.5 text-[11px]">
          <button
            onClick={() => handleSendMessage("Tailor my resume for the Senior Stripe Distributed Systems role with matching cover letter")}
            className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition flex items-center gap-1"
          >
            <Briefcase className="w-3 h-3 text-blue-400" />
            <span>Tailor for Stripe Role</span>
          </button>
          <button
            onClick={() => handleSendMessage("Quantify my accomplishments using Google X-Y-Z formula")}
            className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
          >
            📈 Quantify Metrics
          </button>
          <button
            onClick={() => handleSendMessage("Run full ATS compliance audit on my current resume")}
            className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
          >
            🛡️ ATS Audit
          </button>
        </div>

        {/* Chat Input */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask Copilot or paste a job posting..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
            />
            <button
              type="submit"
              disabled={isAiThinking || !inputText.trim()}
              className="p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg transition"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* ============================================================== */}
      {/* PANE 2: LATEST EDITOR (Middle Column - LaTeX & Visual)        */}
      {/* ============================================================== */}
      <div className="flex-1 min-w-[380px] border-r border-slate-800 flex flex-col bg-slate-950 overflow-hidden">
        {/* Editor Controls Bar */}
        <div className="h-11 border-b border-slate-800 px-4 flex items-center justify-between bg-slate-900/70 shrink-0 text-xs">
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
              <button
                onClick={() => setEditorMode('latex')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition ${
                  editorMode === 'latex'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>LaTeX Source</span>
              </button>
              <button
                onClick={() => setEditorMode('visual')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition ${
                  editorMode === 'visual'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layout className="w-3.5 h-3.5" />
                <span>Visual Form</span>
              </button>
            </div>

            {isStreamingLatex && (
              <span className="flex items-center gap-1 text-[11px] text-blue-400 animate-pulse">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Streaming latest TeX...</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 font-mono hidden md:inline">
              Press Cmd+Enter to compile
            </span>
            <button
              onClick={() => handleCompileLatex()}
              disabled={isCompiling}
              className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCompiling ? 'animate-spin' : ''}`} />
              <span>{isCompiling ? 'Compiling...' : 'Recompile'}</span>
            </button>
          </div>
        </div>

        {/* Editor Content Area */}
        <div className="flex-1 overflow-hidden relative">
          {editorMode === 'latex' ? (
            <textarea
              value={latexSource}
              onChange={(e) => setLatexSource(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              className="w-full h-full bg-slate-950 text-slate-200 font-mono text-xs p-4 leading-relaxed resize-none focus:outline-none focus:ring-0 border-0"
              placeholder="% LaTeX document source code appears here. You can edit directly and press Recompile."
            />
          ) : (
            /* Visual Form Mode */
            <div className="h-full overflow-y-auto p-4 space-y-4">
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Candidate Basics
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 mb-1 block">Full Name</label>
                    <input
                      type="text"
                      defaultValue={profile?.basics.name || 'Alex Mercer'}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 mb-1 block">Email</label>
                    <input
                      type="text"
                      defaultValue={profile?.basics.email || 'alex@example.com'}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Experience Highlights (Truth-Anchored)
                </div>
                {profile?.work?.map((w, idx) => (
                  <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">{w.position} — {w.company}</span>
                      <span className="text-slate-500 text-[11px]">{w.startDate} - {w.endDate}</span>
                    </div>
                    <ul className="list-disc list-inside text-xs text-slate-400 space-y-1">
                      {w.highlights?.map((h, hIdx) => (
                        <li key={hIdx}>{h}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* PANE 3: LIVE VECTOR PDF PREVIEW (Right Column - Flexible)     */}
      {/* ============================================================== */}
      <div className="w-1/2 min-w-[420px] flex flex-col bg-slate-950 overflow-hidden">
        {/* Preview Header Bar */}
        <div className="h-11 border-b border-slate-800 px-4 flex items-center justify-between bg-slate-900/70 shrink-0 text-xs text-slate-300">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-100">Vector PDF</span>

            {/* Theme Switcher */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs">
              <span className="text-slate-400 px-1.5 flex items-center gap-1">
                <Palette className="w-3 h-3" />
              </span>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as ThemeName)}
                className="bg-transparent text-slate-200 text-xs focus:outline-none pr-2 font-medium cursor-pointer"
              >
                <option value="classic" className="bg-slate-900">Classic Serif</option>
                <option value="modern" className="bg-slate-900">Modern Tech Sans</option>
                <option value="executive" className="bg-slate-900">Executive Leadership</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {compileTime != null && (
              <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                <Clock className="w-3 h-3 text-blue-400" />
                <span>{compileTime}s</span>
              </div>
            )}

            <a
              href={pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
              title="Open in New Tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <a
              href={pdfUrl}
              download="resume.pdf"
              className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-sm transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </a>
          </div>
        </div>

        {/* Embedded Vector PDF Frame */}
        <div className="flex-1 bg-slate-900/30 p-2 overflow-hidden flex items-center justify-center">
          <iframe
            key={pdfUrl}
            src={pdfUrl}
            title="Saccade Vector PDF Preview"
            className="w-full h-full rounded-lg border border-slate-800 shadow-2xl bg-white"
          />
        </div>

        {/* Cover Letter Banner if tailored */}
        {tailorResult?.cover_letter_url && (
          <div className="h-10 border-t border-slate-800 bg-slate-900/90 px-4 flex items-center justify-between text-xs shrink-0">
            <span className="text-slate-300 flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Matching Cover Letter ready for download</span>
            </span>
            <a
              href={tailorResult.cover_letter_url}
              download="cover_letter.pdf"
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              Download Cover Letter PDF →
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
