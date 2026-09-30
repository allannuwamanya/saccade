import React, { useState, useEffect } from 'react';
import {
  FolderArchive,
  FileCode2,
  Download,
  ExternalLink,
  Lock,
  Plus,
  Search,
  Code2,
  Copy,
  Check,
  Eye,
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SupabaseService, DocumentItem } from '../services/supabase';
import type { Page } from '../App';

interface DocumentLibraryPageProps {
  onNavigate: (page: Page) => void;
}

export const DocumentLibraryPage: React.FC<DocumentLibraryPageProps> = ({ onNavigate }) => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'resume' | 'cover_letter'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setDocuments(SupabaseService.getDocuments());
  }, []);

  const handleCopyLatex = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesFilter = activeFilter === 'all' || doc.type === activeFilter;
    const matchesSearch =
      searchQuery === '' ||
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.projectName && doc.projectName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-[1600px] mx-auto p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[var(--color-border-subtle)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-[var(--text-3xl)] font-bold tracking-tight text-[var(--color-text-primary)]">
              Document Library
            </h1>
            <Badge variant="accent" size="sm">{documents.length} Artifacts</Badge>
          </div>
          <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)]">
            Immutable, version-controlled repository of every tailored LaTeX resume, cover letter, and vector PDF generated.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={() => onNavigate('studio')}>
            <Plus size={16} className="mr-1.5" /> Compile in Studio
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          {[
            { id: 'all', label: 'All Documents' },
            { id: 'resume', label: 'Resumes (.tex & PDF)' },
            { id: 'cover_letter', label: 'Cover Letters' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeFilter === tab.id
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'text-[var(--color-text-secondary)] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search document name or project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)]"
          />
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-accent)] transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
          >
            <div>
              {/* Top metadata */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-mono uppercase tracking-wider text-[var(--color-accent)] font-semibold flex items-center gap-1.5">
                  <FileCode2 size={14} />
                  {doc.type.replace('_', ' ')}
                </span>

                <div className="flex items-center gap-1.5">
                  {doc.isFrozen && (
                    <span className="flex items-center text-[10px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 font-medium">
                      <Lock size={10} className="mr-1" /> Frozen
                    </span>
                  )}
                  <Badge variant="default" size="sm">Theme: {doc.theme}</Badge>
                </div>
              </div>

              {/* Title & Project Link */}
              <h3 className="text-base font-bold text-white mb-1 truncate">{doc.name}</h3>
              <p className="text-xs text-[var(--color-text-secondary)] mb-4">
                Linked project: <span className="text-[var(--color-accent)] font-medium">{doc.projectName || 'Standalone'}</span>
              </p>

              {/* Stats pill */}
              <div className="flex items-center gap-3 py-2 px-3 rounded-lg bg-[var(--color-surface-2)]/60 border border-[var(--color-border-subtle)] mb-4">
                {doc.atsScore && (
                  <div className="flex items-center gap-1 text-xs font-mono font-bold text-emerald-400">
                    <span>{doc.atsScore}% ATS</span>
                  </div>
                )}
                {doc.compileTimeMs && (
                  <div className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] font-mono">
                    <Clock size={11} /> {doc.compileTimeMs}ms Tectonic
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-[var(--color-border-subtle)] flex items-center justify-between gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-8 px-2.5"
                onClick={() => setSelectedDoc(doc)}
              >
                <Code2 size={13} className="mr-1.5" /> View LaTeX
              </Button>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="secondary"
                  size="sm"
                  className="text-xs h-8 px-2.5"
                  onClick={() => onNavigate('studio')}
                >
                  <Eye size={13} className="mr-1.5" /> Preview PDF
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* LaTeX Viewer Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-3xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-2)]/40">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <FileCode2 size={16} className="text-[var(--color-accent)]" />
                  {selectedDoc.name}
                </h2>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  Theme: {selectedDoc.theme} · Compiled with Tectonic Engine
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleCopyLatex(selectedDoc.latexSource)}
                >
                  {copied ? <Check size={14} className="mr-1 text-emerald-400" /> : <Copy size={14} className="mr-1" />}
                  {copied ? 'Copied' : 'Copy LaTeX'}
                </Button>
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="p-1 text-[var(--color-text-muted)] hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Code Body */}
            <div className="flex-1 p-5 overflow-auto bg-[#0a0a0c] font-mono text-xs text-zinc-300 leading-relaxed whitespace-pre selection:bg-indigo-600/40">
              {selectedDoc.latexSource}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[var(--color-border-subtle)] flex items-center justify-between bg-[var(--color-surface-2)]/20">
              <span className="text-xs text-[var(--color-text-muted)]">
                Status: {selectedDoc.isFrozen ? 'Permanently Frozen (Submitted Application)' : 'Editable Draft'}
              </span>
              <Button size="sm" onClick={() => onNavigate('studio')}>
                Edit in Studio <ExternalLink size={13} className="ml-1.5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
