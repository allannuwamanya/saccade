import React from 'react';
import { Code, FileText, Cpu, CheckCircle, ArrowRight, Zap, Target, Lock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import type { Page } from '../App';

interface LandingPageProps {
  onNavigate: (page: Page) => void;
}

export const LandingPage = ({ onNavigate }: LandingPageProps) => {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)]">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 h-16 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 rounded bg-[var(--color-accent)] flex items-center justify-center shadow-[var(--shadow-glow)]">
              <span className="text-white text-sm font-bold">S</span>
            </div>
            Saccade
          </div>
          <div className="hidden md:flex items-center gap-8 text-[var(--text-sm)] font-medium text-[var(--color-text-secondary)]">
            <a href="#features" className="hover:text-[var(--color-text-primary)] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[var(--color-text-primary)] transition-colors">How it works</a>
            <a href="https://github.com/allannuwamanya/saccade" target="_blank" rel="noreferrer" className="hover:text-[var(--color-text-primary)] transition-colors">GitHub</a>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => onNavigate('auth')}>Sign In</Button>
            <Button size="sm" onClick={() => onNavigate('auth')}>Launch Studio</Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-[var(--color-accent)] opacity-20 blur-[100px]"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-sm text-[var(--color-text-secondary)] mb-6">
              <span className="flex h-2 w-2 rounded-full bg-[var(--color-success)] mr-2"></span>
              Saccade Studio is now live
            </div>
            <h1 className="text-[var(--text-5xl)] font-bold tracking-tight mb-6 leading-tight">
              The LaTeX Resume Engine for <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent)] to-[#a78bfa]">AI-Native</span> Job Seekers
            </h1>
            <p className="text-[var(--text-lg)] text-[var(--color-text-secondary)] mb-8 max-w-xl">
              Compile truth-anchored, ATS-optimized PDFs in milliseconds. Tailor applications to job descriptions using local MCP agents or cloud LLMs.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Button size="lg" className="gap-2" onClick={() => onNavigate('auth')}>
                Start Building <ArrowRight size={18} />
              </Button>
              <a href="#how-it-works">
                <Button variant="secondary" size="lg">How it works</Button>
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-[var(--color-accent)] to-[#a78bfa] opacity-20 blur-lg"></div>
            <div className="relative rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl overflow-hidden flex flex-col aspect-[4/3]">
              <div className="h-8 border-b border-[var(--color-border)] bg-[#1e1e20] flex items-center px-4 gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></div>
                <span className="ml-4 text-xs text-[var(--color-text-muted)]">Saccade Studio</span>
              </div>
              <div className="flex-1 flex text-xs">
                {/* Mock Chat pane */}
                <div className="w-1/3 border-r border-[var(--color-border)] p-4 flex flex-col gap-3">
                  <div className="h-6 w-3/4 bg-[var(--color-surface-2)] rounded"></div>
                  <div className="h-16 bg-[var(--color-surface-2)] rounded-lg p-2">
                    <div className="h-2 w-full bg-[var(--color-border)] rounded mb-1"></div>
                    <div className="h-2 w-4/5 bg-[var(--color-border)] rounded"></div>
                  </div>
                  <div className="h-8 w-1/2 bg-[var(--color-accent-subtle)] border border-[var(--color-accent)] rounded flex items-center justify-center">
                    <div className="h-2 w-2/3 bg-[var(--color-accent)] rounded opacity-60"></div>
                  </div>
                </div>
                {/* Mock Editor pane */}
                <div className="w-1/3 border-r border-[var(--color-border)] p-4 font-mono text-[10px] text-[var(--color-text-muted)] leading-relaxed">
                  \documentclass&#123;article&#125;<br />
                  \begin&#123;document&#125;<br />
                  \section*&#123;Experience&#125;<br />
                  \textbf&#123;Sr. Engineer&#125;<br />
                  \end&#123;document&#125;
                </div>
                {/* Mock PDF pane */}
                <div className="w-1/3 bg-white p-4">
                  <div className="h-4 w-1/2 bg-gray-200 mb-4 mx-auto rounded"></div>
                  <div className="h-2 w-full bg-gray-100 mb-2 rounded"></div>
                  <div className="h-2 w-5/6 bg-gray-100 mb-6 rounded"></div>
                  <div className="h-3 w-1/3 bg-gray-200 mb-2 rounded"></div>
                  <div className="h-2 w-full bg-gray-100 mb-1 rounded"></div>
                  <div className="h-2 w-4/5 bg-gray-100 mb-1 rounded"></div>
                  <div className="h-2 w-3/5 bg-gray-100 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-[var(--color-surface)] border-y border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-[var(--text-3xl)] font-bold mb-4">Engineering-grade application pipeline</h2>
            <p className="text-[var(--color-text-secondary)]">Stop fighting word processors. Start treating your resume like code.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <FileText className="text-blue-400" />, title: "Tectonic Micro-Typography", desc: "Pixel-perfect LaTeX rendering engine. Outputs flawless PDFs that pass ATS parsers instantly." },
              { icon: <Lock className="text-green-400" />, title: "Honesty Guardrail", desc: "Cryptographic anchoring to your master profile ensures AI tailoring never hallucinates fake skills." },
              { icon: <Target className="text-purple-400" />, title: "ATS Compliance Engine", desc: "Automated keyword density analysis and structural validation against modern ATS systems." },
              { icon: <Cpu className="text-orange-400" />, title: "FastMCP Agent Core", desc: "Local context injection protocol allows your local AI agents to build resumes securely." },
              { icon: <Zap className="text-yellow-400" />, title: "Multi-Model BYOK", desc: "Bring your own keys. Use Claude 3.5 Sonnet, GPT-4o, or entirely local Ollama models." },
              { icon: <Code className="text-indigo-400" />, title: "Live LaTeX Editor", desc: "Real-time bi-directional sync. Edit visually or drop down to raw LaTeX whenever you need." }
            ].map((feature, i) => (
              <div key={i} className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] hover:border-[var(--color-accent)] transition-colors group">
                <div className="w-12 h-12 rounded-lg bg-[var(--color-surface)] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-[var(--text-lg)] font-semibold mb-2">{feature.title}</h3>
                <p className="text-[var(--text-sm)] text-[var(--color-text-muted)] leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <h2 className="text-[var(--text-3xl)] font-bold mb-4">The Saccade Protocol</h2>
            <p className="text-[var(--color-text-secondary)]">From master profile to highly tailored PDF in seconds.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-[var(--color-border)] -z-10"></div>

            {[
              { num: "01", title: "Upload Master Profile", desc: "Ingest your complete work history via PDF, LinkedIn export, or raw JSON." },
              { num: "02", title: "Inject Job Context", desc: "Paste the target job description. The AI engine selects the optimal subset of your experience." },
              { num: "03", title: "Compile & Deploy", desc: "Download the tailored PDF resume and matching cover letter, ready for submission." }
            ].map((step, i) => (
              <div key={i} className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-8 relative">
                <div className="w-10 h-10 rounded-full bg-[var(--color-bg)] border-2 border-[var(--color-accent)] text-[var(--color-accent)] font-bold flex items-center justify-center mb-4">
                  {step.num}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-[var(--color-text-secondary)]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="rounded-3xl border border-[var(--color-border)] p-12 bg-gradient-to-b from-[var(--color-surface)] to-[var(--color-bg)] relative overflow-hidden">
            <div className="absolute inset-0 bg-[var(--color-accent)] opacity-5"></div>
            <h2 className="text-[var(--text-4xl)] font-bold mb-6 relative z-10">Stop writing resumes. Start compiling them.</h2>
            <p className="text-xl text-[var(--color-text-secondary)] mb-8 relative z-10">
              Join the engineers who treat their career progression like a production deployment.
            </p>
            <Button size="lg" className="px-12 text-lg relative z-10" onClick={() => onNavigate('auth')}>
              Create Free Account
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] py-12 bg-[var(--color-bg)] text-[var(--color-text-muted)] text-sm">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 font-semibold text-[var(--color-text-primary)]">
            <div className="w-5 h-5 rounded bg-[var(--color-accent)] flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">S</span>
            </div>
            Saccade
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-[var(--color-text-primary)] transition-colors">Documentation</a>
            <a href="https://github.com/allannuwamanya/saccade" target="_blank" rel="noreferrer" className="hover:text-[var(--color-text-primary)] transition-colors">GitHub</a>
            <a href="#" className="hover:text-[var(--color-text-primary)] transition-colors">Privacy</a>
          </div>
          <div>&copy; {new Date().getFullYear()} Saccade. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
};
