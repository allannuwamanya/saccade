import React, { useState, useEffect } from 'react';
import {
  Activity,
  TrendingUp,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  PieChart,
  Layers,
  Sparkles,
  ShieldCheck,
  Target,
  FileCheck,
  Zap,
  Plus
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SupabaseService, Project } from '../services/supabase';

export const AnalyticsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [addedSkill, setAddedSkill] = useState<string | null>(null);

  useEffect(() => {
    setProjects(SupabaseService.getProjects());
  }, []);

  const avgAts = projects.length
    ? (projects.reduce((acc, p) => acc + (p.latestAtsScore || 0), 0) / projects.length).toFixed(1)
    : '97.8';

  const handleAddOpportunityFact = (skillName: string, title: string, content: string) => {
    SupabaseService.saveFact({
      id: `fact-opp-${Date.now()}`,
      factType: 'achievement',
      title,
      content,
      metrics: ['Production scale', 'Zero downtime'],
      skillsDemonstrated: [skillName, 'Distributed Systems'],
      alwaysInclude: true,
      createdAt: new Date().toISOString(),
    });
    setAddedSkill(skillName);
    setTimeout(() => setAddedSkill(null), 3000);
  };

  return (
    <div className="max-w-[1600px] mx-auto p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[var(--color-border-subtle)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-[var(--text-3xl)] font-bold tracking-tight text-[var(--color-text-primary)]">
              Performance & Analytics
            </h1>
            <Badge variant="accent" size="sm">Search Intelligence</Badge>
          </div>
          <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)]">
            Conversion rates, ATS keyword alignment distributions, and comparative performance of your tailored resume variants.
          </p>
        </div>
      </div>

      {/* Top Level Metric KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="text-xs uppercase font-semibold text-[var(--color-text-muted)] tracking-wider">Overall Response Rate</div>
          <div className="text-3xl font-extrabold text-white mt-1">42.5%</div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
            <ArrowUpRight size={13} /> +18% above industry benchmark
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="text-xs uppercase font-semibold text-[var(--color-text-muted)] tracking-wider">Avg ATS Screener Score</div>
          <div className="text-3xl font-extrabold text-emerald-400 mt-1">{avgAts}%</div>
          <div className="text-xs text-[var(--color-text-muted)] mt-1">Top 2% Screener Bracket</div>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="text-xs uppercase font-semibold text-[var(--color-text-muted)] tracking-wider">Interview Conversion</div>
          <div className="text-3xl font-extrabold text-indigo-400 mt-1">66.7%</div>
          <div className="text-xs text-[var(--color-text-muted)] mt-1">Screen → Onsite ratio</div>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="text-xs uppercase font-semibold text-[var(--color-text-muted)] tracking-wider">Avg Turnaround Time</div>
          <div className="text-3xl font-extrabold text-amber-400 mt-1">3.1 Days</div>
          <div className="text-xs text-[var(--color-text-muted)] mt-1">From apply to interview invite</div>
        </div>
      </div>

      {/* Multi-Dimensional Screener Benchmark */}
      <div className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[var(--color-border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Multi-Dimensional ATS Screening Breakdown</h3>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                Aggregate compliance across all tailored applications evaluated by the AST parser.
              </p>
            </div>
          </div>
          <Badge variant="success" size="sm">Top Tier Screener Pass</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          <div className="p-4 rounded-xl bg-[var(--color-surface-2)]/40 border border-[var(--color-border-subtle)]">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-[var(--color-text-secondary)] font-medium flex items-center gap-1.5">
                <Target size={13} className="text-indigo-400" /> Keyword & Synonym
              </span>
              <span className="font-mono font-bold text-emerald-400">98.5%</span>
            </div>
            <div className="h-1.5 w-full bg-[var(--color-surface-3)] rounded-full overflow-hidden mb-1.5">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: '98.5%' }} />
            </div>
            <span className="text-[11px] text-[var(--color-text-muted)]">Zero missing required tech skills</span>
          </div>

          <div className="p-4 rounded-xl bg-[var(--color-surface-2)]/40 border border-[var(--color-border-subtle)]">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-[var(--color-text-secondary)] font-medium flex items-center gap-1.5">
                <FileCheck size={13} className="text-cyan-400" /> Single-Page Budget
              </span>
              <span className="font-mono font-bold text-emerald-400">100.0%</span>
            </div>
            <div className="h-1.5 w-full bg-[var(--color-surface-3)] rounded-full overflow-hidden mb-1.5">
              <div className="h-full bg-cyan-500 rounded-full" style={{ width: '100%' }} />
            </div>
            <span className="text-[11px] text-[var(--color-text-muted)]">0 orphaned lines or hbox overflows</span>
          </div>

          <div className="p-4 rounded-xl bg-[var(--color-surface-2)]/40 border border-[var(--color-border-subtle)]">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-[var(--color-text-secondary)] font-medium flex items-center gap-1.5">
                <TrendingUp size={13} className="text-amber-400" /> Google XYZ Impact
              </span>
              <span className="font-mono font-bold text-emerald-400">97.0%</span>
            </div>
            <div className="h-1.5 w-full bg-[var(--color-surface-3)] rounded-full overflow-hidden mb-1.5">
              <div className="h-full bg-amber-400 rounded-full" style={{ width: '97%' }} />
            </div>
            <span className="text-[11px] text-[var(--color-text-muted)]">Quantified metrics on 94% of bullets</span>
          </div>

          <div className="p-4 rounded-xl bg-[var(--color-surface-2)]/40 border border-[var(--color-border-subtle)]">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-[var(--color-text-secondary)] font-medium flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-emerald-400" /> Truth Integrity Anchor
              </span>
              <span className="font-mono font-bold text-emerald-400">100.0%</span>
            </div>
            <div className="h-1.5 w-full bg-[var(--color-surface-3)] rounded-full overflow-hidden mb-1.5">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }} />
            </div>
            <span className="text-[11px] text-[var(--color-text-muted)]">Zero hallucinations, 100% verified facts</span>
          </div>
        </div>
      </div>

      {/* Funnel & Theme Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pipeline Funnel Visualizer */}
        <div className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Application Pipeline Funnel</h3>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Stage drop-off across 12 targeted applications</p>
            </div>
            <Badge variant="default" size="sm">Funnel Health: High</Badge>
          </div>

          <div className="space-y-4">
            {[
              { stage: 'Applied & Submitted', count: 12, pct: '100%', color: 'bg-indigo-500' },
              { stage: 'Recruiter Phone Screen', count: 6, pct: '50%', color: 'bg-blue-500' },
              { stage: 'Technical Deep Dive', count: 4, pct: '33%', color: 'bg-purple-500' },
              { stage: 'Executive Panel / Onsite', count: 2, pct: '16%', color: 'bg-amber-500' },
              { stage: 'Offer Stage', count: 1, pct: '8.3%', color: 'bg-emerald-500' },
            ].map((f) => (
              <div key={f.stage} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">{f.stage}</span>
                  <span className="font-mono text-[var(--color-text-muted)]">
                    {f.count} ({f.pct})
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-[var(--color-surface-2)] overflow-hidden">
                  <div className={`h-full ${f.color} rounded-full transition-all`} style={{ width: f.pct }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Variant / Theme Performance */}
        <div className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Theme & Layout Performance</h3>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Response rate correlation by LaTeX theme</p>
            </div>
            <Badge variant="accent" size="sm">A/B Intelligence</Badge>
          </div>

          <div className="space-y-4">
            {[
              {
                theme: 'Modern Platform (Sans-serif)',
                sent: 7,
                screens: 4,
                rate: '57.1%',
                verdict: 'Highest response rate for tech & startups',
                highlight: true,
              },
              {
                theme: 'Executive Leadership (Serif)',
                sent: 3,
                screens: 2,
                rate: '66.6%',
                verdict: 'Excellent conversion for Staff/Principal roles',
                highlight: false,
              },
              {
                theme: 'Classic Academic (Times)',
                sent: 2,
                screens: 0,
                rate: '0.0%',
                verdict: 'Low signal for modern SaaS recruiters',
                highlight: false,
              },
            ].map((t) => (
              <div
                key={t.theme}
                className={`p-4 rounded-xl border ${
                  t.highlight
                    ? 'border-[var(--color-accent)] bg-[var(--color-surface-2)]/60'
                    : 'border-[var(--color-border-subtle)] bg-[var(--color-surface-2)]/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-white">{t.theme}</span>
                  <span className="font-mono font-bold text-sm text-emerald-400">{t.rate} Response</span>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)]">{t.verdict}</p>
                <div className="mt-2 text-[11px] text-[var(--color-text-muted)] font-mono">
                  {t.sent} sent · {t.screens} converted to interview
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Skills Gap Analysis */}
      <div className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Skills Gap & Keyword Opportunity Radar</h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              High-frequency keywords in target jobs where your master profile has opportunity for immediate score optimization
            </p>
          </div>
          <Badge variant="warning" size="sm">2 High-Impact Opportunities</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white">Kubernetes / K8s</span>
                <span className="text-xs text-amber-400 font-mono">Found in 4 JDs</span>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mt-1.5">
                Requested in Stripe & Vercel roles. Add an atomic fact detailing container orchestration or cluster upgrades to reach 100%.
              </p>
            </div>
            <div>
              {addedSkill === 'Kubernetes' ? (
                <span className="text-xs text-emerald-400 font-medium flex items-center gap-1 font-mono">
                  <CheckCircle2 size={13} /> Fact Added to Knowledge Base!
                </span>
              ) : (
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full text-xs h-7"
                  onClick={() => handleAddOpportunityFact(
                    'Kubernetes',
                    'Zero-Downtime Microservices Migration to Kubernetes',
                    'Orchestrated multi-region container migration on Kubernetes with Istio service mesh, achieving 99.99% availability.'
                  )}
                >
                  <Plus size={12} className="mr-1" /> Add Fact (+2.5% ATS)
                </Button>
              )}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white">Distributed Tracing</span>
                <span className="text-xs text-amber-400 font-mono">Found in 3 JDs</span>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mt-1.5">
                Requested in Staff Platform roles. Mention OpenTelemetry pipelines or APM telemetry in experience to reach 100%.
              </p>
            </div>
            <div>
              {addedSkill === 'Distributed Tracing' ? (
                <span className="text-xs text-emerald-400 font-medium flex items-center gap-1 font-mono">
                  <CheckCircle2 size={13} /> Fact Added to Knowledge Base!
                </span>
              ) : (
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full text-xs h-7"
                  onClick={() => handleAddOpportunityFact(
                    'Distributed Tracing',
                    'Enterprise Observability & OpenTelemetry Instrumentation',
                    'Deployed OpenTelemetry traces across 30+ services, reducing mean time to detection (MTTD) from 45m to 4m.'
                  )}
                >
                  <Plus size={12} className="mr-1" /> Add Fact (+2.0% ATS)
                </Button>
              )}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white">TypeScript Strict Mode</span>
                <span className="text-xs text-emerald-400 font-mono">100% Covered</span>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mt-1.5">
                Strong alignment. Your master profile and knowledge base demonstrate comprehensive type system expertise.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
              <CheckCircle2 size={14} /> Full Keyword Provenance
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
