import React from 'react';
import {
  FileText,
  UserCircle,
  Send,
  Cpu,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { Page } from '../App';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

interface NavItem {
  page: Page;
  label: string;
  icon: React.ReactNode;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export const DashboardLayout = ({ children, currentPage, onNavigate }: DashboardLayoutProps) => {
  const { logout, user } = useAuth();

  const navGroups: NavGroup[] = [
    {
      title: 'Workspace',
      items: [
        { page: 'studio', label: 'Studio', icon: <FileText size={18} /> },
        { page: 'profile', label: 'Profile', icon: <UserCircle size={18} /> },
        { page: 'applications', label: 'Applications', icon: <Send size={18} /> },
      ]
    },
    {
      title: 'Integrations',
      items: [
        { page: 'agent-hub', label: 'Agent MCP Hub', icon: <Cpu size={18} /> },
      ]
    }
  ];

  const pageTitles: Partial<Record<Page, string>> = {
    studio: 'Studio',
    profile: 'Profile',
    applications: 'Applications',
    'agent-hub': 'Agent Hub',
  };

  const handleLogout = () => {
    logout();
    onNavigate('landing');
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex">
      {/* Sidebar */}
      <aside className="w-[var(--sidebar-width)] fixed inset-y-0 left-0 bg-[var(--color-surface)] border-r border-[var(--color-border)] flex flex-col z-10">
        <div className="h-[var(--topbar-height)] flex items-center px-6 border-b border-[var(--color-border-subtle)]">
          <div className="flex items-center gap-2 text-[var(--color-text-primary)] font-semibold text-[var(--text-lg)]">
            <div className="w-6 h-6 rounded bg-[var(--color-accent)] flex items-center justify-center">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            Saccade
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
          {navGroups.map((group, i) => (
            <div key={i}>
              <h4 className="text-[var(--text-xs)] font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-3 px-2">
                {group.title}
              </h4>
              <nav className="space-y-1" role="navigation">
                {group.items.map((item) => {
                  const isActive = currentPage === item.page;
                  return (
                    <button
                      key={item.page}
                      onClick={() => onNavigate(item.page)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)] text-[var(--text-sm)] font-medium transition-colors text-left
                        ${isActive
                          ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)]'
                          : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)]'}
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]
                      `}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-[var(--color-border-subtle)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white font-medium text-xs shrink-0">
                {user?.email?.substring(0, 2).toUpperCase() || 'US'}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[var(--text-sm)] font-medium text-[var(--color-text-primary)] truncate">
                  {user?.name || user?.email || 'User'}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors p-1 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] rounded"
              aria-label="Log out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-[var(--sidebar-width)] flex flex-col min-h-screen">
        <header className="h-[var(--topbar-height)] bg-[var(--color-bg)]/80 backdrop-blur border-b border-[var(--color-border)] sticky top-0 z-10 flex items-center px-8">
          <div className="flex items-center text-[var(--text-sm)] text-[var(--color-text-muted)]">
            <span>Workspace</span>
            <ChevronRight size={14} className="mx-2" />
            <span className="text-[var(--color-text-primary)] font-medium">
              {pageTitles[currentPage] ?? 'Dashboard'}
            </span>
          </div>
        </header>
        <div className="flex-1 overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
};
