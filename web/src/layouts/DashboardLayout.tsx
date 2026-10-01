import React, { useState, useEffect } from 'react';
import {
  LayoutGrid,
  Fingerprint,
  Database,
  FolderArchive,
  Sparkles,
  Palette,
  Kanban,
  Building2,
  Activity,
  Cpu,
  SlidersHorizontal,
  LogOut,
  ChevronRight,
  Menu,
  X
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

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const navGroups: NavGroup[] = [
    {
      title: 'Overview',
      items: [
        { page: 'home', label: 'Home & Command', icon: <LayoutGrid size={16} /> },
      ],
    },
    {
      title: 'Career Identity',
      items: [
        { page: 'profile', label: 'Master Profile', icon: <Fingerprint size={16} /> },
        { page: 'knowledge-base', label: 'Knowledge Base', icon: <Database size={16} /> },
        { page: 'documents', label: 'Document Library', icon: <FolderArchive size={16} /> },
      ],
    },
    {
      title: 'Engine & Studio',
      items: [
        { page: 'studio', label: 'AI Studio', icon: <Sparkles size={16} /> },
        { page: 'templates', label: 'LaTeX Themes', icon: <Palette size={16} /> },
      ],
    },
    {
      title: 'Pipeline & CRM',
      items: [
        { page: 'applications', label: 'Applications Pipeline', icon: <Kanban size={16} /> },
        { page: 'companies', label: 'Companies & CRM', icon: <Building2 size={16} /> },
      ],
    },
    {
      title: 'Intelligence & System',
      items: [
        { page: 'analytics', label: 'Analytics', icon: <Activity size={16} /> },
        { page: 'agent-hub', label: 'Agent MCP Hub', icon: <Cpu size={16} /> },
        { page: 'settings', label: 'Settings & Keys', icon: <SlidersHorizontal size={16} /> },
      ],
    },
  ];

  const pageTitles: Partial<Record<Page, string>> = {
    home: 'Home & Command Center',
    profile: 'Master Career Profile',
    'knowledge-base': 'Atomic Knowledge Base',
    documents: 'Document & Version Library',
    studio: 'AI Tailoring Studio',
    templates: 'LaTeX Themes & Page Budgets',
    applications: 'Applications Pipeline',
    companies: 'Target Companies & Recruiter CRM',
    analytics: 'Performance & Analytics',
    'agent-hub': 'FastMCP Agent Hub',
    settings: 'Settings & Integrations',
  };

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
      {/* WCAG Skip to Content Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-indigo-600 focus:text-white focus:font-semibold focus:rounded-lg focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-white"
      >
        Skip to main content
      </a>

      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation (Desktop Fixed + Mobile Slide-In Drawer) */}
      <aside
        className={`
          w-72 md:w-[var(--sidebar-width)] fixed inset-y-0 left-0 bg-[var(--color-surface)] border-r border-[var(--color-border)] flex flex-col z-50 transition-transform duration-200 ease-in-out
          ${mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
        `}
        aria-label="Sidebar navigation"
      >
        {/* Brand header */}
        <div className="h-[var(--topbar-height)] flex items-center justify-between px-5 border-b border-[var(--color-border-subtle)] shrink-0">
          <div
            onClick={() => handleItemClick('home')}
            className="flex items-center gap-2.5 text-[var(--color-text-primary)] font-semibold text-base cursor-pointer select-none"
            role="button"
            tabIndex={0}
            aria-label="Navigate to Home"
          >
            <div className="w-7 h-7 rounded-lg bg-[var(--color-accent)] flex items-center justify-center shadow-md shadow-indigo-500/20">
              <span className="text-white text-xs font-black">S</span>
            </div>
            <span>Saccade</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--color-surface-2)] text-[var(--color-text-muted)] border border-[var(--color-border)]">
              v2.1
            </span>
          </div>

          {/* Close button inside mobile drawer */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-lg text-zinc-400 hover:text-white md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
          {navGroups.map((group, i) => (
            <div key={i}>
              <h4 className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5 px-2.5">
                {group.title}
              </h4>
              <nav className="space-y-0.5" aria-label={group.title}>
                {group.items.map((item) => {
                  const isActive = currentPage === item.page;
                  return (
                    <button
                      key={item.page}
                      onClick={() => handleItemClick(item.page)}
                      className={`
                        w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left min-h-[40px]
                        ${
                          isActive
                            ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)] font-semibold'
                            : 'text-[var(--color-text-secondary)] hover:text-white hover:bg-[var(--color-surface-2)]/60'
                        }
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]
                      `}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <span className={isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'}>
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* User panel */}
        <div className="p-3 border-t border-[var(--color-border-subtle)] shrink-0">
          <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--color-surface-2)]/40 border border-[var(--color-border-subtle)]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                {user?.email?.substring(0, 2).toUpperCase() || 'AM'}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-white truncate">
                  {user?.name || 'Alex Mercer'}
                </span>
                <span className="text-[10px] text-[var(--color-text-muted)] truncate">
                  {user?.email || 'alex@canonical.io'}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded"
              title="Log out"
              aria-label="Log out of Saccade"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main id="main-content" tabIndex={-1} className="flex-1 ml-0 md:ml-[var(--sidebar-width)] flex flex-col min-h-screen outline-none">
        {/* Sticky Header with Mobile Hamburger */}
        <header className="h-[var(--topbar-height)] bg-[var(--color-bg)]/80 backdrop-blur border-b border-[var(--color-border)] sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Open navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              <Menu size={20} />
            </button>

            {/* Breadcrumbs */}
            <div className="flex items-center text-xs text-[var(--color-text-muted)]" aria-label="Breadcrumb">
              <span className="hover:text-white cursor-pointer" onClick={() => onNavigate('home')}>
                Workspace
              </span>
              <ChevronRight size={13} className="mx-2" />
              <span className="text-white font-medium">
                {pageTitles[currentPage] ?? 'Dashboard'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-emerald-400 hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              100% Vector LaTeX
            </span>
          </div>
        </header>

        {/* Children View Content */}
        <div className="flex-1 overflow-x-hidden p-0">
          {children}
        </div>
      </main>
    </div>
  );
};
