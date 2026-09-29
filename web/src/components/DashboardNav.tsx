import React from 'react';
import { FileText, Sparkles, User, Briefcase, Cpu, LogOut, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type DashboardTab = 'studio' | 'profile' | 'applications' | 'agent-hub';

interface DashboardNavProps {
  currentTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  onGoLanding: () => void;
  isBackendHealthy: boolean | null;
}

export const DashboardNav: React.FC<DashboardNavProps> = ({
  currentTab,
  onSelectTab,
  onGoLanding,
  isBackendHealthy,
}) => {
  const { user, logout } = useAuth();

  return (
    <header className="h-14 border-b border-slate-800 bg-slate-900/90 backdrop-blur px-4 flex items-center justify-between shrink-0 z-20">
      {/* Brand & Landing Link */}
      <div className="flex items-center gap-3">
        <button
          onClick={onGoLanding}
          className="text-slate-400 hover:text-white transition p-1 rounded-lg hover:bg-slate-800"
          title="Back to Landing Page"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 cursor-pointer" onClick={onGoLanding}>
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/20">
            <FileText className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-sm tracking-tight text-white">Saccade</span>
        </div>

        {/* API Status Badge */}
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800">
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

      {/* Main Tabs Navigation */}
      <nav className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800/80 text-xs">
        <button
          onClick={() => onSelectTab('studio')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
            currentTab === 'studio'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Studio & AI</span>
        </button>

        <button
          onClick={() => onSelectTab('profile')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
            currentTab === 'profile'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Profile & Facts</span>
        </button>

        <button
          onClick={() => onSelectTab('applications')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
            currentTab === 'applications'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Applications & ATS</span>
        </button>

        <button
          onClick={() => onSelectTab('agent-hub')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
            currentTab === 'agent-hub'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Agent MCP</span>
        </button>
      </nav>

      {/* User Info & Logout */}
      <div className="flex items-center gap-2">
        <div className="hidden md:flex flex-col text-right">
          <span className="text-xs font-semibold text-slate-200">{user?.name || 'Guest User'}</span>
          <span className="text-[10px] text-slate-400">{user?.email || 'Demo Profile'}</span>
        </div>

        <button
          onClick={logout}
          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
