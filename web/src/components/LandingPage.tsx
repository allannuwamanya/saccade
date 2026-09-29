import React from 'react';
import { FileText, ArrowRight, ShieldCheck, Sparkles, Terminal, Cpu, CheckCircle2 } from 'lucide-react';

interface LandingPageProps {
  onLaunchStudio: () => void;
  onOpenLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunchStudio, onOpenLogin }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Navigation */}
      <nav className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur sticky top-0 z-30 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Saccade
          </span>
          <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Agent Studio
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onOpenLogin}
            className="text-xs font-semibold text-slate-300 hover:text-white transition px-3 py-1.5"
          >
            Sign In
          </button>
          <button
            onClick={onLaunchStudio}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-blue-600/30 transition cursor-pointer"
          >
            <span>Launch Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 pt-20 pb-16 max-w-6xl mx-auto flex flex-col items-center text-center">
        {/* Glow backdrop */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300 mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>Tectonic LaTeX Micro-Typography & Truth-Anchored AI</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl text-slate-100 leading-tight">
          Engineered Career Documents with{' '}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            Mathematical Precision
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
          Stop sending sloppy Word-exported PDFs that fail enterprise ATS parsers. Saccade combines native TeX typesetting, zero-hallucination fact verification, and an open agent protocol.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={onLaunchStudio}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl shadow-xl shadow-blue-600/30 transition cursor-pointer"
          >
            <span>Launch Free Studio</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenLogin}
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 text-sm font-medium rounded-xl border border-slate-800 transition"
          >
            Sign In / Demo Profile
          </button>
        </div>

        {/* Live Interactive Mockup Card */}
        <div className="mt-14 w-full max-w-5xl rounded-2xl border border-slate-800 bg-slate-900/60 p-3 shadow-2xl backdrop-blur">
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/80 mb-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              <span className="ml-2 font-mono text-[11px] text-slate-500">saccade-studio-v1.0.tex</span>
            </div>
            <span className="text-[11px] text-emerald-400 font-mono">Tectonic v0.15.0 Active</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
            <div className="bg-slate-950 rounded-xl p-4 font-mono text-xs text-slate-300 border border-slate-800/80 space-y-2">
              <div className="text-slate-500 text-[11px]">% Truth-Anchored Tailoring & Page Budget</div>
              <div className="text-blue-400">\begin&#123;document&#125;</div>
              <div className="text-slate-200 pl-4">\section&#123;Distributed Systems Experience&#125;</div>
              <div className="text-emerald-400 pl-4 font-semibold">\resumeItem&#123;Architected multi-region consensus failover pipeline reducing P99 latency by 35ms across 12B daily events.&#125;</div>
              <div className="text-slate-400 pl-4">\resumeItem&#123;Led zero-downtime migration to CockroachDB.&#125;</div>
              <div className="text-blue-400">\end&#123;document&#125;</div>
            </div>

            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/80 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">ATS Compliance Scorecard</span>
                  <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">94 / 100</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Keywords</div>
                    <div className="font-bold text-slate-200">92%</div>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Formatting</div>
                    <div className="font-bold text-slate-200">100%</div>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Reading Order</div>
                    <div className="font-bold text-emerald-400">Passed</div>
                  </div>
                </div>
              </div>
              <button
                onClick={onLaunchStudio}
                className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition"
              >
                Inspect Live in Studio →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="px-6 py-16 max-w-6xl mx-auto border-t border-slate-800/80">
        <h2 className="text-center text-2xl sm:text-3xl font-bold tracking-tight text-slate-100 mb-12">
          Engineered Differently From Every Other Builder
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-200 text-sm">Tectonic Micro-Typography</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Native TeX compiler with automatic font bundle caching, micro-kerning, ligatures, and exact 1-page budget constraint solving.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-200 text-sm">Truth-Anchored Guardrail</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Zero hallucination guarantee. Tailoring agents are strictly anchored to your atomic career facts. Metrics and dates cannot be fabricated.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-200 text-sm">Enterprise ATS Auditor</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Simulates parsing pipelines for Taleo, Greenhouse, and Workday. Catches missing high-value keywords and multi-column formatting pitfalls.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Terminal className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-200 text-sm">FastMCP Agent Gateway</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Standardized Model Context Protocol server. External agents in Claude Desktop, Cursor, or Antigravity can tailor and compile resumes directly.
            </p>
          </div>
        </div>
      </section>

      {/* Clean Product Footer - Zero Infrastructure Branding */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-8 px-6 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Saccade</span>
            <span>— AI-Powered LaTeX Career Document Platform</span>
          </div>
          <div className="flex items-center gap-6 text-slate-400">
            <button onClick={onLaunchStudio} className="hover:text-white transition">Studio</button>
            <a href="https://github.com/allannuwamanya/saccade" target="_blank" rel="noreferrer" className="hover:text-white transition">GitHub</a>
            <span className="text-slate-600">|</span>
            <span className="text-slate-500">Privacy & Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
