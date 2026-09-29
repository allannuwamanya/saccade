import React, { useState } from 'react';
import { Briefcase, Wand2, Sparkles, Check, FileCheck } from 'lucide-react';
import { AtsCard } from './AtsCard';
import { AtsAuditResult, TailorResponse } from '../types/api';

interface JobTailorTabProps {
  onTailor: (jobSource: string, generateCoverLetter: boolean) => Promise<void>;
  isTailoring: boolean;
  tailorResult: TailorResponse | null;
  atsResult: AtsAuditResult | null;
}

const SAMPLE_JOB = `Senior Distributed Systems Engineer - Stripe Infrastructure
Location: San Francisco, CA / Remote

About the Role:
Our Distributed Systems Infrastructure team designs, builds, and operates the distributed consensus engines and transaction routing backbones handling over 12 billion events daily.

Required Qualifications:
- 5+ years building high-scale distributed consensus protocols (Raft, Paxos).
- Proficiency in systems languages (Rust, Go, or C++).
- Deep experience with distributed databases (CockroachDB) and message queues (Kafka).
- Demonstrated track record improving P99 latency and fault tolerance in high-throughput environments.

Preferred Qualifications:
- Experience with Kubernetes at scale.
- Contributions to open-source distributed systems.`;

export const JobTailorTab: React.FC<JobTailorTabProps> = ({
  onTailor,
  isTailoring,
  tailorResult,
  atsResult,
}) => {
  const [jobSource, setJobSource] = useState('');
  const [genCoverLetter, setGenCoverLetter] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobSource.trim()) return;
    onTailor(jobSource, genCoverLetter);
  };

  return (
    <div className="space-y-4">
      {/* Target Job Card */}
      <form onSubmit={handleSubmit} className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
            <Briefcase className="w-3.5 h-3.5 text-blue-400" /> Target Job Posting
          </label>
          <button
            type="button"
            onClick={() => setJobSource(SAMPLE_JOB)}
            className="text-[11px] text-blue-400 hover:text-blue-300 font-medium"
          >
            Load Sample Stripe Role
          </button>
        </div>

        <textarea
          rows={6}
          value={jobSource}
          onChange={(e) => setJobSource(e.target.value)}
          placeholder="Paste job posting text or enter public posting URL..."
          className="w-full text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-blue-500 transition placeholder:text-slate-600 resize-none"
        />

        <div className="mt-3 flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={genCoverLetter}
              onChange={(e) => setGenCoverLetter(e.target.checked)}
              className="rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
            />
            <span>Generate Matching Cover Letter</span>
          </label>

          <button
            type="submit"
            disabled={isTailoring || !jobSource.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-md shadow-blue-600/25 transition cursor-pointer"
          >
            <Wand2 className={`w-3.5 h-3.5 ${isTailoring ? 'animate-spin' : ''}`} />
            <span>{isTailoring ? 'Tailoring & Compiling...' : 'Tailor & Compile'}</span>
          </button>
        </div>
      </form>

      {/* ATS Scorecard */}
      <AtsCard ats={atsResult} />

      {/* Tailoring Changes Summary */}
      {tailorResult && tailorResult.changes_summary.length > 0 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm space-y-2">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            Tailoring Modifications Applied
          </div>
          <div className="space-y-1.5 pt-1">
            {tailorResult.changes_summary.map((change, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-200 capitalize">{change.category}: </span>
                  <span className="text-slate-400">{change.description}</span>
                </div>
              </div>
            ))}
          </div>

          {tailorResult.cover_letter_pdf_url && (
            <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-800/60">
              <span className="text-slate-400 flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-blue-400" /> Matching Cover Letter Ready
              </span>
              <a
                href={tailorResult.cover_letter_pdf_url}
                target="_blank"
                rel="noreferrer"
                download="cover_letter.pdf"
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                Download Cover Letter PDF →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
