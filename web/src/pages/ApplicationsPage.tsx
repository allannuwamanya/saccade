import React from 'react';
import { Plus, Download, ExternalLink, Target, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Stat } from '../components/ui/Stat';
import { EmptyState } from '../components/ui/EmptyState';
import type { Page } from '../App';

interface ApplicationsPageProps {
  onNavigate: (page: Page) => void;
}

export const ApplicationsPage = ({ onNavigate }: ApplicationsPageProps) => {
  const hasApplications = true; // Mock state

  return (
    <div className="max-w-[1600px] mx-auto p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[var(--text-2xl)] font-bold text-[var(--color-text-primary)]">Applications</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">Track tailored resumes and cover letters.</p>
        </div>
        <Button onClick={() => onNavigate('studio')}>
          <Plus size={16} className="mr-2" /> New Application
        </Button>
      </div>

      {hasApplications ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Stat 
              label="Total Applications" 
              value="12" 
              icon={<Target />} 
              trend={{ value: '3 this week', isPositive: true }} 
            />
            <Stat 
              label="Average ATS Score" 
              value="92%" 
              icon={<CheckCircle2 className="text-[var(--color-success)]" />} 
              trend={{ value: '+4%', isPositive: true }} 
            />
            <Stat 
              label="Active Pipeline" 
              value="5" 
              icon={<Clock className="text-[var(--color-warning)]" />} 
            />
          </div>

          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
                  <th className="py-3 px-6 text-[var(--text-xs)] font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Company / Role</th>
                  <th className="py-3 px-6 text-[var(--text-xs)] font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Theme</th>
                  <th className="py-3 px-6 text-[var(--text-xs)] font-medium text-[var(--color-text-muted)] uppercase tracking-wider">ATS Match</th>
                  <th className="py-3 px-6 text-[var(--text-xs)] font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Date</th>
                  <th className="py-3 px-6 text-[var(--text-xs)] font-medium text-[var(--color-text-muted)] uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {[
                  { company: 'Stripe', role: 'Frontend Engineer', theme: 'Modern', ats: 94, date: 'Oct 24, 2023' },
                  { company: 'Vercel', role: 'Staff Software Engineer', theme: 'Executive', ats: 88, date: 'Oct 21, 2023' },
                  { company: 'Linear', role: 'Product Engineer', theme: 'Classic', ats: 91, date: 'Oct 15, 2023' },
                ].map((app, i) => (
                  <tr key={i} className="hover:bg-[var(--color-surface-2)]/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-medium text-[var(--color-text-primary)]">{app.company}</div>
                      <div className="text-[var(--text-sm)] text-[var(--color-text-muted)]">{app.role}</div>
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant="default" size="sm">{app.theme}</Badge>
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={app.ats > 90 ? 'success' : 'warning'} size="sm">{app.ats}%</Badge>
                    </td>
                    <td className="py-4 px-6 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
                      {app.date}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Download Cover Letter">
                          <Download size={14} />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Open PDF">
                          <ExternalLink size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <EmptyState
          icon={<Target size={24} />}
          title="No applications yet"
          description="Tailor your first resume in the Studio to start tracking your applications."
          action={
            <Button onClick={() => onNavigate('studio')}>Launch Studio</Button>
          }
        />
      )}
    </div>
  );
};
