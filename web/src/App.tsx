import React, { useState } from 'react';
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
