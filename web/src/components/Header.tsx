import React from 'react';
import { FileText, Palette, RefreshCw, Download, Cloud } from 'lucide-react';
import { ThemeName } from '../types/api';

interface HeaderProps {
  theme: ThemeName;
  onThemeChange: (theme: ThemeName) => void;
  onQuickRender: () => void;
  isRendering: boolean;
  downloadUrl: string;
  isBackendHealthy: boolean | null;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onThemeChange,
  onQuickRender,
  isRendering,
  downloadUrl,
  isBackendHealthy,
}) => {
  return (
    <header className="h-14 border-b border-slate-800 bg-slate-900/90 backdrop-blur px-4 flex items-center justify-between shrink-0 z-20">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <FileText className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-base tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Saccade
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Modern Studio
            </span>
            <div className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800">
              <span
                className={`w-2 h-2 rounded-full ${
                  isBackendHealthy === true
                    ? 'bg-emerald-400 animate-pulse'
                    : isBackendHealthy === false
                    ? 'bg-rose-500'
                    : 'bg-amber-400'
                }`}
              />
              <span className="text-slate-400">
                {isBackendHealthy === true ? 'API Connected' : isBackendHealthy === false ? 'Offline' : 'Connecting...'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme Selector */}
        <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1 text-xs">
          <span className="text-slate-400 px-2 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5" /> Theme:
          </span>
          <select
            value={theme}
            onChange={(e) => onThemeChange(e.target.value as ThemeName)}
            className="bg-transparent text-slate-200 focus:outline-none pr-2 font-medium cursor-pointer"
          >
            <option value="classic" className="bg-slate-900">Classic Serif</option>
            <option value="modern" className="bg-slate-900">Modern Tech Sans</option>
            <option value="executive" className="bg-slate-900">Executive Leadership</option>
          </select>
        </div>

        {/* Quick Render */}
        <button
          onClick={onQuickRender}
          disabled={isRendering}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRendering ? 'animate-spin' : ''}`} />
          <span>{isRendering ? 'Compiling...' : 'Quick Render'}</span>
        </button>

        {/* Download PDF */}
        <a
          href={downloadUrl}
          download="resume.pdf"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg shadow-sm shadow-blue-600/30 transition"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download PDF</span>
        </a>

        {/* Cloudflare Pages Badge */}
        <div className="hidden md:flex items-center gap-1 text-[11px] text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
          <Cloud className="w-3.5 h-3.5" />
          <span>Cloudflare Edge</span>
        </div>
      </div>
    </header>
  );
};
