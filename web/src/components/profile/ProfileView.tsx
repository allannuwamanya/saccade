import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Save, CheckCircle2, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';
import { MasterProfile } from '../../types/api';
import { api } from '../../services/api';

interface ProfileViewProps {
  profile: MasterProfile | null;
  onUpdateProfile: (profile: MasterProfile) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ profile, onUpdateProfile }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [jsonMode, setJsonMode] = useState(false);
  const [jsonText, setJsonText] = useState(() => (profile ? JSON.stringify(profile, null, 2) : ''));
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) setJsonText(JSON.stringify(profile, null, 2));
  }, [profile]);

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setErrorMessage(null);
    setStatusMessage(null);
    try {
      const res = await api.uploadResume(file);
      onUpdateProfile(res.profile);
      setStatusMessage(`Successfully parsed ${file.name} into canonical career facts!`);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Failed to upload and parse resume');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveJson = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    setStatusMessage(null);
    try {
      const parsed = JSON.parse(jsonText);
      await api.saveProfile(parsed);
      onUpdateProfile(parsed);
      setStatusMessage('Canonical master profile saved successfully.');
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Invalid JSON format');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-400" />
            <span>Canonical Profile & Facts Vault</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Your single source of truth. All tailoring agents and STAR writers strictly anchor their outputs to these verified career facts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setJsonMode(!jsonMode)}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium rounded-lg border border-slate-800 transition"
          >
            {jsonMode ? 'Switch to Form View' : 'Raw JSON View'}
          </button>
          {jsonMode && (
            <button
              onClick={handleSaveJson}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save JSON'}</span>
            </button>
          )}
        </div>
      </div>

      {statusMessage && (
        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Drag & Drop Intake Card */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-800 hover:border-blue-500/70 bg-slate-900/40 rounded-2xl p-6 text-center cursor-pointer transition group"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
          className="hidden"
        />
        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto mb-3 border border-blue-500/20 group-hover:scale-105 transition">
          <UploadCloud className="w-6 h-6" />
        </div>
        <div className="text-sm font-semibold text-slate-200">
          {isUploading ? 'Extracting Atomic Career Facts with Saccade Intake Agent...' : 'Upload Existing Resume (PDF, DOCX)'}
        </div>
        <div className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Drag and drop your current resume. Saccade automatically parses employment dates, company names, metrics, and technical skills into atomic career facts.
        </div>
      </div>

      {jsonMode ? (
        /* Raw JSON Editor */
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
          <textarea
            rows={22}
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            className="w-full bg-slate-950 font-mono text-xs text-slate-200 p-4 rounded-xl border border-slate-800/80 leading-relaxed focus:outline-none focus:border-blue-500 resize-none"
            spellCheck={false}
          />
        </div>
      ) : (
        /* Visual Form & Facts Cards */
        <div className="space-y-6">
          {/* Basics */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              Candidate Basics
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  readOnly
                  value={profile?.basics.name || 'Alex Mercer'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Headline</label>
                <input
                  type="text"
                  readOnly
                  value={profile?.basics.headline || 'Staff Distributed Systems Engineer'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Email</label>
                <input
                  type="email"
                  readOnly
                  value={profile?.basics.email || 'alex@example.com'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Work Experience */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Verified Work Experience ({profile?.work?.length || 0})
              </h2>
            </div>

            <div className="space-y-3">
              {profile?.work?.map((exp, idx) => (
                <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-100">{exp.position}</span>
                      <span className="text-slate-400"> at </span>
                      <span className="font-semibold text-blue-400">{exp.company}</span>
                    </div>
                    <span className="text-slate-500 font-mono text-[11px]">{exp.startDate} - {exp.endDate}</span>
                  </div>

                  <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 pl-1">
                    {exp.highlights?.map((h, hIdx) => (
                      <li key={hIdx} className="leading-relaxed">{h}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Skills */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
              Technical Skill Groups
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {profile?.skills?.map((skillGroup, sIdx) => (
                <div key={sIdx} className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                  <div className="text-xs font-semibold text-slate-300 mb-2">{skillGroup.name}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {skillGroup.keywords?.map((kw, kwIdx) => (
                      <span
                        key={kwIdx}
                        className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-800"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
