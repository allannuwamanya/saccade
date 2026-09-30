import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileCode2,
  TrendingUp,
  FolderKanban,
  FileText,
  Lock,
  Plus,
  Terminal,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { SupabaseService, Project, RecentActivityItem } from '../services/supabase';
import type { Page } from '../App';

interface HomePageProps {
  onNavigate: (page: Page) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activities, setActivities] = useState<RecentActivityItem[]>([]);
  const isDbConfigured = SupabaseService.isConfigured();

  useEffect(() => {
    setProjects(SupabaseService.getProjects());
    setActivities(SupabaseService.getActivities());
  }, []);

  const activeProjects = projects.slice(0, 3);
  const avgAts = projects.length
    ? Math.round(projects.reduce((acc, p) => acc + (p.latestAtsScore || 0), 0) / projects.length)
    : 0;

  return (
    <div className="max-w-[1600px] mx-auto p-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[var(--color-border-subtle)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-[var(--text-3xl)] font-bold tracking-tight text-[var(--color-text-primary)]">
              Command Center
            </h1>
            <Badge variant="accent" size="sm">v2.1</Badge>
          </div>
          <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)]">
            Jump back into active application projects, recent compiles, and career intelligence.
          </p>
        </div>

        {/* Engine Status Indicators */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-xs text-[var(--color-text-secondary)]">
            <span className="w-2 h-2 rounded-full bg-[var(--color-success)] animate-pulse" />
            <span className="font-mono">Tectonic LaTeX: Active</span>
          </div>

          <button
            onClick={() => onNavigate('settings')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)] transition-colors text-xs text-[var(--color-text-secondary)]"
          >
            <span className={`w-2 h-2 rounded-full ${isDbConfigured ? 'bg-[var(--color-success)]' : 'bg-[var(--color-warning)]'}`} />
            <span>Database: {isDbConfigured ? 'Supabase Connected' : 'Local Sandbox'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-between">
          <div>
            <div className="text-xs uppercase font-semibold text-[var(--color-text-muted)] tracking-wider">Active Pipeline</div>
            <div className="text-2xl font-bold text-[var(--color-text-primary)] mt-1">{projects.length} Applications</div>
            <div className="text-xs text-[var(--color-success)] mt-1 flex items-center gap-1">
              <TrendingUp size={12} /> 2 advanced to interview
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[var(--color-accent-subtle)] text-[var(--color-accent)] flex items-center justify-center">
            <FolderKanban size={20} />
          </div>
        </div>

        <div className="p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-between">
          <div>
            <div className="text-xs uppercase font-semibold text-[var(--color-text-muted)] tracking-wider">Average ATS Score</div>
            <div className="text-2xl font-bold text-[var(--color-text-primary)] mt-1">{avgAts}% Match</div>
            <div className="text-xs text-[var(--color-text-secondary)] mt-1">High passing threshold</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-between">
          <div>
            <div className="text-xs uppercase font-semibold text-[var(--color-text-muted)] tracking-wider">Pending Follow-ups</div>
            <div className="text-2xl font-bold text-amber-400 mt-1">1 Overdue</div>
            <div className="text-xs text-[var(--color-text-secondary)] mt-1">Stripe 7-day rule timer</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Clock size={20} />
          </div>
        </div>

        <div className="p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-between">
          <div>
            <div className="text-xs uppercase font-semibold text-[var(--color-text-muted)] tracking-wider">Compiled Artifacts</div>
            <div className="text-2xl font-bold text-[var(--color-text-primary)] mt-1">6 PDFs / .tex</div>
            <div className="text-xs text-[var(--color-text-secondary)] mt-1">Vector PDF typeset</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <FileCode2 size={20} />
          </div>
        </div>
      </div>

      {/* Main 2-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Projects & Recent Compiles - 2 cols span) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Active Projects / Continue Working */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Continue Working & Active Drafts</h2>
                <p className="text-xs text-[var(--color-text-muted)]">Jump directly back into your tailored applications and editing sessions.</p>
              </div>
              <Button size="sm" onClick={() => onNavigate('studio')}>
                <Plus size={14} className="mr-1.5" /> New Application
              </Button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {activeProjects.map((project) => (
                <div
                  key={project.id}
                  className="p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-accent)] transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-semibold text-white text-base truncate">{project.company}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {project.isLocked && (
                          <span title="Submitted Application: Documents Frozen" className="flex items-center text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                            <Lock size={10} className="mr-1" /> Frozen
                          </span>
                        )}
                        <Badge variant={project.status === 'interview' ? 'success' : 'accent'} size="sm">
                          {project.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-sm text-[var(--color-text-secondary)] font-medium mb-3">{project.role}</p>

                    <div className="text-xs text-[var(--color-text-muted)] line-clamp-2 mb-4">
                      {project.jobDescription}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[var(--color-border-subtle)] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--color-surface-2)] text-emerald-400 font-bold border border-emerald-500/20">
                        {project.latestAtsScore}% ATS
                      </span>
                      <span className="text-[11px] text-[var(--color-text-muted)]">{project.updatedAt}</span>
                    </div>

                    <button
                      onClick={() => onNavigate('studio')}
                      className="text-xs font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                    >
                      Open in Studio <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Edits & Compiles Timeline */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Recent Edits & Compile Feed</h2>
                <p className="text-xs text-[var(--color-text-muted)]">Live changelog of your LaTeX compilations, ATS tailors, and document freezing.</p>
              </div>
              <button
                onClick={() => onNavigate('documents')}
                className="text-xs text-[var(--color-text-secondary)] hover:text-white flex items-center gap-1"
              >
                View Library <ChevronRight size={14} />
              </button>
            </div>

            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] divide-y divide-[var(--color-border-subtle)]">
              {activities.map((act) => (
                <div key={act.id} className="p-4 flex items-start gap-4 hover:bg-[var(--color-surface-2)]/40 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center shrink-0 text-[var(--color-accent)] mt-0.5">
                    {act.activityType === 'compile_latex' ? <FileCode2 size={16} /> : act.activityType === 'tailor_resume' ? <Sparkles size={16} /> : <Lock size={16} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{act.title}</span>
                      <span className="text-xs text-[var(--color-text-muted)] shrink-0">{act.timestamp}</span>
                    </div>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{act.detail}</p>
                  </div>

                  {act.badge && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--color-surface-2)] text-[var(--color-text-muted)] shrink-0 border border-[var(--color-border)]">
                      {act.badge}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Quick Actions, Follow-ups, Integrity) */}
        <div className="space-y-6">
          {/* Quick Launcher Card */}
          <div className="p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">Quick Actions</h3>

            <div className="space-y-2">
              <button
                onClick={() => onNavigate('studio')}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)]/60 hover:bg-[var(--color-surface-2)] hover:border-[var(--color-accent)] transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded bg-[var(--color-accent)]/20 text-[var(--color-accent)] flex items-center justify-center">
                    <Sparkles size={15} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">AI Tailor New Job</div>
                    <div className="text-[11px] text-[var(--color-text-muted)]">Paste JD & compile PDF</div>
                  </div>
                </div>
                <ChevronRight size={14} className="text-[var(--color-text-muted)]" />
              </button>

              <button
                onClick={() => onNavigate('knowledge-base')}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)]/60 hover:bg-[var(--color-surface-2)] hover:border-[var(--color-accent)] transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 size={15} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">Add Achievement / Metric</div>
                    <div className="text-[11px] text-[var(--color-text-muted)]">Enrich truth knowledge base</div>
                  </div>
                </div>
                <ChevronRight size={14} className="text-[var(--color-text-muted)]" />
              </button>

              <button
                onClick={() => onNavigate('templates')}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)]/60 hover:bg-[var(--color-surface-2)] hover:border-[var(--color-accent)] transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded bg-purple-500/20 text-purple-400 flex items-center justify-center">
                    <FileText size={15} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">Browse LaTeX Themes</div>
                    <div className="text-[11px] text-[var(--color-text-muted)]">Modern, Classic, Executive</div>
                  </div>
                </div>
                <ChevronRight size={14} className="text-[var(--color-text-muted)]" />
              </button>
            </div>
          </div>

          {/* Follow-up Reminder Box */}
          <div className="p-5 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-3">
            <div className="flex items-center gap-2 text-amber-400">
              <AlertCircle size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Follow-up Due</span>
            </div>
            <div className="text-sm font-semibold text-white">Stripe Staff Frontend Engineer</div>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              Applied 8 business days ago. Send follow-up note to recruiter Sarah Chen.
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="w-full text-xs"
              onClick={() => onNavigate('companies')}
            >
              Open Recruiter CRM
            </Button>
          </div>

          {/* Profile Truth Anchor Card */}
          <div className="p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Truth Integrity</span>
              <span className="text-xs font-mono font-bold text-emerald-400">88% Complete</span>
            </div>
            <div className="w-full h-2 bg-[var(--color-surface-2)] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full" style={{ width: '88%' }} />
            </div>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
              Anchored to <strong>Alex Mercer Canonical</strong>. 3 projects and 47 atomic verified achievements active.
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs justify-center"
              onClick={() => onNavigate('profile')}
            >
              Edit Master Profile
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
