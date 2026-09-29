import React, { useState } from 'react';
import { Cpu, Terminal, Copy, Check, Key } from 'lucide-react';

export const AgentHubView: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<'anthropic' | 'openai' | 'gemini' | 'ollama' | 'mock'>('mock');

  const MCP_SNIPPET = `{
  "mcpServers": {
    "saccade": {
      "command": "saccade",
      "args": ["mcp"]
    }
  }
}`;

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-blue-400" />
          <span>Agent Hub & FastMCP Integration</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Connect external AI agents (Claude Desktop, Cursor, Antigravity, or custom bots) to Saccade via the Model Context Protocol.
        </p>
      </div>

      {/* MCP Overview Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
              Claude Desktop & Cursor Configuration
            </h2>
          </div>
          <button
            onClick={() => copyToClipboard(MCP_SNIPPET, 1)}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition"
          >
            {copiedIndex === 1 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedIndex === 1 ? 'Copied!' : 'Copy Config'}</span>
          </button>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Add the following block to your <code className="text-blue-400 font-mono bg-slate-950 px-1 py-0.5 rounded">claude_desktop_config.json</code> to give Claude the power to query your career facts, tailor resumes, and compile vector PDFs:
        </p>

        <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 font-mono text-xs text-slate-300 overflow-x-auto">
          {MCP_SNIPPET}
        </pre>

        <div className="pt-2 text-xs text-slate-400">
          <span className="font-semibold text-slate-200">7 Native Tools Exposed: </span>
          <code className="text-emerald-400 text-[11px]">get_profile</code>,{' '}
          <code className="text-emerald-400 text-[11px]">save_profile</code>,{' '}
          <code className="text-emerald-400 text-[11px]">import_resume</code>,{' '}
          <code className="text-emerald-400 text-[11px]">parse_job_posting</code>,{' '}
          <code className="text-emerald-400 text-[11px]">tailor_resume</code>,{' '}
          <code className="text-emerald-400 text-[11px]">audit_ats</code>,{' '}
          <code className="text-emerald-400 text-[11px]">render_document_pdf</code>.
        </div>
      </div>

      {/* BYOK (Bring Your Own Key) Settings */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-blue-400" />
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Multi-Model / BYOK (Bring Your Own Key)
          </h2>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Saccade is provider-agnostic. Select which AI engine powers your tailoring, bullet rewriting, and ATS parsing:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {[
            { id: 'mock', label: 'Mock Engine (Zero Cost)', desc: 'Instant testing' },
            { id: 'anthropic', label: 'Anthropic Claude', desc: 'Claude 3.5 Sonnet' },
            { id: 'openai', label: 'OpenAI GPT-4o', desc: 'GPT-4o mini / Omni' },
            { id: 'gemini', label: 'Google Gemini', desc: 'Gemini 2.5 Flash' },
            { id: 'ollama', label: 'Local Ollama', desc: '100% Offline / Local' },
          ].map((prov) => (
            <button
              key={prov.id}
              onClick={() => setSelectedProvider(prov.id as unknown as typeof selectedProvider)}
              className={`p-3 rounded-xl border text-left transition ${
                selectedProvider === prov.id
                  ? 'border-blue-500 bg-blue-500/10 text-white'
                  : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="text-xs font-semibold text-slate-200">{prov.label}</div>
              <div className="text-[10px] text-slate-500 mt-1">{prov.desc}</div>
            </button>
          ))}
        </div>

        {selectedProvider !== 'mock' && selectedProvider !== 'ollama' && (
          <div className="pt-2 text-xs">
            <label className="text-slate-400 block mb-1">API Key for {selectedProvider}</label>
            <input
              type="password"
              placeholder={`Enter your ${selectedProvider} API key...`}
              className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 text-xs focus:outline-none focus:border-blue-500"
            />
          </div>
        )}
      </div>
    </div>
  );
};
