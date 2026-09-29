import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { DashboardNav, DashboardTab } from './components/DashboardNav';
import { StudioView } from './components/studio/StudioView';
import { ProfileView } from './components/profile/ProfileView';
import { ApplicationsView } from './components/applications/ApplicationsView';
import { AgentHubView } from './components/agent-hub/AgentHubView';
import { api } from './services/api';
import { MasterProfile } from './types/api';

function MainApp() {
  const { isAuthenticated } = useAuth();
  const [view, setView] = useState<'landing' | 'dashboard'>(isAuthenticated ? 'dashboard' : 'landing');
  const [currentTab, setCurrentTab] = useState<DashboardTab>('studio');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [profile, setProfile] = useState<MasterProfile | null>(null);
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean | null>(null);

  // Sync view when auth changes
  useEffect(() => {
    if (isAuthenticated) {
      setView('dashboard');
    }
  }, [isAuthenticated]);

  // Initial health check and profile fetch
  useEffect(() => {
    async function init() {
      try {
        await api.checkHealth();
        setIsBackendHealthy(true);
      } catch {
        setIsBackendHealthy(false);
      }

      try {
        const p = await api.fetchProfile('alex_mercer_canonical');
        setProfile(p);
      } catch (err) {
        console.warn('Initial profile load notice:', err);
      }
    }
    init();
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col font-sans">
      {view === 'landing' ? (
        <LandingPage
          onLaunchStudio={() => setView('dashboard')}
          onOpenLogin={() => setIsAuthOpen(true)}
        />
      ) : (
        <div className="h-full flex flex-col overflow-hidden">
          <DashboardNav
            currentTab={currentTab}
            onSelectTab={setCurrentTab}
            onGoLanding={() => setView('landing')}
            isBackendHealthy={isBackendHealthy}
          />

          <main className="flex-1 flex overflow-hidden">
            {currentTab === 'studio' && (
              <StudioView
                profile={profile}
                onUpdateProfile={(p) => setProfile(p)}
              />
            )}
            {currentTab === 'profile' && (
              <ProfileView
                profile={profile}
                onUpdateProfile={(p) => setProfile(p)}
              />
            )}
            {currentTab === 'applications' && (
              <ApplicationsView
                onOpenStudioForTailoring={() => setCurrentTab('studio')}
              />
            )}
            {currentTab === 'agent-hub' && <AgentHubView />}
          </main>
        </div>
      )}

      {/* Global Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => setView('dashboard')}
      />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
