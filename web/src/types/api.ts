export type ThemeName = 'classic' | 'modern' | 'executive';

export type DocumentType = 'resume' | 'cv' | 'cover_letter' | 'biosketch';

export interface AtsAuditResult {
  overall_score: number;
  keyword_score: number;
  format_score: number;
  reading_order_passed: boolean;
  matched_keywords: string[];
  missing_keywords: string[];
  critical_issues: string[];
  formatting_warnings: string[];
  recommendations: string[];
}

export interface TailorResponse {
  status: string;
  tailoring_id?: string;
  resume_url?: string;
  pdf_url?: string;
  cover_letter_url?: string | null;
  cover_letter_pdf_url?: string | null;
  cover_letter_text?: string | null;
  ats_report?: AtsAuditResult;
  ats_score?: AtsAuditResult;
  changes_summary?: Array<{
    category: string;
    description: string;
  }>;
  gap_analysis?: string[];
  match_confidence?: number;
  latex_source?: string;
}

export interface RenderResponse {
  status: string;
  pdf_url: string;
  compile_time: number;
  latex_source?: string;
}

export interface MasterProfile {
  id: string;
  basics: {
    name: string;
    headline?: string;
    email: string;
    phone?: string;
    location?: {
      city?: string;
      region?: string;
      country?: string;
    };
    summary?: string;
  };
  work?: Array<{
    company: string;
    position: string;
    startDate?: string;
    endDate?: string;
    highlights?: string[];
  }>;
  skills?: Array<{
    name: string;
    keywords?: string[];
  }>;
  education?: Array<{
    institution: string;
    area?: string;
    studyType?: string;
    score?: string;
  }>;
  projects?: Array<{
    name: string;
    description?: string;
    highlights?: string[];
  }>;
  [key: string]: unknown;
}
