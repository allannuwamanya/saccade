import React, { useState, useRef } from 'react';
import { UploadCloud, Save, CheckCircle2, UserCheck, AlertCircle } from 'lucide-react';
import { MasterProfile } from '../types/api';

interface CanonicalProfileTabProps {
  profile: MasterProfile | null;
  onSaveProfile: (profile: MasterProfile) => Promise<void>;
  onUploadFile: (file: File) => Promise<void>;
  isUploading: boolean;
  isSaving: boolean;
}

export const CanonicalProfileTab: React.FC<CanonicalProfileTabProps> = ({
  profile,
  onSaveProfile,
  onUploadFile,
  isUploading,
  isSaving,
}) => {
  const [jsonText, setJsonText] = useState(() => (profile ? JSON.stringify(profile, null, 2) : ''));
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keep jsonText synced when profile updates externally
  React.useEffect(() => {
    if (profile) {
      setJsonText(JSON.stringify(profile, null, 2));
    }
  }, [profile]);

  const handleSave = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const parsed = JSON.parse(jsonText);
      await onSaveProfile(parsed);
      setSuccessMsg('Master profile successfully saved and anchored.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (e: unknown) {
      setErrorMsg((e as Error).message || 'Invalid JSON syntax');
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      {/* File Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleFileDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition ${
          isDragOver
            ? 'border-blue-500 bg-slate-900'
            : 'border-slate-800 hover:border-slate-700 bg-slate-900/40'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={handleFileSelect}
          className="hidden"
        />
        <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto mb-2 border border-blue-500/20">
          <UploadCloud className="w-5 h-5" />
        </div>
        <div className="text-xs font-semibold text-slate-200">
          {isUploading ? 'Extracting Career Facts via LLM...' : 'Upload Existing Resume (PDF, DOCX)'}
        </div>
        <div className="text-[11px] text-slate-500 mt-1">
          Auto-parses and extracts your atomic career facts into the canonical profile.
        </div>
      </div>

      {/* Profile Overview Pill */}
      {profile && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-200">{profile.basics.name}</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">{profile.basics.email}</span>
          </div>
          <div className="text-[11px] text-slate-400">
            {profile.work?.length || 0} Work Roles · {profile.skills?.length || 0} Skill Groups
          </div>
        </div>
      )}

      {/* Canonical JSON Editor */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Canonical Master Profile (JSON)
          </label>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
          </button>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-lg">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <textarea
          rows={16}
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          className="w-full text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-blue-500 transition resize-none leading-relaxed"
          spellCheck={false}
        />
      </div>
    </div>
  );
};
