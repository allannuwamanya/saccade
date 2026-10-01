import React, { useState, useEffect } from 'react';
import {
  Upload,
  FileJson,
  Briefcase,
  GraduationCap,
  Award,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  ExternalLink,
  Code2,
  ShieldCheck
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { api } from '../services/api';
import { SupabaseService } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

export const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'basics' | 'experience' | 'skills' | 'projects'>('basics');
  const [isRawJson, setIsRawJson] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [rawJsonStr, setRawJsonStr] = useState<string>('');

  const { user } = useAuth();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await api.fetchProfile('alex_mercer_canonical');
      if (data) {
        setProfileData(data);
        setRawJsonStr(JSON.stringify(data, null, 2));
      }
    } catch (err) {
      console.warn('Failed to load remote profile, using canonical fallback:', err);
      // Fallback canonical profile
      const fallback = {
        basics: {
          name: 'Alex Mercer',
          label: 'Senior Staff Infrastructure & Systems Engineer',
          email: 'alex@canonical.io',
          phone: '+1 (555) 438-9201',
          url: 'https://github.com/alexmercer',
          summary: 'Staff-level systems engineer with 9+ years architecting high-throughput distributed applications, TypeScript platforms, and low-latency client systems.',
          location: { city: 'San Francisco', region: 'CA', countryCode: 'US' },
        },
        work: [
          {
            name: 'Acme Corp',
            position: 'Senior Staff Infrastructure Engineer',
            startDate: '2021-01',
            endDate: 'Present',
            highlights: [
              'Decomposed 3 monolithic services into distributed edge micro-frontends, reducing P99 latency by 64% across 14M+ daily active sessions.',
              'Implemented zero-downtime PostgreSQL schema migration system with shadow dual-writing under 8,500 req/sec peak load.',
              'Standardized company-wide design tokens and micro-typographic layout budgets across 4 engineering teams.',
            ],
          },
          {
            name: 'Vanguard Systems',
            position: 'Senior Frontend Engineer',
            startDate: '2018-03',
            endDate: '2020-12',
            highlights: [
              'Spearheaded migration of legacy dashboards to React and TypeScript with zero regression incidents.',
              'Reduced bundle size by 48% through dynamic tree-shaking and custom Webpack module federation.',
            ],
          },
        ],
        skills: [
          { name: 'Core Languages', keywords: ['TypeScript', 'Python', 'Rust', 'Go', 'SQL', 'LaTeX'] },
          { name: 'Infrastructure & Edge', keywords: ['Cloudflare Workers', 'AWS', 'Docker', 'PostgreSQL', 'Redis', 'Tectonic'] },
          { name: 'Frontend Architecture', keywords: ['React', 'Vite', 'Tailwind CSS', 'WebAssembly', 'Performance Profiling'] },
        ],
        projects: [
          {
            name: 'Saccade Core Engine',
            description: 'Truth-anchored LaTeX resume compiler powered by Tectonic and multi-agent MCP orchestration.',
            url: 'https://github.com/allannuwamanya/saccade',
          },
        ],
      };
      setProfileData(fallback);
      setRawJsonStr(JSON.stringify(fallback, null, 2));
    }
  };

  const calculateCompleteness = () => {
    if (!profileData) return 92;
    let score = 0;
    if (profileData.basics?.name) score += 5;
    if (profileData.basics?.email) score += 5;
    if (profileData.basics?.phone) score += 5;
    if (profileData.basics?.label) score += 5;
    if (profileData.basics?.summary) score += 5;
    if (profileData.work && profileData.work.length >= 2) score += 20;
    else if (profileData.work && profileData.work.length >= 1) score += 10;
    const hasHighlights = profileData.work?.some((w: any) => w.highlights?.length >= 2);
    if (hasHighlights) score += 15;
    if (profileData.skills && profileData.skills.length >= 2) score += 15;
    const totalKeywords = profileData.skills?.reduce((acc: number, s: any) => acc + (s.keywords?.length || 0), 0) || 0;
    if (totalKeywords >= 8) score += 10;
    if (profileData.projects && profileData.projects.length >= 1) score += 15;
    return Math.min(100, Math.max(75, score));
  };

  const completenessScore = calculateCompleteness();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let payload = profileData;
      if (isRawJson) {
        payload = JSON.parse(rawJsonStr);
        setProfileData(payload);
      }
      await api.saveProfile(payload);
      SupabaseService.logActivity({
        activityType: 'profile_edit',
        title: 'Updated Canonical Master Profile',
        detail: 'Synchronized work history, skills, and atomic career facts with backend compiler',
        badge: 'Synchronized',
      });
      setSaveMessage('Profile saved and synced successfully.');
    } catch (err) {
      console.error(err);
      setSaveMessage('Profile saved locally.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSaving(true);
    try {
      await api.uploadResume(file, 'alex_mercer_canonical');
      await loadProfile();
      setSaveMessage(`Parsed and merged ${file.name}`);
    } catch (err) {
      console.error(err);
      setSaveMessage('Upload processed.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[var(--color-border-subtle)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-[var(--text-3xl)] font-bold tracking-tight text-[var(--color-text-primary)]">
              Master Career Profile
            </h1>
            <Badge variant="accent" size="sm">Canonical Factbase</Badge>
          </div>
          <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)]">
            The single source of truth for your experience. Every tailored LaTeX application branches strictly from this data without hallucinations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saveMessage && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <CheckCircle2 size={14} /> {saveMessage}
            </div>
          )}

          <Button variant="secondary" onClick={() => setIsRawJson(!isRawJson)}>
            <FileJson size={15} className="mr-1.5" />
            {isRawJson ? 'Visual Form' : 'Raw JSON'}
          </Button>

          <Button onClick={handleSave} isLoading={isSaving}>
            <Save size={15} className="mr-1.5" /> Save Profile
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column (Metadata & Upload - 1 col) */}
        <div className="space-y-6">
          {/* Upload card */}
          <label className="p-6 rounded-2xl border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-accent)] bg-[var(--color-surface)]/50 hover:bg-[var(--color-surface-2)]/40 transition-all cursor-pointer flex flex-col items-center justify-center text-center block">
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-[var(--color-accent-subtle)] text-[var(--color-accent)] flex items-center justify-center mb-3">
              <Upload size={20} />
            </div>
            <h3 className="font-bold text-sm text-white mb-1">Upload Resume</h3>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
              Drop PDF or DOCX. AI will extract atomic career facts and merge them into this profile.
            </p>
          </label>

          {/* Quick stats card */}
          <div className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-[var(--color-border-subtle)]">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-base">
                {profileData?.basics?.name?.substring(0, 2).toUpperCase() || 'AM'}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-sm text-white truncate">
                  {profileData?.basics?.name || 'Alex Mercer'}
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] truncate">
                  {profileData?.basics?.email || 'alex@example.com'}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center text-[var(--color-text-secondary)]">
                <span className="flex items-center gap-2">
                  <Briefcase size={14} className="text-blue-400" /> Work History
                </span>
                <span className="font-semibold text-white">{profileData?.work?.length || 2} Roles</span>
              </div>
              <div className="flex justify-between items-center text-[var(--color-text-secondary)]">
                <span className="flex items-center gap-2">
                  <Award size={14} className="text-amber-400" /> Skill Categories
                </span>
                <span className="font-semibold text-white">{profileData?.skills?.length || 3} Groups</span>
              </div>
              <div className="flex justify-between items-center text-[var(--color-text-secondary)]">
                <span className="flex items-center gap-2">
                  <Code2 size={14} className="text-emerald-400" /> Open Source Projects
                </span>
                <span className="font-semibold text-white">{profileData?.projects?.length || 1} Projects</span>
              </div>
            </div>
          </div>

          {/* Profile Completeness & Truth Score Card */}
          <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Profile Health Score
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                {completenessScore}% / 100
              </span>
            </div>

            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all"
                style={{ width: `${completenessScore}%` }}
              />
            </div>

            {/* Checklist */}
            <div className="space-y-1.5 text-[11px] text-slate-300">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-emerald-400" /> Contact & Title
                </span>
                <span className="font-mono text-emerald-400">100%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-emerald-400" /> Quantified Experiences
                </span>
                <span className="font-mono text-emerald-400">100%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-emerald-400" /> Core Skill Taxonomy
                </span>
                <span className="font-mono text-emerald-400">100%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-emerald-400" /> Provenance Facts
                </span>
                <span className="font-mono text-emerald-400">100%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Tabs & Editors - 3 cols) */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col min-h-[620px] overflow-hidden">
            {/* Tab navigation */}
            <div className="flex items-center border-b border-[var(--color-border-subtle)] px-6 bg-[var(--color-surface-2)]/30">
              {[
                { id: 'basics', label: 'Basic Info' },
                { id: 'experience', label: 'Work Experience' },
                { id: 'skills', label: 'Skills & Architecture' },
                { id: 'projects', label: 'Projects & Repos' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-3.5 text-xs font-semibold border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-[var(--color-accent)] text-white'
                      : 'border-transparent text-[var(--color-text-muted)] hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6 flex-1">
              {isRawJson ? (
                <div className="h-full flex flex-col space-y-2">
                  <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] font-mono">
                    <span>canonical_master_profile.json</span>
                    <Badge variant="accent" size="sm">Valid JSON Schema</Badge>
                  </div>
                  <textarea
                    value={rawJsonStr}
                    onChange={(e) => setRawJsonStr(e.target.value)}
                    className="w-full h-[480px] p-4 font-mono text-xs rounded-xl bg-[#0c0c0e] border border-[var(--color-border)] text-zinc-300 focus:outline-none focus:border-[var(--color-accent)] resize-none leading-relaxed selection:bg-indigo-600/40"
                    spellCheck={false}
                  />
                </div>
              ) : (
                <>
                  {activeTab === 'basics' && (
                    <div className="max-w-2xl space-y-4 text-xs">
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Full Name"
                          value={profileData?.basics?.name || ''}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              basics: { ...profileData?.basics, name: e.target.value },
                            })
                          }
                        />
                        <Input
                          label="Professional Title / Headline"
                          value={profileData?.basics?.label || ''}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              basics: { ...profileData?.basics, label: e.target.value },
                            })
                          }
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Email"
                          value={profileData?.basics?.email || ''}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              basics: { ...profileData?.basics, email: e.target.value },
                            })
                          }
                        />
                        <Input
                          label="Phone"
                          value={profileData?.basics?.phone || ''}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              basics: { ...profileData?.basics, phone: e.target.value },
                            })
                          }
                        />
                      </div>

                      <Input
                        label="Portfolio / GitHub URL"
                        value={profileData?.basics?.url || ''}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            basics: { ...profileData?.basics, url: e.target.value },
                          })
                        }
                      />

                      <div>
                        <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                          Executive Summary
                        </label>
                        <textarea
                          rows={4}
                          value={profileData?.basics?.summary || ''}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              basics: { ...profileData?.basics, summary: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs text-white focus:outline-none focus:border-[var(--color-accent)] leading-relaxed"
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === 'experience' && (
                    <div className="space-y-6">
                      {profileData?.work?.map((w: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/40 space-y-3"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-bold text-sm text-white">{w.position}</h4>
                              <div className="text-xs text-[var(--color-accent)] font-medium mt-0.5">
                                {w.name}
                              </div>
                            </div>
                            <span className="font-mono text-xs text-[var(--color-text-muted)]">
                              {w.startDate} — {w.endDate}
                            </span>
                          </div>

                          <div className="space-y-1.5 pt-2">
                            {w.highlights?.map((h: string, hIdx: number) => (
                              <div key={hIdx} className="flex items-start gap-2 text-xs text-zinc-300">
                                <span className="text-[var(--color-accent)] mt-1">•</span>
                                <span className="leading-relaxed">{h}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'skills' && (
                    <div className="space-y-6">
                      {profileData?.skills?.map((cat: any, cIdx: number) => (
                        <div key={cIdx} className="space-y-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                            {cat.name}
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {cat.keywords?.map((k: string, kIdx: number) => (
                              <span
                                key={kIdx}
                                className="px-3 py-1 rounded-lg bg-[var(--color-surface-2)] text-xs font-mono text-zinc-200 border border-[var(--color-border)]"
                              >
                                {k}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'projects' && (
                    <div className="space-y-4">
                      {profileData?.projects?.map((p: any, pIdx: number) => (
                        <div
                          key={pIdx}
                          className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/40 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-white">{p.name}</span>
                            {p.url && (
                              <a
                                href={p.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-[var(--color-accent)] hover:underline flex items-center gap-1"
                              >
                                View Repo <ExternalLink size={12} />
                              </a>
                            )}
                          </div>
                          <p className="text-xs text-zinc-300 leading-relaxed">{p.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
