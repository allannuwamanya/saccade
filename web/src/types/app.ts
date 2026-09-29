import { AtsAuditResult, TailorResponse, ThemeName } from './api';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  plan: 'free' | 'pro' | 'enterprise';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  actionRequired?: string;
  metadata?: {
    tailorResponse?: TailorResponse;
    atsAudit?: AtsAuditResult;
    suggestedBullets?: string[];
  };
}

export interface ApplicationRecord {
  id: string;
  company: string;
  role: string;
  theme: ThemeName;
  atsScore: number;
  date: string;
  pdfUrl: string;
  coverLetterUrl?: string | null;
  status: 'Draft' | 'Applied' | 'Interviewing' | 'Offered';
}
