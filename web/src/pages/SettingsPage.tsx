import React, { useState, useEffect } from 'react';
import {
  SlidersHorizontal,
  Database,
  Key,
  Shield,
  Download,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Save,
  Cpu,
  RefreshCw
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SupabaseService } from '../services/supabase';

const SUPABASE_SCHEMA_SQL = `-- Saccade Supabase Schema
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    headline TEXT,
    summary TEXT,
    contact_info JSONB DEFAULT '{}',
    work_experience JSONB DEFAULT '[]',
    education JSONB DEFAULT '[]',
    skills JSONB DEFAULT '[]',
    projects JSONB DEFAULT '[]',
    certifications JSONB DEFAULT '[]',
    languages JSONB DEFAULT '[]',
    completeness_score INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    location TEXT,
    is_remote BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'bookmarked',
    job_description TEXT,
    target_salary TEXT,
    latest_ats_score NUMERIC(5,2),
    is_locked BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    type TEXT,
    name TEXT NOT NULL,
    theme TEXT DEFAULT 'modern',
    latex_source TEXT NOT NULL,
    pdf_storage_path TEXT,
    ats_score NUMERIC(5,2),
    is_frozen BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);`;

export const SettingsPage: React.FC = () => {
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  // Model settings
  const [provider, setProvider] = useState<'mock' | 'anthropic' | 'openai' | 'gemini' | 'ollama'>('mock');
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    const config = SupabaseService.getConfig();
    setSupabaseUrl(config.url);
    setSupabaseKey(config.key);

    const savedProvider = localStorage.getItem('saccade_llm_provider') || 'mock';
    const savedApiKey = localStorage.getItem('saccade_llm_key') || '';
    setProvider(savedProvider as any);
    setApiKey(savedApiKey);
  }, []);

  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    SupabaseService.saveConfig(supabaseUrl, supabaseKey);
    setSaveStatus('Supabase configuration saved successfully.');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleSaveModel = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('saccade_llm_provider', provider);
    localStorage.setItem('saccade_llm_key', apiKey.trim());
    setSaveStatus('AI Model provider settings saved.');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleExportData = () => {
    const backup = {
      projects: SupabaseService.getProjects(),
      documents: SupabaseService.getDocuments(),
      facts: SupabaseService.getFacts(),
      companies: SupabaseService.getCompanies(),
      activities: SupabaseService.getActivities(),
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `saccade_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isConnected = SupabaseService.isConfigured();

  return (
    <div className="max-w-[1200px] mx-auto p-8 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[var(--color-border-subtle)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-[var(--text-3xl)] font-bold tracking-tight text-[var(--color-text-primary)]">
              Settings & Integrations
            </h1>
            <Badge variant="accent" size="sm">System Config</Badge>
          </div>
          <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)]">
            Configure your Supabase database connection, BYOK AI model providers, and export full career backups.
          </p>
        </div>

        {saveStatus && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-medium">
            <CheckCircle2 size={14} /> {saveStatus}
          </div>
        )}
      </div>

      {/* Supabase Database Settings */}
      <div className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Database size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Supabase Database & Cloud Storage</h2>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                Connect your Supabase PostgreSQL instance to persist tailored resumes, projects, and documents permanently.
              </p>
            </div>
          </div>

          <Badge variant={isConnected ? 'success' : 'warning'} size="sm">
            {isConnected ? 'Connected' : 'Local Storage Mode'}
          </Badge>
        </div>

        {!isConnected && (
          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 flex items-start gap-3 text-xs text-[var(--color-text-secondary)] leading-relaxed">
            <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              Currently running in <strong>Local Storage Sandbox mode</strong>. Your data is stored in your browser.
              When ready, paste your Supabase Project URL and Public Anon Key below to enable cloud backup and multi-device sync.
            </div>
          </div>
        )}

        <form onSubmit={handleSaveSupabase} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                Supabase Project URL
              </label>
              <input
                type="url"
                placeholder="https://your-project.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                Supabase Public Anon Key
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleCopySql}
              className="text-xs text-[var(--color-accent)] hover:underline flex items-center gap-1.5"
            >
              {copiedSql ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              {copiedSql ? 'Copied SQL migration script' : 'Copy Supabase SQL Tables Migration Script'}
            </button>

            <Button type="submit" size="sm">
              <Save size={14} className="mr-1.5" /> Save Database Keys
            </Button>
          </div>
        </form>
      </div>

      {/* AI Model Settings (BYOK) */}
      <div className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)]/10 text-[var(--color-accent)] flex items-center justify-center">
            <Cpu size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">AI Engine & Model Provider (BYOK)</h2>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Select which LLM powers the job description parser, STAR writer, and ATS auditor.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveModel} className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { id: 'mock', name: 'Mock Engine', sub: 'Instant Test Mode' },
              { id: 'anthropic', name: 'Anthropic', sub: 'Claude 3.5 Sonnet' },
              { id: 'openai', name: 'OpenAI', sub: 'GPT-4o' },
              { id: 'gemini', name: 'Google Gemini', sub: 'Gemini 1.5 Pro' },
              { id: 'ollama', name: 'Local Ollama', sub: 'Llama 3 (Private)' },
            ].map((p) => (
              <button
                type="button"
                key={p.id}
                onClick={() => setProvider(p.id as any)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  provider === p.id
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent-subtle)] text-white'
                    : 'border-[var(--color-border)] bg-[var(--color-surface-2)]/40 text-[var(--color-text-secondary)] hover:text-white'
                }`}
              >
                <div className="text-xs font-bold text-white truncate">{p.name}</div>
                <div className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{p.sub}</div>
              </button>
            ))}
          </div>

          {provider !== 'mock' && provider !== 'ollama' && (
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                {provider.toUpperCase()} API Key
              </label>
              <input
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)]"
              />
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button type="submit" size="sm">
              <Save size={14} className="mr-1.5" /> Save AI Provider
            </Button>
          </div>
        </form>
      </div>

      {/* Data Export & Sovereignty */}
      <div className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white">Full Career Data Export</h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Download your complete career factbase, tailored applications, and document history as structured JSON.
          </p>
        </div>

        <Button variant="secondary" size="sm" onClick={handleExportData}>
          <Download size={14} className="mr-1.5" /> Export JSON Backup
        </Button>
      </div>
    </div>
  );
};
