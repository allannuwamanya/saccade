import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { JobTailorTab } from './components/JobTailorTab';
import { CanonicalProfileTab } from './components/CanonicalProfileTab';
import { PdfViewer } from './components/PdfViewer';
import { api } from './services/api';
import { ThemeName, MasterProfile, TailorResponse, AtsAuditResult } from './types/api';
import { Sparkles, User, Loader2 } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'tailor' | 'profile'>('tailor');
  const [theme, setTheme] = useState<ThemeName>('modern');
  const [profile, setProfile] = useState<MasterProfile | null>(null);
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean | null>(null);

  const [pdfUrl, setPdfUrl] = useState<string>('/api/pdf/alex_mercer_modern.pdf');
  const [compileTime, setCompileTime] = useState<number | null>(null);

  const [isRendering, setIsRendering] = useState(false);
  const [isTailoring, setIsTailoring] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [tailorResult, setTailorResult] = useState<TailorResponse | null>(null);
  const [atsResult, setAtsResult] = useState<AtsAuditResult | null>(null);

  // Initialize and check health
  useEffect(() => {
    async function init() {
      try {
        await api.checkHealth();
        setIsBackendHealthy(true);
      } catch {
        setIsBackendHealthy(false);
      }

      try {
        const p = await api.fetchProfile();
        setProfile(p);
      } catch (err) {
        console.warn('Initial profile load notice:', err);
      }
    }
    init();
  }, []);

  // Quick Render handler
  const handleQuickRender = useCallback(async () => {
    setIsRendering(true);
    try {
      const res = await api.renderDocument('default_profile', theme, 'resume');
      setPdfUrl(`${res.pdf_url}?t=${Date.now()}`);
      setCompileTime(res.compile_time);
    } catch (err: unknown) {
      alert((err as Error).message || 'Render failed');
    } finally {
      setIsRendering(false);
    }
  }, [theme]);

  // Tailor handler
  const handleTailor = async (jobSource: string, generateCoverLetter: boolean) => {
    setIsTailoring(true);
    try {
      const res = await api.tailorDocument(jobSource, 'default_profile', theme, generateCoverLetter);
      setTailorResult(res);
      setAtsResult(res.ats_score);
      setPdfUrl(`${res.pdf_url}?t=${Date.now()}`);
    } catch (err: unknown) {
      alert((err as Error).message || 'Tailoring failed');
    } finally {
      setIsTailoring(false);
    }
  };

  // Upload handler
  const handleUploadFile = async (file: File) => {
    setIsUploading(true);
    try {
      const res = await api.uploadResume(file);
      setProfile(res.profile);
      alert(res.message);
      // Automatically trigger render with new profile
      handleQuickRender();
    } catch (err: unknown) {
      alert((err as Error).message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  // Save profile handler
  const handleSaveProfile = async (updated: MasterProfile) => {
    setIsSaving(true);
    try {
      await api.saveProfile(updated);
      setProfile(updated);
      handleQuickRender();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-slate-950 text-slate-100">
      {/* Top Header */}
      <Header
        theme={theme}
        onThemeChange={(newTheme) => setTheme(newTheme)}
        onQuickRender={handleQuickRender}
        isRendering={isRendering}
        downloadUrl={pdfUrl}
        isBackendHealthy={isBackendHealthy}
      />

      {/* Main Dual-Pane Studio */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Pane: Controls & Form */}
        <div className="w-1/2 min-w-[420px] max-w-[680px] border-r border-slate-800 flex flex-col bg-slate-900/40">
          {/* Tabs */}
          <div className="flex border-b border-slate-800 px-4 pt-2 gap-2 text-xs font-medium shrink-0 bg-slate-900/60">
            <button
              onClick={() => setActiveTab('tailor')}
              className={`px-4 py-2 border-b-2 flex items-center gap-2 transition ${
                activeTab === 'tailor'
                  ? 'border-blue-500 text-blue-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Job Tailor & ATS</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 border-b-2 flex items-center gap-2 transition ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Canonical Profile</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'tailor' ? (
              <JobTailorTab
                onTailor={handleTailor}
                isTailoring={isTailoring}
                tailorResult={tailorResult}
                atsResult={atsResult}
              />
            ) : (
              <CanonicalProfileTab
                profile={profile}
                onSaveProfile={handleSaveProfile}
                onUploadFile={handleUploadFile}
                isUploading={isUploading}
                isSaving={isSaving}
              />
            )}
          </div>
        </div>

        {/* Right Pane: Vector PDF Preview */}
        <PdfViewer
          pdfUrl={pdfUrl}
          compileTime={compileTime}
          documentTitle={profile ? `${profile.basics.name} - Resume` : 'Curriculum Vitae'}
        />
      </div>

      {/* Global Loading Overlay */}
      {(isRendering || isTailoring || isUploading) && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-3 text-center max-w-sm">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <div className="text-sm font-semibold text-slate-100">
              {isRendering
                ? 'Compiling Micro-Typography in Tectonic...'
                : isTailoring
                ? 'Tailoring Content & Auditing ATS...'
                : 'Extracting Career Facts...'}
            </div>
            <div className="text-xs text-slate-400">
              Generating vector PDF with native TeX hyphenation, margins, and page budget.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
