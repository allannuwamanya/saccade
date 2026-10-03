import React, { useState, useEffect } from 'react';
import {
  Home,
  UserCircle,
  BookOpen,
  Files,
  PenLine,
  Palette,
  Kanban,
  Building2,
  BarChart2,
  Bot,
  Settings2,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Bell,
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

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, currentPage, onNavigate }) => {
  const { logout, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const navGroups: NavGroup[] = [
    {
      title: 'Home',
      items: [
        { page: 'home', label: 'Dashboard', icon: <Home size={15} /> },
      ],
    },
    {
      title: 'Your Profile',
      items: [
        { page: 'profile', label: 'My CV', icon: <UserCircle size={15} /> },
        { page: 'knowledge-base', label: 'Experience & Skills', icon: <BookOpen size={15} /> },
        { page: 'documents', label: 'Saved Docs', icon: <Files size={15} /> },
      ],
    },
    {
      title: 'Build',
      items: [
        { page: 'studio', label: 'Resume Builder', icon: <PenLine size={15} /> },
        { page: 'templates', label: 'CV Templates', icon: <Palette size={15} /> },
      ],
    },
    {
      title: 'Job Hunt',
      items: [
        { page: 'applications', label: 'Job Tracker', icon: <Kanban size={15} /> },
        { page: 'companies', label: 'Companies', icon: <Building2 size={15} /> },
      ],
    },
    {
      title: 'System',
      items: [
        { page: 'analytics', label: 'Stats', icon: <BarChart2 size={15} /> },
        { page: 'agent-hub', label: 'Automations', icon: <Bot size={15} /> },
        { page: 'settings', label: 'Settings', icon: <Settings2 size={15} /> },
      ],
    },
  ];

  const pageTitles: Partial<Record<Page, string>> = {
    home: 'Dashboard',
    profile: 'My CV',
    'knowledge-base': 'Experience & Skills',
    documents: 'Saved Documents',
    studio: 'Resume Builder',
    templates: 'CV Templates',
    applications: 'Job Tracker',
    companies: 'Target Companies',
    analytics: 'Stats',
    'agent-hub': 'Automations',
    settings: 'Settings',
  };

  const avatarInitials = user?.name
    ? user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? '??';

  const handleLogout = () => {
    logout();
    onNavigate('landing');
  };

  const handleItemClick = (page: Page) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col md:flex-row">
      {/* Skip to content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-indigo-600 focus:text-white focus:font-semibold focus:rounded-lg focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-white"
      >
        Skip to main content
      </a>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          w-64 md:w-[var(--sidebar-width)] fixed inset-y-0 left-0 flex flex-col z-50
          bg-[var(--color-surface)] border-r border-[var(--color-border)]
          transition-transform duration-200 ease-in-out
          ${mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
        `}
        aria-label="Sidebar navigation"
      >
        {/* Brand */}
        <div className="h-[var(--topbar-height)] flex items-center justify-between px-4 border-b border-[var(--color-border)] shrink-0">
          <button
            onClick={() => handleItemClick('home')}
            className="flex items-center gap-2.5 select-none group"
            aria-label="Go to Dashboard"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow">
              <span className="text-white text-sm font-black tracking-tight">S</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[var(--color-text-primary)] font-bold text-sm tracking-tight">Saccade</span>
              <span className="text-[10px] text-[var(--color-text-muted)] font-normal mt-0.5">Career Studio</span>
            </div>
          </button>

          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 md:hidden"
            aria-label="Close menu"
          >
            <X size={17} />
          </button>
        </div>

        {/* Nav list */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4" aria-label="Main navigation">
          {navGroups.map((group, i) => (
            <div key={i}>
              <p className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-widest mb-1 px-3">
                {group.title}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = currentPage === item.page;
                  return (
                    <button
                      key={item.page}
                      onClick={() => handleItemClick(item.page)}
                      aria-current={isActive ? 'page' : undefined}
                      className={`
                        relative w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium
                        transition-all duration-150 text-left min-h-[38px] group
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]
                        ${isActive
                          ? 'bg-indigo-500/10 text-indigo-400'
                          : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)]/50'
                        }
                      `}
                    >
                      {/* Active left accent bar */}
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-400 rounded-full" />
                      )}

                      {/* Icon container */}
                      <span
                        className={`shrink-0 flex items-center justify-center w-6 h-6 rounded-md transition-colors
                          ${isActive
                            ? 'bg-indigo-500/20 text-indigo-400'
                            : 'text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)] group-hover:bg-[var(--color-surface-2)]'
                          }
                        `}
                      >
                        {item.icon}
                      </span>

                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User panel */}
        <div className="p-3 border-t border-[var(--color-border)] shrink-0">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-[var(--color-surface-2)]/40 transition-colors group cursor-default">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-[11px] shrink-0 shadow-sm">
              {avatarInitials}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[13px] font-semibold text-[var(--color-text-primary)] truncate leading-tight">
                {user?.name || 'Guest'}
              </span>
              <span className="text-[10px] text-[var(--color-text-muted)] truncate leading-tight">
                {user?.email}
              </span>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              aria-label="Sign out"
              className="shrink-0 p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 ml-0 md:ml-[var(--sidebar-width)] flex flex-col min-h-screen outline-none"
      >
        {/* Topbar */}
        <header className="h-[var(--topbar-height)] bg-[var(--color-bg)]/90 backdrop-blur-md border-b border-[var(--color-border)] sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Open navigation"
              aria-expanded={mobileMenuOpen}
            >
              <Menu size={18} />
            </button>

            <nav className="flex items-center gap-1.5 text-xs" aria-label="Breadcrumb">
              <button
                onClick={() => onNavigate('home')}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                Saccade
              </button>
              <ChevronRight size={12} className="text-[var(--color-text-muted)]" />
              <span className="text-[var(--color-text-primary)] font-semibold">
                {pageTitles[currentPage] ?? 'Dashboard'}
              </span>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)]/60 transition-colors"
              aria-label="Notifications"
            >
              <Bell size={16} />
            </button>

            <button
              onClick={() => onNavigate('settings')}
              className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)]/60 transition-colors"
              aria-label="Settings"
            >
              <Settings2 size={16} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
};
