import React, { useState, useEffect } from 'react';
import {
  Database,
  Plus,
  Search,
  Sparkles,
  Tag,
  Award,
  BookOpen,
  Pin,
  CheckCircle2,
  Trash2,
  SlidersHorizontal
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { SupabaseService, KnowledgeFact } from '../services/supabase';

export const KnowledgeBasePage: React.FC = () => {
  const [facts, setFacts] = useState<KnowledgeFact[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'achievement' | 'star_story' | 'credential' | 'talking_point'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New fact form state
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newType, setNewType] = useState<'achievement' | 'star_story' | 'credential' | 'talking_point'>('achievement');
  const [newMetrics, setNewMetrics] = useState('');
  const [newSkills, setNewSkills] = useState('');
  const [alwaysInclude, setAlwaysInclude] = useState(false);

  useEffect(() => {
    setFacts(SupabaseService.getFacts());
  }, []);

  const handleTogglePin = (id: string) => {
    const updated = facts.map((f) => (f.id === id ? { ...f, alwaysInclude: !f.alwaysInclude } : f));
    setFacts(updated);
    const target = updated.find((f) => f.id === id);
    if (target) SupabaseService.saveFact(target);
  };

  const handleAddFact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newFact: KnowledgeFact = {
      id: 'fact-' + Date.now(),
      title: newTitle.trim(),
      content: newContent.trim(),
      factType: newType,
      metrics: newMetrics.split(',').map((s) => s.trim()).filter(Boolean),
      skillsDemonstrated: newSkills.split(',').map((s) => s.trim()).filter(Boolean),
      alwaysInclude,
      createdAt: new Date().toISOString().split('T')[0],
    };

    SupabaseService.saveFact(newFact);
    setFacts([newFact, ...facts]);
    setShowAddModal(false);
    // Reset form
    setNewTitle('');
    setNewContent('');
    setNewMetrics('');
    setNewSkills('');
    setAlwaysInclude(false);
  };

  const filteredFacts = facts.filter((f) => {
    const matchesTab = activeTab === 'all' || f.factType === activeTab;
    const matchesSearch =
      searchQuery === '' ||
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.skillsDemonstrated.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  return (
    <div className="max-w-[1600px] mx-auto p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[var(--color-border-subtle)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-[var(--text-3xl)] font-bold tracking-tight text-[var(--color-text-primary)]">
              Knowledge Base
            </h1>
            <Badge variant="accent" size="sm">{facts.length} Verified Facts</Badge>
          </div>
          <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)]">
            Atomic verified achievements, STAR behavioral stories, and quantified metrics used to truth-anchor your AI tailored resumes.
          </p>
        </div>

        <Button onClick={() => setShowAddModal(true)}>
          <Plus size={16} className="mr-1.5" /> Add Atomic Fact
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Facts' },
            { id: 'achievement', label: 'Achievements & Metrics' },
            { id: 'star_story', label: 'STAR Stories' },
            { id: 'credential', label: 'Credentials' },
            { id: 'talking_point', label: 'Talking Points' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'text-[var(--color-text-secondary)] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search skills, metrics, keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)]"
          />
        </div>
      </div>

      {/* Facts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFacts.map((fact) => (
          <div
            key={fact.id}
            className={`p-6 rounded-2xl border transition-all flex flex-col justify-between ${
              fact.alwaysInclude
                ? 'border-[var(--color-accent)] bg-[var(--color-surface)] shadow-md shadow-indigo-500/5'
                : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-white/20'
            }`}
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <span className="text-xs font-mono uppercase tracking-wider text-[var(--color-accent)] font-semibold flex items-center gap-1.5">
                  {fact.factType === 'achievement' && <Award size={13} />}
                  {fact.factType === 'star_story' && <Sparkles size={13} />}
                  {fact.factType === 'credential' && <CheckCircle2 size={13} />}
                  {fact.factType === 'talking_point' && <BookOpen size={13} />}
                  {fact.factType.replace('_', ' ')}
                </span>

                <button
                  onClick={() => handleTogglePin(fact.id)}
                  title={fact.alwaysInclude ? 'Pinned: Always included in tailoring' : 'Pin to always include'}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    fact.alwaysInclude
                      ? 'bg-[var(--color-accent)]/20 border-[var(--color-accent)] text-[var(--color-accent)]'
                      : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-white'
                  }`}
                >
                  <Pin size={13} className={fact.alwaysInclude ? 'fill-current' : ''} />
                </button>
              </div>

              {/* Title & Content */}
              <h3 className="text-base font-bold text-white mb-2 leading-snug">{fact.title}</h3>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-4">
                {fact.content}
              </p>

              {/* Highlighted Metrics */}
              {fact.metrics.length > 0 && (
                <div className="space-y-1.5 mb-4">
                  {fact.metrics.map((m, idx) => (
                    <div
                      key={idx}
                      className="px-2.5 py-1 rounded bg-[var(--color-surface-2)] text-emerald-400 font-mono text-[11px] font-medium border border-emerald-500/20"
                    >
                      {m}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Demonstrated Skills Tags */}
            <div className="pt-4 border-t border-[var(--color-border-subtle)] flex flex-wrap gap-1.5">
              {fact.skillsDemonstrated.map((s, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-[var(--color-surface-2)] text-[10px] text-[var(--color-text-muted)] border border-[var(--color-border)]"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add Fact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)]">
              <h2 className="text-lg font-bold text-white">Add Atomic Knowledge Fact</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[var(--color-text-muted)] hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddFact} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">Fact Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs text-white focus:outline-none focus:border-[var(--color-accent)]"
                >
                  <option value="achievement">Quantified Achievement & Metric</option>
                  <option value="star_story">STAR Behavioral Story (Situation, Task, Action, Result)</option>
                  <option value="credential">Verified Credential or Certificate</option>
                  <option value="talking_point">Interview Talking Point</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">Headline Title</label>
                <input
                  type="text"
                  placeholder="e.g. Distributed Cache Optimization cut DB read IOPS by 70%"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs text-white focus:outline-none focus:border-[var(--color-accent)]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">Detailed Story / Evidence</label>
                <textarea
                  rows={3}
                  placeholder="Describe the context, technical decisions, and verifiable outcome..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs text-white focus:outline-none focus:border-[var(--color-accent)]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">Quantified Metrics (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. 70% IOPS reduction, $45k/mo cost savings"
                  value={newMetrics}
                  onChange={(e) => setNewMetrics(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs text-white focus:outline-none focus:border-[var(--color-accent)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">Demonstrated Skills (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Redis, PostgreSQL, Systems Architecture, Cost Optimization"
                  value={newSkills}
                  onChange={(e) => setNewSkills(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs text-white focus:outline-none focus:border-[var(--color-accent)]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="alwaysInclude"
                  checked={alwaysInclude}
                  onChange={(e) => setAlwaysInclude(e.target.checked)}
                  className="rounded border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                />
                <label htmlFor="alwaysInclude" className="text-xs text-[var(--color-text-secondary)] cursor-pointer">
                  Always prioritize this achievement during AI tailoring
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--color-border-subtle)]">
                <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Fact to Knowledge Base
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
