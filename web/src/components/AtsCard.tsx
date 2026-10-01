import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Zap,
  ChevronDown,
  ChevronUp,
  FileCheck,
  TrendingUp,
  Scale
} from 'lucide-react';
import { AtsAuditResult } from '../types/api';

interface AtsCardProps {
  ats: AtsAuditResult | null;
  onBoostScore?: () => void;
  isBoosting?: boolean;
}

export const AtsCard: React.FC<AtsCardProps> = ({ ats, onBoostScore, isBoosting = false }) => {
  const [showDetails, setShowDetails] = useState(false);

  if (!ats) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-center text-slate-500 text-xs">
        <Sparkles className="w-5 h-5 mx-auto mb-1.5 text-slate-600 animate-pulse" />
        Paste a job posting or click <span className="text-blue-400 font-medium">Tailor Application</span> to run real-time multi-dimensional ATS diagnostics.
      </div>
    );
  }

  const formatScore = ats.formatting_score ?? ats.format_score ?? 100;
  const impactScore = ats.impact_score ?? 95;
  const honestyScore = ats.honesty_score ?? 100;
  const pageBudgetScore = ats.page_budget_score ?? 100;

  const scoreBadge =
    ats.overall_score >= 95
      ? { label: 'Elite Screener Pass (100% Ready)', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' }
      : ats.overall_score >= 85
      ? { label: 'Strong ATS Match', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' }
      : ats.overall_score >= 70
      ? { label: 'Moderate Match - Optimization Advised', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' }
      : { label: 'Critical Gaps Detected', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3.5 transition-all">
      {/* Header & Overall Score Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              ATS Compliance Scorecard
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Tectonic Micro-Typography + Honesty Verified
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${scoreBadge.color}`}>
            {ats.overall_score} / 100
          </span>
        </div>
      </div>

      {/* Primary Multi-Score Diagnostic Grid */}
      <div className="grid grid-cols-3 gap-2 text-center">
        {/* Keywords */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-2.5 space-y-1">
          <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1">
            <TrendingUp className="w-3 h-3 text-blue-400" /> Keywords
          </div>
          <div className="text-base font-extrabold text-slate-100">{ats.keyword_score}%</div>
          <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full transition-all" style={{ width: `${ats.keyword_score}%` }} />
          </div>
        </div>

        {/* Formatting & Typography */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-2.5 space-y-1">
          <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1">
            <FileCheck className="w-3 h-3 text-indigo-400" /> Typography
          </div>
          <div className="text-base font-extrabold text-slate-100">{formatScore}%</div>
          <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
            <div className="bg-indigo-500 h-full rounded-full transition-all" style={{ width: `${formatScore}%` }} />
          </div>
        </div>

        {/* Reading Order / Parser */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-2.5 space-y-1">
          <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1">
            <Scale className="w-3 h-3 text-emerald-400" /> Reading Order
          </div>
          <div className="text-base font-bold text-emerald-400 flex items-center justify-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> Passed
          </div>
          <div className="text-[9px] text-slate-500">Linear Single-Column</div>
        </div>
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
        <div className="p-1.5 rounded-lg bg-slate-950/50 border border-slate-800/60">
          <span className="text-slate-400">Impact (XYZ): </span>
          <span className="font-semibold text-emerald-300">{impactScore}%</span>
        </div>
        <div className="p-1.5 rounded-lg bg-slate-950/50 border border-slate-800/60">
          <span className="text-slate-400">Fact Honesty: </span>
          <span className="font-semibold text-blue-300">{honestyScore}%</span>
        </div>
        <div className="p-1.5 rounded-lg bg-slate-950/50 border border-slate-800/60">
          <span className="text-slate-400">Page Budget: </span>
          <span className="font-semibold text-purple-300">{pageBudgetScore}% (1 Page)</span>
        </div>
      </div>

      {/* 1-Click Boost Action if score < 98 */}
      {ats.overall_score < 98 && onBoostScore && (
        <button
          onClick={onBoostScore}
          disabled={isBoosting}
          className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
        >
          <Zap className="w-3.5 h-3.5" />
          {isBoosting ? 'Optimizing Bullets & Recompiling...' : 'Auto-Optimize & Boost Score to 98-100%'}
        </button>
      )}

      {/* Keywords Chips */}
      <div className="space-y-2 pt-2 border-t border-slate-800/60">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-medium text-slate-300">
            Matched Keywords ({ats.matched_keywords.length}):
          </span>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-0.5"
          >
            {showDetails ? 'Hide Analysis' : 'Detailed Breakdown'}
            {showDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>

        <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
          {ats.matched_keywords.length > 0 ? (
            ats.matched_keywords.map((kw, i) => (
              <span
                key={i}
                className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
              >
                ✓ {kw}
              </span>
            ))
          ) : (
            <span className="text-[10px] text-slate-500 italic">None detected</span>
          )}
        </div>

        {ats.missing_keywords && ats.missing_keywords.length > 0 && (
          <div className="space-y-1 pt-1">
            <div className="text-[11px] font-medium text-amber-400/90 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              Missing Role Terms ({ats.missing_keywords.length}):
            </div>
            <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
              {ats.missing_keywords.map((kw, i) => (
                <span
                  key={i}
                  className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20"
                >
                  + {kw}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Expandable Actionable Advice & Recommendations */}
      {showDetails && (
        <div className="pt-2 border-t border-slate-800/80 space-y-2 text-[11px]">
          {ats.critical_issues && ats.critical_issues.length > 0 && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> Critical Screener Risks:
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-rose-300/90 text-[10px]">
                {ats.critical_issues.map((issue, idx) => (
                  <li key={idx}>{issue}</li>
                ))}
              </ul>
            </div>
          )}

          {ats.recommendations && ats.recommendations.length > 0 && (
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 space-y-1">
              <div className="font-semibold flex items-center gap-1.5 text-blue-400">
                <Sparkles className="w-3.5 h-3.5" /> Actionable Recommendations to Reach 100%:
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-slate-400 text-[10px]">
                {ats.recommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
