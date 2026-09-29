import { ShieldCheck, CheckCircle2, Sparkles } from 'lucide-react';
import { AtsAuditResult } from '../types/api';

interface AtsCardProps {
  ats: AtsAuditResult | null;
}

export const AtsCard: React.FC<AtsCardProps> = ({ ats }) => {
  if (!ats) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-center text-slate-500 text-xs">
        Run tailoring or paste a job posting to view real-time ATS compliance diagnostics.
      </div>
    );
  }

  const scoreColor =
    ats.overall_score >= 80
      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
      : ats.overall_score >= 60
      ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
      : 'text-rose-400 bg-rose-500/10 border-rose-500/20';

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
      {/* Title & Overall Badge */}
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          ATS Compliance Scorecard
        </div>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${scoreColor}`}>
          {ats.overall_score} / 100
        </span>
      </div>

      {/* Metric Grid */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-2">
          <div className="text-[10px] text-slate-400">Keywords</div>
          <div className="text-base font-bold text-slate-200">{ats.keyword_score}%</div>
        </div>
        <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-2">
          <div className="text-[10px] text-slate-400">Format Standard</div>
          <div className="text-base font-bold text-slate-200">{ats.format_score}%</div>
        </div>
        <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-2">
          <div className="text-[10px] text-slate-400">Reading Order</div>
          <div className="text-base font-bold text-emerald-400 flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Passed
          </div>
        </div>
      </div>

      {/* Keywords Chips */}
      <div className="space-y-2 pt-1 border-t border-slate-800/60">
        <div className="text-[11px] font-medium text-slate-400">Matched Target Keywords:</div>
        <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
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

        {ats.missing_keywords.length > 0 && (
          <>
            <div className="text-[11px] font-medium text-amber-400/90 pt-1">Missing Keywords to Consider:</div>
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
          </>
        )}
      </div>

      {/* Recommendations / Guardrail Note */}
      {ats.recommendations.length > 0 && (
        <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2.5 text-[11px] text-slate-300 space-y-1">
          <div className="flex items-center gap-1.5 text-blue-400 font-medium">
            <Sparkles className="w-3.5 h-3.5" /> Honesty Guardrail & Recommendations:
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-slate-400">
            {ats.recommendations.map((rec, i) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
