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
  FileText
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { api } from '../services/api';

export const StudioPage = () => {
  const [activeTab, setActiveTab] = useState<'latex' | 'visual'>('latex');
  const [latexSource, setLatexSource] = useState<string>('% LaTeX source will appear here\n');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [isTailoring, setIsTailoring] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [compileTime, setCompileTime] = useState<number | null>(null);
  const [atsScore, setAtsScore] = useState<number | null>(null);
  const [coverLetterUrl, setCoverLetterUrl] = useState<string | null>(null);
  
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', text: string}[]>([
    { role: 'assistant', text: 'Paste a job description here, and I will tailor your canonical profile into a targeted LaTeX resume.' }
  ]);

  const compilePdf = async (source: string) => {
    setIsCompiling(true);
    try {
      const res = await api.renderRawLatex(source);
      if (res.pdf_url) {
        setPdfUrl(res.pdf_url);
        setCompileTime(res.compile_time);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCompiling(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      compilePdf(latexSource);
    }
  };

  const handleTailor = async () => {
    if (!chatInput.trim()) return;
    
    const userMsg = chatInput;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    setIsTailoring(true);
    
    try {
      const res = await api.tailorDocument(
        userMsg,
        'alex_mercer_canonical', // Hardcoded demo
        'modern',
        true
      );
      
      if (res.latex_source) {
        // Simple typing effect for latex source
        // noop
        const fullText = res.latex_source;
        setLatexSource('');
        
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          text: `Tailoring complete. ATS Match Score: ${res.ats_report?.overall_score || 85}%` 
        }]);
        
        if (res.ats_report) setAtsScore(res.ats_report.overall_score);
        if (res.cover_letter_url) setCoverLetterUrl(res.cover_letter_url);
        
        // Skip animation for now, just set and compile
        setLatexSource(fullText);
        compilePdf(fullText);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Error tailoring resume.' }]);
    } finally {
      setIsTailoring(false);
    }
  };

  return (
    <div className="h-[calc(100vh-var(--topbar-height))] flex bg-[var(--color-bg)]">
      {/* Pane 1: AI Chat (320px) */}
      <div className="w-[320px] flex flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium">
            <Bot size={18} className="text-[var(--color-accent)]" />
            Tailoring Agent
          </div>
          <Badge variant="accent" size="sm">Active</Badge>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`px-4 py-2.5 rounded-2xl max-w-[90%] text-[var(--text-sm)] ${
                msg.role === 'user' 
                  ? 'bg-[var(--color-accent)] text-white rounded-tr-sm' 
                  : 'bg-[var(--color-surface-2)] text-[var(--color-text-primary)] rounded-tl-sm'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isTailoring && (
            <div className="flex items-start">
              <div className="px-4 py-3 rounded-2xl bg-[var(--color-surface-2)] rounded-tl-sm flex items-center gap-2">
                <Spinner size="sm" />
                <span className="text-[var(--text-xs)] text-[var(--color-text-muted)]">Analyzing JD & compiling...</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="flex flex-wrap gap-2 mb-3">
            <button onClick={() => setChatInput('Senior React Developer at Stripe...')} className="text-[10px] px-2 py-1 bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] rounded-full text-[var(--color-text-secondary)] transition-colors">
              Frontend JD
            </button>
            <button onClick={() => setChatInput('Staff Backend Engineer at Vercel...')} className="text-[10px] px-2 py-1 bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] rounded-full text-[var(--color-text-secondary)] transition-colors">
              Backend JD
            </button>
          </div>
          <div className="relative">
            <textarea 
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder="Paste Job Description..."
              className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl py-2 px-3 pr-10 text-[var(--text-sm)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)] resize-none h-20"
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleTailor();
                }
              }}
            />
            <button 
              onClick={handleTailor}
              disabled={isTailoring || !chatInput.trim()}
              className="absolute right-2 bottom-2 p-1.5 bg-[var(--color-accent)] text-white rounded-lg disabled:opacity-50 hover:bg-[var(--color-accent-hover)] transition-colors"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Pane 2: Editor (flex-1) */}
      <div className="flex-1 flex flex-col min-w-[400px]">
        <div className="h-12 border-b border-[var(--color-border)] bg-[var(--color-surface)] flex items-center px-4 justify-between">
          <div className="flex bg-[var(--color-bg)] rounded-lg p-1 border border-[var(--color-border)]">
            <button 
              onClick={() => setActiveTab('latex')}
              className={`flex items-center gap-2 px-3 py-1 rounded-md text-[var(--text-xs)] font-medium transition-colors ${activeTab === 'latex' ? 'bg-[var(--color-surface-2)] text-[var(--color-text-primary)] shadow-sm' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'}`}
            >
              <Code2 size={14} /> LaTeX
            </button>
            <button 
              onClick={() => setActiveTab('visual')}
              className={`flex items-center gap-2 px-3 py-1 rounded-md text-[var(--text-xs)] font-medium transition-colors ${activeTab === 'visual' ? 'bg-[var(--color-surface-2)] text-[var(--color-text-primary)] shadow-sm' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'}`}
            >
              <Layout size={14} /> Visual
            </button>
          </div>
          
          <div className="flex items-center gap-3 text-[var(--text-xs)] text-[var(--color-text-muted)]">
            <span>Press <kbd className="px-1.5 py-0.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded text-[10px]">⌘</kbd> + <kbd className="px-1.5 py-0.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded text-[10px]">Enter</kbd> to compile</span>
            <Button size="sm" onClick={() => compilePdf(latexSource)} isLoading={isCompiling} className="h-7 px-3">
              <Play size={12} className="mr-1.5" /> Compile
            </Button>
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden bg-[var(--color-bg)]">
          {activeTab === 'latex' ? (
            <textarea
              value={latexSource}
              onChange={(e) => setLatexSource(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full h-full p-4 font-mono text-[13px] bg-transparent text-[var(--color-text-secondary)] focus-visible:outline-none resize-none leading-relaxed"
              spellCheck={false}
            />
          ) : (
            <div className="p-6 overflow-y-auto h-full">
              <Card>
                <div className="p-6 space-y-6">
                  <div className="text-center text-[var(--color-text-muted)] py-12">
                    <Layout size={32} className="mx-auto mb-4 opacity-50" />
                    <p>Visual builder forms go here in a full implementation.</p>
                    <p className="text-xs mt-2">Switch to LaTeX tab to edit source.</p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Pane 3: PDF Preview (480px fixed) */}
      <div className="w-[480px] flex flex-col border-l border-[var(--color-border)] bg-[#323639]">
        <div className="h-12 border-b border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <span className="text-[var(--text-sm)] font-medium">Preview</span>
            {compileTime && (
              <Badge variant="success" size="sm" className="font-mono">{compileTime}ms</Badge>
            )}
            {atsScore && (
              <Badge variant="accent" size="sm">ATS: {atsScore}</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {pdfUrl && (
              <>
                <a href={pdfUrl} target="_blank" rel="noreferrer" title="Open in new tab">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <ExternalLink size={14} />
                  </Button>
                </a>
                <a href={pdfUrl} download="resume.pdf" title="Download PDF">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <Download size={14} />
                  </Button>
                </a>
              </>
            )}
          </div>
        </div>
        
        {coverLetterUrl && (
          <div className="bg-[var(--color-accent-subtle)] border-b border-[var(--color-accent)]/20 p-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[var(--color-accent)] text-[var(--text-sm)]">
              <FileText size={16} /> Cover Letter Generated
            </div>
            <a href={coverLetterUrl} download="cover_letter.txt">
              <Button size="sm" variant="secondary" className="h-7 text-xs bg-white text-black hover:bg-gray-100">
                Download .txt
              </Button>
            </a>
          </div>
        )}
        
        <div className="flex-1 relative overflow-hidden bg-[#525659]">
          {isCompiling && (
            <div className="absolute inset-0 z-10 bg-black/40 backdrop-blur-sm flex items-center justify-center">
              <Spinner size="lg" className="text-white" />
            </div>
          )}
          
          {pdfUrl ? (
            <iframe 
              src={`${pdfUrl}#toolbar=0&navpanes=0`} 
              className="w-full h-full border-none"
              title="PDF Preview"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-[#9ca3af] flex-col gap-3">
              <FileText size={48} className="opacity-20" />
              <p className="text-sm font-medium">No PDF compiled yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
