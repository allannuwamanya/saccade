import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import { DashboardLayout } from './layouts/DashboardLayout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { StudioPage } from './pages/StudioPage';
import { ProfilePage } from './pages/ProfilePage';
import { ApplicationsPage } from './pages/ApplicationsPage';
import { AgentHubPage } from './pages/AgentHubPage';

export type Page = 'landing' | 'auth' | 'studio' | 'profile' | 'applications' | 'agent-hub';

function AppRouter() {
  const { isAuthenticated } = useAuth();
  const [page, setPage] = useState<Page>('landing');

  const navigate = (to: Page) => {
    if ((to === 'studio' || to === 'profile' || to === 'applications' || to === 'agent-hub') && !isAuthenticated) {
      setPage('auth');
    } else {
      setPage(to);
    }
  };

  if (page === 'landing') return <LandingPage onNavigate={navigate} />;
  if (page === 'auth') return <AuthPage onNavigate={navigate} />;

  // Dashboard pages
  const dashboardPages: Record<string, React.ReactNode> = {
    studio: <StudioPage />,
    profile: <ProfilePage />,
    applications: <ApplicationsPage onNavigate={navigate} />,
    'agent-hub': <AgentHubPage />,
  };

  const currentPage = (page as string) in dashboardPages ? page : 'studio';

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
