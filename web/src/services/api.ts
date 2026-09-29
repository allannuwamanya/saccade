import { MasterProfile, RenderResponse, TailorResponse, ThemeName, DocumentType } from '../types/api';

const API_BASE = import.meta.env.VITE_API_URL || '';

export const api = {
  async checkHealth(): Promise<{ status: string; service: string; compiler: string }> {
    const res = await fetch(`${API_BASE}/api/health`);
    if (!res.ok) throw new Error(`Health check failed (${res.status})`);
    return res.json();
  },

  async fetchProfile(profileId = 'default_profile'): Promise<MasterProfile> {
    const res = await fetch(`${API_BASE}/api/profile?profile_id=${encodeURIComponent(profileId)}`);
    if (!res.ok) throw new Error(`Failed to load profile (${res.status})`);
    return res.json();
  },

  async saveProfile(profile: MasterProfile): Promise<{ status: string; profile_id: string }> {
    const res = await fetch(`${API_BASE}/api/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    if (!res.ok) throw new Error(`Failed to save profile (${res.status})`);
    return res.json();
  },

  async uploadResume(file: File, profileId = 'default_profile'): Promise<{ status: string; profile: MasterProfile; message: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/api/profile/upload?profile_id=${encodeURIComponent(profileId)}`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Upload error' }));
      throw new Error(err.detail || 'Upload failed');
    }
    return res.json();
  },

  async renderDocument(
    profileId = 'default_profile',
    theme: ThemeName = 'modern',
    documentType: DocumentType = 'resume'
  ): Promise<RenderResponse> {
    const res = await fetch(`${API_BASE}/api/render`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profile_id: profileId,
        theme,
        document_type: documentType,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Render failed' }));
      throw new Error(err.detail || 'Render failed');
    }
    return res.json();
  },

  async tailorDocument(
    jobSource: string,
    profileId = 'default_profile',
    theme: ThemeName = 'modern',
    generateCoverLetter = true
  ): Promise<TailorResponse> {
    const res = await fetch(`${API_BASE}/api/tailor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        job_source: jobSource,
        profile_id: profileId,
        theme,
        generate_cover_letter: generateCoverLetter,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Tailor failed' }));
      throw new Error(err.detail || 'Tailoring failed');
    }
    return res.json();
  },
};
