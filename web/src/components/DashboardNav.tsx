import React from 'react';
import { PenLine, UserCircle, Kanban, Bot, LogOut, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type DashboardTab = 'studio' | 'profile' | 'applications' | 'agent-hub';

interface DashboardNavProps {
  currentTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  onGoLanding: () => void;
  isBackendHealthy: boolean | null;
}

const tabs: { id: DashboardTab; label: string; icon: React.ReactNode }[] = [
  { id: 'studio',       label: 'Resume Builder', icon: <PenLine size={14} /> },
  { id: 'profile',      label: 'My CV',          icon: <UserCircle size={14} /> },
  { id: 'applications', label: 'Job Tracker',    icon: <Kanban size={14} /> },
  { id: 'agent-hub',    label: 'Automations',    icon: <Bot size={14} /> },
];

export const DashboardNav: React.FC<DashboardNavProps> = ({
  currentTab,
  onSelectTab,
  onGoLanding,
  isBackendHealthy,
}) => {
  const { user, logout } = useAuth();

  const avatarInitials = user?.name
    ? user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? '??';

  return (
    <header className="h-14 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-md px-4 flex items-center justify-between shrink-0 z-20 gap-4">
      {/* Brand */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onGoLanding}
          className="text-zinc-500 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-zinc-800"
          title="Back to home"
        >
          <ArrowLeft size={15} />
        </button>

        <button onClick={onGoLanding} className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow">
            <span className="text-white text-xs font-black">S</span>
          </div>
          <span className="font-bold text-sm tracking-tight text-white">Saccade</span>
        </button>

        {/* Status pill */}
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isBackendHealthy === true
                ? 'bg-emerald-400 animate-pulse'
                : isBackendHealthy === false
                ? 'bg-rose-500'
                : 'bg-amber-400 animate-pulse'
            }`}
          />
          <span className="text-zinc-400">
            {isBackendHealthy === true ? 'Connected' : isBackendHealthy === false ? 'Offline' : 'Connecting'}
          </span>
        </div>
      </div>

      {/* Tab bar */}
      <nav className="flex items-center gap-0.5 bg-zinc-900/80 border border-zinc-800 rounded-xl p-1 text-xs">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="hidden md:flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-[10px] shadow-sm">
            {avatarInitials}
          </div>
          <div className="flex flex-col text-right leading-none">
            <span className="text-xs font-semibold text-zinc-200">{user?.name || 'Guest'}</span>
            <span className="text-[10px] text-zinc-500 mt-0.5">{user?.email}</span>
          </div>
        </div>

        <button
          onClick={logout}
          className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 rounded-lg transition-colors"
          title="Sign out"
        >
          <LogOut size={15} />
        </button>
      </div>
    </header>
  );
};
