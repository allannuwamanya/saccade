import React from 'react';
import {
  Activity,
  TrendingUp,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  PieChart,
  Layers,
  Sparkles
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';

export const AnalyticsPage: React.FC = () => {
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
          <div className="text-3xl font-extrabold text-white mt-1">33.3%</div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
            <ArrowUpRight size={13} /> +12% above industry avg
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="text-xs uppercase font-semibold text-[var(--color-text-muted)] tracking-wider">Avg ATS Screener Score</div>
          <div className="text-3xl font-extrabold text-emerald-400 mt-1">92.4%</div>
          <div className="text-xs text-[var(--color-text-muted)] mt-1">Tectonic micro-typeset</div>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="text-xs uppercase font-semibold text-[var(--color-text-muted)] tracking-wider">Interview Conversion</div>
          <div className="text-3xl font-extrabold text-indigo-400 mt-1">50.0%</div>
          <div className="text-xs text-[var(--color-text-muted)] mt-1">Screen → Onsite ratio</div>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="text-xs uppercase font-semibold text-[var(--color-text-muted)] tracking-wider">Avg Turnaround Time</div>
          <div className="text-3xl font-extrabold text-amber-400 mt-1">4.2 Days</div>
          <div className="text-xs text-[var(--color-text-muted)] mt-1">From apply to first touch</div>
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
              High-frequency keywords in target jobs where your master profile has low evidence density
            </p>
          </div>
          <Badge variant="warning" size="sm">3 Opportunities</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-white">Kubernetes / K8s</span>
              <span className="text-xs text-amber-400 font-mono">Found in 4 JDs</span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              Requested in Stripe & Vercel roles. Add an atomic fact detailing container orchestration or cluster upgrades.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-white">Distributed Tracing (OpenTelemetry)</span>
              <span className="text-xs text-amber-400 font-mono">Found in 3 JDs</span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              Requested in Staff Platform roles. Mention observability pipelines or APM telemetry in experience.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-white">TypeScript Strict Mode</span>
              <span className="text-xs text-emerald-400 font-mono">100% Covered</span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              Strong alignment. Your master profile demonstrates comprehensive type system expertise.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
