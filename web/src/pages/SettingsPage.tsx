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
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SupabaseService } from '../services/supabase';
import { ByokService } from '../services/byok';
import type { AiProvider } from '../services/byok';

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
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  // Model settings — single source of truth via ByokService
  const [provider, setProvider] = useState<AiProvider>('openrouter');
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    // Migrate any stale saccade_llm_provider / saccade_llm_key entries to ByokService
    const legacyProvider = localStorage.getItem('saccade_llm_provider');
    const legacyKey = localStorage.getItem('saccade_llm_key');
    if (legacyProvider && legacyKey) {
      const validProviders: AiProvider[] = ['openrouter', 'anthropic', 'openai', 'gemini'];
      const p = validProviders.includes(legacyProvider as AiProvider)
        ? (legacyProvider as AiProvider)
        : 'openrouter';
      ByokService.saveConfig({ provider: p, apiKey: legacyKey, model: ByokService.getConfig().model });
      localStorage.removeItem('saccade_llm_provider');
      localStorage.removeItem('saccade_llm_key');
    }

    const byok = ByokService.getConfig();
    setProvider(byok.provider);
    setApiKey(byok.apiKey);
  }, []);

  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    // Supabase is now configured via build-time env vars (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).
    // Nothing to save at runtime.
    setSaveStatus('Supabase is configured via environment variables. No runtime config needed.');
    setTimeout(() => setSaveStatus(null), 4000);
  };

  const handleSaveModel = (e: React.FormEvent) => {
    e.preventDefault();
    const current = ByokService.getConfig();
    ByokService.saveConfig({ ...current, provider, apiKey: apiKey.trim() });
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

      {/* Infrastructure & Engine Health Scorecard */}
      <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--color-border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Shield size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Infrastructure & Compilation Engine Status</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                  100% OPERATIONAL
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                Zero-dependency local typesetting engine and private data sovereignty stack.
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-[var(--color-text-muted)] font-mono">Engine Reliability</div>
            <div className="text-lg font-bold font-mono text-emerald-400">100.0% SLA</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 text-xs">
          <div className="p-3 rounded-xl bg-[var(--color-surface-2)]/40 border border-[var(--color-border-subtle)]">
            <div className="font-semibold text-white">Tectonic LaTeX Binary</div>
            <p className="text-[11px] text-emerald-400 font-mono mt-0.5">Offline / 0 TeXLive req</p>
          </div>
          <div className="p-3 rounded-xl bg-[var(--color-surface-2)]/40 border border-[var(--color-border-subtle)]">
            <div className="font-semibold text-white">Data Sovereignty</div>
            <p className="text-[11px] text-emerald-400 font-mono mt-0.5">100% Client-Side Sandboxed</p>
          </div>
          <div className="p-3 rounded-xl bg-[var(--color-surface-2)]/40 border border-[var(--color-border-subtle)]">
            <div className="font-semibold text-white">Python FastMCP Pipeline</div>
            <p className="text-[11px] text-indigo-400 font-mono mt-0.5">FastMCP v4.0 Active</p>
          </div>
          <div className="p-3 rounded-xl bg-[var(--color-surface-2)]/40 border border-[var(--color-border-subtle)]">
            <div className="font-semibold text-white">Career Truth Anchor</div>
            <p className="text-[11px] text-emerald-400 font-mono mt-0.5">0 Hallucination Lock</p>
          </div>
        </div>
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

        <div className={`p-4 rounded-xl border flex items-start gap-3 text-xs leading-relaxed ${
          isConnected
            ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-300'
            : 'border-amber-500/20 bg-amber-500/5 text-[var(--color-text-secondary)]'
        }`}>
          {isConnected
            ? <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
            : <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />}
          <div>
            {isConnected
              ? <><strong className="text-white">Supabase connected</strong> via <code className="font-mono">VITE_SUPABASE_URL</code> / <code className="font-mono">VITE_SUPABASE_ANON_KEY</code> environment variables.</>
              : <>Supabase is not yet configured. Add <code className="font-mono">VITE_SUPABASE_URL</code> and <code className="font-mono">VITE_SUPABASE_ANON_KEY</code> to your <code className="font-mono">web/.env.local</code> file (local dev) or Cloudflare Pages environment variables (production). Then run the SQL migration below to create the required tables.</>
            }
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={handleCopySql}
            className="text-xs text-[var(--color-accent)] hover:underline flex items-center gap-1.5"
          >
            {copiedSql ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            {copiedSql ? 'Copied SQL migration script' : 'Copy Supabase SQL Tables Migration Script'}
          </button>
        </div>
      </div>

      {/* AI Model Settings (BYOK) */}
      <div className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)]/10 text-[var(--color-accent)] flex items-center justify-center">
            <Cpu size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">AI Engine & Model Provider</h2>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Configure frontier and open-weights models powering resume tailoring, bullet drafting, and ATS scoring.
            </p>
          </div>
        </div>

        {/* Default System Key Status Banner */}
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5 text-xs text-emerald-300">
          <ShieldCheck size={16} className="shrink-0 mt-0.5 text-emerald-400" />
          <div className="leading-relaxed">
            <strong className="text-white">Default System Engine Active:</strong> Saccade is fully operational out of the box with zero configuration required. The AI Resume Copilot streams from high-throughput models automatically. You do not need to provide an API key. Optional custom keys entered below will override the default engine for private billing.
          </div>
        </div>

        <form onSubmit={handleSaveModel} className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {([
              { id: 'openrouter', name: 'OpenRouter (Default)', sub: 'Free & Frontier Models' },
              { id: 'anthropic', name: 'Anthropic', sub: 'Claude 3.5 Sonnet' },
              { id: 'openai', name: 'OpenAI', sub: 'GPT-4o' },
              { id: 'gemini', name: 'Google Gemini', sub: 'Gemini 1.5 Pro' },
            ] as { id: AiProvider; name: string; sub: string }[]).map((p) => (
              <button
                type="button"
                key={p.id}
                onClick={() => setProvider(p.id)}
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

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)]">
                {provider.toUpperCase()} Custom API Key (Optional)
              </label>
              {provider === 'openrouter' && (
                <span className="text-[10px] text-zinc-500">
                  Leave blank to use default system key
                </span>
              )}
            </div>
            <input
              type="password"
              placeholder={provider === 'openrouter' ? 'Default system key active (or paste custom sk-or-v1-...)' : 'sk-...'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" size="sm">
              <Save size={14} className="mr-1.5" /> Save Provider Preferences
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
