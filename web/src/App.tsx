import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import { DashboardLayout } from './layouts/DashboardLayout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { HomePage } from './pages/HomePage';
import { StudioPage } from './pages/StudioPage';
import { ProfilePage } from './pages/ProfilePage';
import { KnowledgeBasePage } from './pages/KnowledgeBasePage';
import { DocumentLibraryPage } from './pages/DocumentLibraryPage';
import { TemplatesPage } from './pages/TemplatesPage';
import { ApplicationsPage } from './pages/ApplicationsPage';
import { CompaniesPage } from './pages/CompaniesPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AgentHubPage } from './pages/AgentHubPage';
import { SettingsPage } from './pages/SettingsPage';

export type Page =
  | 'landing'
  | 'auth'
  | 'home'
  | 'profile'
  | 'knowledge-base'
  | 'documents'
  | 'studio'
  | 'templates'
  | 'applications'
  | 'companies'
  | 'analytics'
  | 'agent-hub'
  | 'settings';

function AppRouter() {
  const { isAuthenticated } = useAuth();
  const [page, setPage] = useState<Page>('landing');

  useEffect(() => {
    const titles: Record<Page, string> = {
      landing: 'Saccade | AI-Native LaTeX Resume & Career Intelligence Engine',
      auth: 'Sign In / Register | Saccade Studio',
      home: 'Command Center | Saccade Studio',
      profile: 'Master Career Profile | Saccade Studio',
      'knowledge-base': 'Knowledge Base & Truth Anchor | Saccade Studio',
      documents: 'Document Library | Saccade Studio',
      studio: 'AI Tailoring Studio | Saccade Studio',
      templates: 'LaTeX Themes & Page Budgets | Saccade Studio',
      applications: 'Applications Pipeline | Saccade Studio',
      companies: 'Target Companies & Recruiter CRM | Saccade Studio',
      analytics: 'Performance & Analytics | Saccade Studio',
      'agent-hub': 'FastMCP Agent Hub | Saccade Studio',
      settings: 'Settings & Integrations | Saccade Studio',
    };
    document.title = titles[page] || 'Saccade Studio';
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [page]);

  const navigate = (to: Page) => {
    if (to === 'landing' || to === 'auth') {
      setPage(to);
      return;
    }

    if (!isAuthenticated) {
      setPage('auth');
    } else {
      setPage(to);
    }
  };

  if (page === 'landing') return <LandingPage onNavigate={navigate} />;
  if (page === 'auth') return <AuthPage onNavigate={navigate} />;

  // Dashboard pages registry
  const dashboardPages: Record<string, React.ReactNode> = {
    home: <HomePage onNavigate={navigate} />,
    profile: <ProfilePage />,
    'knowledge-base': <KnowledgeBasePage />,
    documents: <DocumentLibraryPage onNavigate={navigate} />,
    studio: <StudioPage />,
    templates: <TemplatesPage onNavigate={navigate} />,
    applications: <ApplicationsPage onNavigate={navigate} />,
    companies: <CompaniesPage />,
    analytics: <AnalyticsPage />,
    'agent-hub': <AgentHubPage />,
    settings: <SettingsPage />,
  };

  const currentPage = (page in dashboardPages) ? page : 'home';

  return (
    <DashboardLayout currentPage={currentPage as Page} onNavigate={navigate}>
      {dashboardPages[currentPage]}
    </DashboardLayout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
