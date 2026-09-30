import React, { useState } from 'react';
import { Cpu, Terminal, Key, Database, Zap, Lock, BookOpen } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { CodeBlock } from '../components/ui/CodeBlock';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const AgentHubPage = () => {
  const [provider, setProvider] = useState<'mock' | 'anthropic' | 'openai' | 'ollama'>('mock');
  const [apiKey, setApiKey] = useState('');

  const mcpConfig = `{
  "mcpServers": {
    "saccade": {
      "command": "node",
      "args": ["/path/to/saccade/mcp/build/index.js"],
      "env": {
        "SACCADE_API_URL": "https://saccade.example.com",
        "SACCADE_API_KEY": "sk_saccade_..."
      }
    }
  }
}`;

  const tools = [
    { name: "get_master_profile", desc: "Retrieve candidate's canonical JSON data" },
    { name: "analyze_jd", desc: "Extract requirements from job description" },
    { name: "tailor_experience", desc: "Rewrite bullets to highlight relevant skills" },
    { name: "generate_latex", desc: "Convert JSON to valid LaTeX document" },
    { name: "compile_pdf", desc: "Render LaTeX to PDF via Saccade Engine" },
    { name: "write_cover_letter", desc: "Draft targeted cover letter based on JD" },
    { name: "check_ats_score", desc: "Validate keyword density and formatting" }
  ];

  return (
    <div className="max-w-[1600px] mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-[var(--text-2xl)] font-bold text-[var(--color-text-primary)]">Agent MCP Hub</h1>
        <p className="text-[var(--color-text-secondary)] mt-1">Connect your local desktop agents to the Saccade compilation engine.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-text-primary)]">
                    <Terminal size={20} />
                  </div>
                  <div>
                    <CardTitle>Claude Desktop Connection</CardTitle>
                    <CardDescription>Status of your local MCP server</CardDescription>
                  </div>
                </div>
                <Badge variant="warning">Disconnected</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)] mb-4">
                Saccade implements the Model Context Protocol (MCP) to allow your local AI assistants to autonomously draft, tailor, and compile your resumes without sending your PII to external servers.
              </p>
              <Button variant="secondary" className="w-full">
                <BookOpen size={16} className="mr-2" /> Read Setup Guide
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database size={18} className="text-[var(--color-accent)]" />
                <CardTitle>Exposed Tools</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tools.map((tool, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] gap-2">
                    <code className="text-[var(--text-xs)] font-mono text-[var(--color-accent)] font-medium">
                      {tool.name}
                    </code>
                    <span className="text-[var(--text-xs)] text-[var(--color-text-muted)] text-left sm:text-right">
                      {tool.desc}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuration snippet</CardTitle>
              <CardDescription>Add this to your claude_desktop_config.json</CardDescription>
            </CardHeader>
            <CardContent>
              <CodeBlock code={mcpConfig} language="json" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock size={18} className="text-[var(--color-accent)]" />
                <CardTitle>Bring Your Own Keys</CardTitle>
              </div>
              <CardDescription>Configure the LLM provider for the web studio tailoring agent.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'mock', label: 'Mock (Free)' },
                  { id: 'anthropic', label: 'Anthropic' },
                  { id: 'openai', label: 'OpenAI' },
                  { id: 'ollama', label: 'Ollama (Local)' }
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => setProvider(p.id as any)}
                    className={`p-3 rounded-lg border text-[var(--text-sm)] font-medium transition-all ${
                      provider === p.id 
                        ? 'border-[var(--color-accent)] bg-[var(--color-accent-subtle)] text-[var(--color-accent)] shadow-[var(--shadow-glow)]' 
                        : 'border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-muted)]'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {provider !== 'mock' && provider !== 'ollama' && (
                <div className="space-y-4 pt-4 border-t border-[var(--color-border)]">
                  <Input 
                    type="password" 
                    label="API Key" 
                    placeholder={`sk-${provider}-...`}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    icon={<Key size={16} />}
                    helperText="Stored locally in your browser. Never sent to our servers."
                  />
                  <Button className="w-full">Save Key</Button>
                </div>
              )}
              
              {provider === 'ollama' && (
                <div className="space-y-4 pt-4 border-t border-[var(--color-border)]">
                  <Input 
                    label="Ollama Server URL" 
                    defaultValue="http://localhost:11434"
                    icon={<Zap size={16} />}
                  />
                  <Input 
                    label="Model Name" 
                    defaultValue="llama3"
                  />
                  <Button className="w-full">Connect</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
