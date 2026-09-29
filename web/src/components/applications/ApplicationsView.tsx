import React from 'react';
import { Briefcase, Download, ExternalLink, ShieldCheck, ArrowRight } from 'lucide-react';
import { ApplicationRecord } from '../../types/app';

interface ApplicationsViewProps {
  onOpenStudioForTailoring: () => void;
}

const SAMPLE_APPLICATIONS: ApplicationRecord[] = [
  {
    id: 'app-stripe-01',
    company: 'Stripe',
    role: 'Senior Distributed Systems Engineer',
    theme: 'modern',
    atsScore: 94,
    date: '2026-09-29',
    pdfUrl: '/api/pdf/render_alex_mercer_canonical_modern_resume.pdf',
    coverLetterUrl: '/api/pdf/render_alex_mercer_canonical_modern_cover_letter.pdf',
    status: 'Interviewing',
  },
  {
    id: 'app-cloudflare-02',
    company: 'Cloudflare',
    role: 'Staff Systems Infrastructure Engineer',
    theme: 'executive',
    atsScore: 91,
    date: '2026-09-27',
    pdfUrl: '/api/pdf/render_alex_mercer_canonical_executive_resume.pdf',
    coverLetterUrl: null,
    status: 'Applied',
  },
  {
    id: 'app-anthropic-03',
    company: 'Anthropic',
    role: 'Infrastructure Platform Engineer',
    theme: 'classic',
    atsScore: 88,
    date: '2026-09-24',
    pdfUrl: '/api/pdf/render_alex_mercer_canonical_classic_resume.pdf',
    coverLetterUrl: null,
    status: 'Applied',
  }
];

export const ApplicationsView: React.FC<ApplicationsViewProps> = ({ onOpenStudioForTailoring }) => {
  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-400" />
            <span>Applications & Tailored Documents</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track custom tailored resumes and cover letters created for specific job postings with ATS compliance records.
          </p>
        </div>

        <button
          onClick={onOpenStudioForTailoring}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-blue-600/25 transition cursor-pointer"
        >
          <span>Tailor for New Role</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Applications Cards Grid */}
      <div className="grid grid-cols-1 gap-4">
        {SAMPLE_APPLICATIONS.map((app) => (
          <div
            key={app.id}
            className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-100 text-base">{app.company}</h3>
                  <span className="text-xs text-slate-400">— {app.role}</span>
                  <span
                    className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
                      app.status === 'Interviewing'
                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                        : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    }`}
                  >
                    {app.status}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                  <span>Tailored on {app.date}</span>
                  <span>·</span>
                  <span className="capitalize">{app.theme} Serif Theme</span>
                </div>
              </div>

              {/* ATS Score Badge */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <div className="text-right">
                  <div className="text-[10px] text-slate-400">ATS Match</div>
                  <div className="text-sm font-bold text-emerald-400">{app.atsScore}%</div>
                </div>
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <a
                  href={app.pdfUrl}
                  download={`${app.company}_Resume.pdf`}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Resume PDF</span>
                </a>

                {app.coverLetterUrl && (
                  <a
                    href={app.coverLetterUrl}
                    download={`${app.company}_Cover_Letter.pdf`}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Cover Letter PDF</span>
                  </a>
                )}
              </div>

              <a
                href={app.pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-slate-400 hover:text-white transition"
              >
                <span>Preview Document</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
