import React, { useState } from 'react';
import {
  Palette,
  CheckCircle2,
  FileCode2,
  Sparkles,
  ArrowRight,
  Maximize2,
  Layers,
  Check
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import type { Page } from '../App';

interface TemplatesPageProps {
  onNavigate: (page: Page) => void;
}

interface ThemeTemplate {
  id: string;
  name: string;
  tagline: string;
  description: string;
  fontPairing: string;
  marginSpec: string;
  atsCompatibility: string;
  isDefault?: boolean;
  accentColor: string;
  previewMock: {
    headerAlign: 'left' | 'center';
    dividerStyle: 'solid' | 'subtle' | 'none';
    skillsLayout: 'badges' | 'inline' | 'columns';
  };
}

const TEMPLATES: ThemeTemplate[] = [
  {
    id: 'modern',
    name: 'Modern Platform',
    tagline: 'Tech, SaaS & High-Growth Startups',
    description: 'Crisp sans-serif micro-typography with prominent quantified metrics, skill tags, and tight vertical rhythm designed for engineering screeners.',
    fontPairing: 'Inter / Helvetica + JetBrains Mono',
    marginSpec: '0.65in symmetric geometry',
    atsCompatibility: '100% Verified (Tectonic)',
    isDefault: true,
    accentColor: 'indigo',
    previewMock: {
      headerAlign: 'left',
      dividerStyle: 'solid',
      skillsLayout: 'badges',
    },
  },
  {
    id: 'executive',
    name: 'Executive Leadership',
    tagline: 'Staff/Principal, Directors & Executives',
    description: 'Refined serif headers paired with clear body typography. Emphasizes strategic transformation, org-scale business outcomes, and board-level credibility.',
    fontPairing: 'Latin Modern Roman + TeX Gyre Termes',
    marginSpec: '0.75in balanced geometry',
    atsCompatibility: '100% Verified (Tectonic)',
    accentColor: 'purple',
    previewMock: {
      headerAlign: 'center',
      dividerStyle: 'subtle',
      skillsLayout: 'inline',
    },
  },
  {
    id: 'classic',
    name: 'Classic Academic',
    tagline: 'Research, Finance & Traditional Enterprises',
    description: 'Timeless single-column typography following standard academic LaTeX conventions. Flawless ligature handling and zero distracting graphical artifacts.',
    fontPairing: 'Computer Modern Roman',
    marginSpec: '0.80in conservative geometry',
    atsCompatibility: '100% Verified (Tectonic)',
    accentColor: 'blue',
    previewMock: {
      headerAlign: 'center',
      dividerStyle: 'solid',
      skillsLayout: 'columns',
    },
  },
  {
    id: 'minimal',
    name: 'Ultra-Dense Minimalist',
    tagline: 'High-Volume Signal & Deep Technical Experience',
    description: 'Engineered to fit 8+ years of high-caliber engineering impact strictly into 1 or 2 pages without sacrificing readability or line budgets.',
    fontPairing: 'Helvetica Neue / TeX Gyre Heros',
    marginSpec: '0.50in high-density geometry',
    atsCompatibility: '100% Verified (Tectonic)',
    accentColor: 'emerald',
    previewMock: {
      headerAlign: 'left',
      dividerStyle: 'none',
      skillsLayout: 'badges',
    },
  },
];

export const TemplatesPage: React.FC<TemplatesPageProps> = ({ onNavigate }) => {
  const [selectedTheme, setSelectedTheme] = useState('modern');

  return (
    <div className="max-w-[1600px] mx-auto p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[var(--color-border-subtle)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-[var(--text-3xl)] font-bold tracking-tight text-[var(--color-text-primary)]">
              Themes & LaTeX Templates
            </h1>
            <Badge variant="accent" size="sm">Tectonic Engine</Badge>
          </div>
          <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)]">
            Explore and configure pixel-perfect LaTeX typesetting templates. All templates compile with 100% ATS parser compatibility.
          </p>
        </div>

        <Button onClick={() => onNavigate('studio')}>
          <Sparkles size={16} className="mr-1.5" /> Launch Studio with Theme
        </Button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {TEMPLATES.map((tmpl) => {
          const isSelected = selectedTheme === tmpl.id;

          return (
            <div
              key={tmpl.id}
              className={`rounded-2xl border transition-all flex flex-col justify-between overflow-hidden ${
                isSelected
                  ? 'border-[var(--color-accent)] bg-[var(--color-surface)] shadow-lg shadow-indigo-500/10'
                  : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-white/20'
              }`}
            >
              {/* Mock PDF Visual Header */}
              <div className="p-6 bg-gradient-to-b from-[#141418] to-[var(--color-surface)] border-b border-[var(--color-border-subtle)]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg text-white">{tmpl.name}</span>
                    {tmpl.isDefault && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--color-accent)]/20 text-[var(--color-accent)] font-semibold border border-[var(--color-accent)]/30">
                        Default
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => setSelectedTheme(tmpl.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                      isSelected
                        ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]'
                        : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-white'
                    }`}
                  >
                    {isSelected ? <Check size={12} /> : null}
                    {isSelected ? 'Active Theme' : 'Select'}
                  </button>
                </div>

                {/* Miniature Visual Layout Mockup */}
                <div className="w-full bg-[#fbfbf9] rounded-xl p-4 shadow-inner text-zinc-800 font-sans text-[10px] space-y-2 select-none">
                  {/* Header preview */}
                  <div className={`space-y-1 ${tmpl.previewMock.headerAlign === 'center' ? 'text-center' : 'text-left'}`}>
                    <div className="h-3 w-32 bg-zinc-800 rounded font-bold mx-0 inline-block" />
                    <div className="h-1.5 w-48 bg-zinc-400 rounded mx-auto" />
                  </div>

                  <div className="h-px bg-zinc-300 w-full" />

                  {/* Section 1 */}
                  <div className="space-y-1">
                    <div className="h-2 w-20 bg-zinc-700 rounded font-semibold" />
                    <div className="space-y-1 pl-2">
                      <div className="h-1.5 w-full bg-zinc-300 rounded" />
                      <div className="h-1.5 w-5/6 bg-zinc-300 rounded" />
                    </div>
                  </div>

                  {/* Section 2 */}
                  <div className="space-y-1 pt-1">
                    <div className="h-2 w-16 bg-zinc-700 rounded font-semibold" />
                    <div className="flex flex-wrap gap-1">
                      {['Architecture', 'TypeScript', 'PostgreSQL', 'Tectonic'].map((s) => (
                        <span key={s} className="px-1.5 py-0.5 rounded bg-zinc-200 text-[8px] text-zinc-600 font-mono">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Theme Specification & Details */}
              <div className="p-6 space-y-4">
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                  {tmpl.description}
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-[var(--color-surface-2)]/60 border border-[var(--color-border-subtle)]">
                    <div className="text-[10px] text-[var(--color-text-muted)] uppercase font-semibold">Typography</div>
                    <div className="font-mono text-zinc-300 text-[11px] truncate mt-0.5">{tmpl.fontPairing}</div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[var(--color-surface-2)]/60 border border-[var(--color-border-subtle)]">
                    <div className="text-[10px] text-[var(--color-text-muted)] uppercase font-semibold">Page Budget</div>
                    <div className="font-mono text-zinc-300 text-[11px] truncate mt-0.5">{tmpl.marginSpec}</div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--color-border-subtle)] flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                    <CheckCircle2 size={13} /> {tmpl.atsCompatibility}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => onNavigate('studio')}
                  >
                    Use in Studio <ArrowRight size={12} className="ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
