import React, { useState, useEffect } from 'react';
import {
  Kanban,
  Table as TableIcon,
  Plus,
  Lock,
  ArrowRight,
  ExternalLink,
  Target,
  CheckCircle2,
  Clock,
  Sparkles,
  Building2,
  ChevronRight
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Stat } from '../components/ui/Stat';
import { SupabaseService, Project } from '../services/supabase';
import type { Page } from '../App';

interface ApplicationsPageProps {
  onNavigate: (page: Page) => void;
}

const KANBAN_STAGES: { id: Project['status']; title: string; color: string }[] = [
  { id: 'bookmarked', title: 'Bookmarked', color: 'border-zinc-700' },
  { id: 'applied', title: 'Applied (Locked)', color: 'border-indigo-500/50' },
  { id: 'screen', title: 'Phone Screen', color: 'border-blue-500/50' },
  { id: 'interview', title: 'Interviewing', color: 'border-amber-500/50' },
  { id: 'offer', title: 'Offer Stage', color: 'border-emerald-500/50' },
];

export const ApplicationsPage: React.FC<ApplicationsPageProps> = ({ onNavigate }) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    setProjects(SupabaseService.getProjects());
  }, []);

  const handleAdvanceStage = (project: Project) => {
    const stageFlow: Project['status'][] = ['bookmarked', 'applied', 'screen', 'interview', 'offer'];
    const currentIdx = stageFlow.indexOf(project.status);
    if (currentIdx >= 0 && currentIdx < stageFlow.length - 1) {
      const nextStage = stageFlow[currentIdx + 1];
      const updated: Project = {
        ...project,
        status: nextStage,
        isLocked: nextStage !== 'bookmarked', // Lock documents on and after application
        updatedAt: 'Just now',
      };
      SupabaseService.saveProject(updated);
      setProjects(SupabaseService.getProjects());
    }
  };

  const avgAts = projects.length
    ? Math.round(projects.reduce((acc, p) => acc + (p.latestAtsScore || 0), 0) / projects.length)
    : 0;

  return (
    <div className="max-w-[1600px] mx-auto p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[var(--color-border-subtle)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-[var(--text-3xl)] font-bold tracking-tight text-[var(--color-text-primary)]">
              Projects & Application Pipeline
            </h1>
            <Badge variant="accent" size="sm">{projects.length} Total</Badge>
          </div>
          <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)]">
            Kanban workflow tracking your tailored resume submissions. Submitted applications are permanently frozen to preserve interview integrity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex items-center p-1 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'text-[var(--color-text-secondary)] hover:text-white'
              }`}
            >
              <Kanban size={14} /> Kanban
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                viewMode === 'table'
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'text-[var(--color-text-secondary)] hover:text-white'
              }`}
            >
              <TableIcon size={14} /> Table
            </button>
          </div>

          <Button onClick={() => onNavigate('studio')}>
            <Plus size={16} className="mr-1.5" /> New Application
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Stat
          label="Total Active Applications"
          value={projects.length.toString()}
          icon={<Target />}
          trend={{ value: '3 this week', isPositive: true }}
        />
        <Stat
          label="Average ATS Screener Score"
          value={`${avgAts}%`}
          icon={<CheckCircle2 className="text-[var(--color-success)]" />}
          trend={{ value: '+4% vs last mo', isPositive: true }}
        />
        <Stat
          label="Interviews Scheduled"
          value={projects.filter((p) => p.status === 'interview').length.toString()}
          icon={<Clock className="text-amber-400" />}
        />
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {KANBAN_STAGES.map((stage) => {
            const stageProjects = projects.filter((p) => p.status === stage.id);

            return (
              <div
                key={stage.id}
                className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/60 p-4 flex flex-col min-w-[260px] space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border-subtle)]">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">{stage.title}</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-muted)] font-semibold">
                    {stageProjects.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1">
                  {stageProjects.length === 0 ? (
                    <div className="h-32 rounded-xl border border-dashed border-[var(--color-border-subtle)] flex items-center justify-center text-xs text-[var(--color-text-muted)]">
                      No applications
                    </div>
                  ) : (
                    stageProjects.map((project) => (
                      <div
                        key={project.id}
                        className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-accent)] transition-all flex flex-col justify-between shadow-sm space-y-3"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-1 mb-1">
                            <span className="font-bold text-sm text-white">{project.company}</span>
                            {project.isLocked && (
                              <span
                                title="Frozen Snapshot: Document locked for interview fidelity"
                                className="flex items-center text-[10px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20"
                              >
                                <Lock size={9} className="mr-0.5" /> Frozen
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-[var(--color-text-secondary)] font-medium">
                            {project.role}
                          </div>

                          {project.targetSalary && (
                            <div className="text-[11px] text-[var(--color-text-muted)] mt-1">
                              {project.targetSalary}
                            </div>
                          )}
                        </div>

                        <div className="pt-2 border-t border-[var(--color-border-subtle)] flex items-center justify-between">
                          {project.latestAtsScore ? (
                            <span className="text-xs font-mono font-bold text-emerald-400">
                              {project.latestAtsScore}% ATS
                            </span>
                          ) : (
                            <span className="text-xs text-[var(--color-text-muted)]">Draft</span>
                          )}

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleAdvanceStage(project)}
                              title="Advance to next pipeline stage"
                              className="p-1 rounded bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:text-white border border-[var(--color-border)] text-xs flex items-center"
                            >
                              <ArrowRight size={12} />
                            </button>
                            <button
                              onClick={() => onNavigate('studio')}
                              title="Open in Studio"
                              className="p-1 rounded bg-[var(--color-surface-2)] text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] border border-[var(--color-border)] text-xs flex items-center"
                            >
                              <ExternalLink size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-2)]/60 text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-6">Company & Role</th>
                <th className="py-3.5 px-6">Pipeline Stage</th>
                <th className="py-3.5 px-6">State Lock</th>
                <th className="py-3.5 px-6">ATS Match</th>
                <th className="py-3.5 px-6">Target Comp</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-subtle)] text-xs">
              {projects.map((proj) => (
                <tr key={proj.id} className="hover:bg-[var(--color-surface-2)]/30 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-bold text-white text-sm">{proj.company}</div>
                    <div className="text-[var(--color-text-muted)] mt-0.5">{proj.role}</div>
                  </td>
                  <td className="py-4 px-6">
                    <Badge variant={proj.status === 'interview' ? 'success' : 'accent'} size="sm">
                      {proj.status.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="py-4 px-6">
                    {proj.isLocked ? (
                      <span className="inline-flex items-center text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                        <Lock size={11} className="mr-1" /> Frozen
                      </span>
                    ) : (
                      <span className="text-[var(--color-text-muted)]">Editable Draft</span>
                    )}
                  </td>
                  <td className="py-4 px-6 font-mono font-bold text-emerald-400">
                    {proj.latestAtsScore ? `${proj.latestAtsScore}%` : '-'}
                  </td>
                  <td className="py-4 px-6 text-[var(--color-text-secondary)] font-mono">
                    {proj.targetSalary || '-'}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="text-xs h-8"
                        onClick={() => handleAdvanceStage(proj)}
                      >
                        Advance Stage
                      </Button>
                      <Button
                        size="sm"
                        className="text-xs h-8"
                        onClick={() => onNavigate('studio')}
                      >
                        Open Studio
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
