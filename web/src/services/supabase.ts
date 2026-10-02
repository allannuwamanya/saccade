/**
 * Supabase client & repository layer for Saccade.
 * Auth is handled via AuthContext + supabaseClient.ts.
 * Data reads/writes for projects, documents, facts, companies, activities
 * currently use localStorage as an offline-first store (TODO: migrate to Supabase tables).
 */
import { supabase } from '../lib/supabaseClient';

export interface Project {
  id: string;
  company: string;
  role: string;
  location?: string;
  isRemote?: boolean;
  status: 'bookmarked' | 'applied' | 'screen' | 'interview' | 'offer' | 'rejected' | 'withdrawn';
  jobDescription?: string;
  targetSalary?: string;
  activeResumeId?: string;
  activeCoverLetterId?: string;
  latestAtsScore?: number;
  isLocked: boolean; // Frozen when submitted
  updatedAt: string;
  createdAt: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  type: 'resume' | 'cover_letter' | 'portfolio' | 'reference';
  theme: 'modern' | 'classic' | 'executive';
  latexSource: string;
  pdfUrl?: string;
  atsScore?: number;
  compileTimeMs?: number;
  isFrozen: boolean;
  projectId?: string;
  projectName?: string;
  createdAt: string;
}

export interface KnowledgeFact {
  id: string;
  factType: 'achievement' | 'star_story' | 'talking_point' | 'credential';
  title: string;
  content: string;
  metrics: string[];
  skillsDemonstrated: string[];
  alwaysInclude: boolean;
  createdAt: string;
}

export interface CompanyItem {
  id: string;
  name: string;
  industry: string;
  size: string;
  website: string;
  notes: string;
  status: 'target' | 'applied' | 'interviewing' | 'offer' | 'archived';
  contacts: {
    id: string;
    name: string;
    role: string;
    email?: string;
    linkedinUrl?: string;
    lastContactedAt?: string;
  }[];
}

export interface RecentActivityItem {
  id: string;
  activityType: 'compile_latex' | 'tailor_resume' | 'status_change' | 'profile_edit';
  title: string;
  detail: string;
  timestamp: string;
  badge?: string;
}

const STORAGE_KEYS = {
  PROJECTS: 'saccade_projects',
  DOCUMENTS: 'saccade_documents',
  FACTS: 'saccade_facts',
  COMPANIES: 'saccade_companies',
  ACTIVITIES: 'saccade_activities',
};

// Initial Seed Data for immediate high-fidelity testing
const SEED_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    company: 'Stripe',
    role: 'Staff Frontend Engineer',
    location: 'Remote / San Francisco',
    isRemote: true,
    status: 'interview',
    jobDescription: 'Seeking a Staff Frontend Engineer to lead foundational web platform and dashboard typography systems with high rigor.',
    targetSalary: '$240k - $290k + Equity',
    latestAtsScore: 98,
    isLocked: true,
    updatedAt: '24m ago',
    createdAt: '2026-09-18',
  },
  {
    id: 'proj-2',
    company: 'Linear',
    role: 'Product Engineer',
    location: 'San Francisco, CA',
    isRemote: false,
    status: 'applied',
    jobDescription: 'Craft delightful desktop-grade user experiences with precision, high performance, and rapid feedback loops.',
    targetSalary: '$210k - $250k',
    latestAtsScore: 96,
    isLocked: true,
    updatedAt: '2h ago',
    createdAt: '2026-09-22',
  },
  {
    id: 'proj-3',
    company: 'Vercel',
    role: 'Senior Platform Engineer',
    location: 'Remote',
    isRemote: true,
    status: 'bookmarked',
    jobDescription: 'Build next-generation developer tooling, edge runtime primitives, and high-performance serverless workflows.',
    targetSalary: '$200k - $240k',
    latestAtsScore: 95,
    isLocked: false,
    updatedAt: 'Yesterday',
    createdAt: '2026-09-28',
  },
];

const SEED_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-1',
    name: 'Alex_Mercer_Stripe_Staff_Resume.pdf',
    type: 'resume',
    theme: 'modern',
    latexSource: `\\documentclass[11pt]{article}\n\\usepackage[margin=0.7in]{geometry}\n\\begin{document}\n\\section*{Alex Mercer - Staff Frontend Engineer}\n\\end{document}`,
    atsScore: 98,
    compileTimeMs: 420,
    isFrozen: true,
    projectId: 'proj-1',
    projectName: 'Stripe Staff Frontend',
    createdAt: '2026-09-29T14:30:00Z',
  },
  {
    id: 'doc-2',
    name: 'Stripe_Executive_Cover_Letter.pdf',
    type: 'cover_letter',
    theme: 'executive',
    latexSource: `\\documentclass[11pt]{article}\n\\begin{document}\nDear Stripe Team,\n\\end{document}`,
    atsScore: 97,
    compileTimeMs: 380,
    isFrozen: true,
    projectId: 'proj-1',
    projectName: 'Stripe Staff Frontend',
    createdAt: '2026-09-29T14:35:00Z',
  },
  {
    id: 'doc-3',
    name: 'Alex_Mercer_Linear_Product_Engineer.pdf',
    type: 'resume',
    theme: 'modern',
    latexSource: `\\documentclass[11pt]{article}\n\\begin{document}\n\\section*{Experience at Acme Corp}\n\\end{document}`,
    atsScore: 96,
    compileTimeMs: 405,
    isFrozen: true,
    projectId: 'proj-2',
    projectName: 'Linear Product Engineer',
    createdAt: '2026-09-22T09:15:00Z',
  },
  {
    id: 'doc-4',
    name: 'Alex_Mercer_Vercel_Platform_Resume.pdf',
    type: 'resume',
    theme: 'classic',
    latexSource: `\\documentclass[10pt]{article}\n\\begin{document}\n\\section*{Alex Mercer - Platform Engineer}\n\\end{document}`,
    atsScore: 95,
    compileTimeMs: 390,
    isFrozen: false,
    projectId: 'proj-3',
    projectName: 'Vercel Senior Platform',
    createdAt: '2026-09-28T16:20:00Z',
  },
  {
    id: 'doc-5',
    name: 'Distributed_Systems_Case_Study_Dossier.pdf',
    type: 'portfolio',
    theme: 'modern',
    latexSource: `\\documentclass[11pt]{article}\n\\begin{document}\n\\section*{Architecture Case Study: Zero Downtime Dual-Write}\n\\end{document}`,
    atsScore: 99,
    compileTimeMs: 440,
    isFrozen: true,
    projectId: 'proj-1',
    projectName: 'Stripe Staff Frontend',
    createdAt: '2026-09-29T18:00:00Z',
  },
  {
    id: 'doc-6',
    name: 'Technical_Leadership_and_STAR_Stories.pdf',
    type: 'reference',
    theme: 'executive',
    latexSource: `\\documentclass[11pt]{article}\n\\begin{document}\n\\section*{Leadership Dossier & Provenance Records}\n\\end{document}`,
    atsScore: 100,
    compileTimeMs: 360,
    isFrozen: true,
    createdAt: '2026-09-20T11:00:00Z',
  },
];

const SEED_FACTS: KnowledgeFact[] = [
  {
    id: 'fact-1',
    factType: 'achievement',
    title: 'Monolith Deconstruction & Latency Reduction',
    content: 'Decomposed 3 legacy monolithic services into distributed micro-frontends, cutting P99 latency by 64% and serving 14M+ daily active sessions.',
    metrics: ['64% P99 latency reduction', '14M+ daily active users', 'Zero-downtime cutover'],
    skillsDemonstrated: ['Architecture', 'Performance', 'Distributed Systems', 'TypeScript'],
    alwaysInclude: true,
    createdAt: '2026-09-10',
  },
  {
    id: 'fact-2',
    factType: 'star_story',
    title: 'Zero-Downtime Database Migration under Load',
    content: 'Situation: Outgrown single Postgres instance. Task: Migrate live production database without maintenance window. Action: Implemented dual-write proxy with shadow validation. Result: 100% data consistency and zero customer impact.',
    metrics: ['Zero downtime', '100% data fidelity', '4TB dataset'],
    skillsDemonstrated: ['PostgreSQL', 'High Availability', 'Pragmatism', 'Crisis Leadership'],
    alwaysInclude: false,
    createdAt: '2026-09-12',
  },
  {
    id: 'fact-3',
    factType: 'credential',
    title: 'AWS Certified Solutions Architect - Professional',
    content: 'Valid through 2027. Specialization in serverless orchestrations, VPC peering, and secure multi-region setups.',
    metrics: ['Credential ID: AWS-PSA-94821'],
    skillsDemonstrated: ['AWS', 'Cloud Architecture', 'Security'],
    alwaysInclude: true,
    createdAt: '2026-08-01',
  },
];

const SEED_COMPANIES: CompanyItem[] = [
  {
    id: 'comp-1',
    name: 'Stripe',
    industry: 'Financial Infrastructure',
    size: '7,000+ employees',
    website: 'https://stripe.com',
    notes: 'Prioritizes extreme typography precision, API elegance, and high engineering discipline.',
    status: 'interviewing',
    contacts: [
      {
        id: 'con-1',
        name: 'Sarah Chen',
        role: 'Engineering Lead, UI Platforms',
        email: 'schen@stripe.com',
        linkedinUrl: 'https://linkedin.com/in/sarahchen',
        lastContactedAt: '3 days ago',
      },
    ],
  },
  {
    id: 'comp-2',
    name: 'Linear',
    industry: 'Productivity & Developer Tools',
    size: '80 employees',
    website: 'https://linear.app',
    notes: 'Craft, speed, keyboard-first UX, zero bloat mindset.',
    status: 'applied',
    contacts: [
      {
        id: 'con-2',
        name: 'Tuomas Artman',
        role: 'Co-founder / Eng',
        linkedinUrl: 'https://linkedin.com/in/artman',
        lastContactedAt: '1 week ago',
      },
    ],
  },
];

const SEED_ACTIVITIES: RecentActivityItem[] = [
  {
    id: 'act-1',
    activityType: 'compile_latex',
    title: 'Compiled Stripe_Staff_Resume.tex via Tectonic',
    detail: 'Compiled 13.8 KB vector PDF in 420ms with 0 overfull hboxes',
    timestamp: '24m ago',
    badge: 'Tectonic',
  },
  {
    id: 'act-2',
    activityType: 'tailor_resume',
    title: 'AI Tailored Application for Stripe Staff Frontend',
    detail: 'Matched 14/15 keywords. ATS compatibility score: 94%',
    timestamp: '1h ago',
    badge: '94% ATS',
  },
  {
    id: 'act-3',
    activityType: 'status_change',
    title: 'Advanced Linear Application to Applied (Locked)',
    detail: 'Document bundle permanently frozen for interview auditing',
    timestamp: 'Yesterday',
    badge: 'State Frozen',
  },
];

export const SupabaseService = {
  // Auth is now managed by AuthContext + supabaseClient.ts.
  // isConfigured reflects whether env vars are present.
  isConfigured(): boolean {
    const url = import.meta.env.VITE_SUPABASE_URL as string;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
    return Boolean(url && key && url.startsWith('https://'));
  },

  // Expose the client for callers that need direct Supabase queries.
  getClient() {
    return supabase;
  },

  // Projects / Applications
  getProjects(): Project[] {
    const saved = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (!saved) {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(SEED_PROJECTS));
      return SEED_PROJECTS;
    }
    try {
      return JSON.parse(saved);
    } catch {
      return SEED_PROJECTS;
    }
  },

  saveProject(project: Project) {
    const projects = this.getProjects();
    const idx = projects.findIndex((p) => p.id === project.id);
    if (idx >= 0) {
      projects[idx] = project;
    } else {
      projects.unshift(project);
    }
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  },

  // Documents
  getDocuments(): DocumentItem[] {
    const saved = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    if (!saved) {
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(SEED_DOCUMENTS));
      return SEED_DOCUMENTS;
    }
    try {
      return JSON.parse(saved);
    } catch {
      return SEED_DOCUMENTS;
    }
  },

  saveDocument(doc: DocumentItem) {
    const docs = this.getDocuments();
    docs.unshift(doc);
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
  },

  // Knowledge Base Facts
  getFacts(): KnowledgeFact[] {
    const saved = localStorage.getItem(STORAGE_KEYS.FACTS);
    if (!saved) {
      localStorage.setItem(STORAGE_KEYS.FACTS, JSON.stringify(SEED_FACTS));
      return SEED_FACTS;
    }
    try {
      return JSON.parse(saved);
    } catch {
      return SEED_FACTS;
    }
  },

  saveFact(fact: KnowledgeFact) {
    const facts = this.getFacts();
    const idx = facts.findIndex((f) => f.id === fact.id);
    if (idx >= 0) {
      facts[idx] = fact;
    } else {
      facts.unshift(fact);
    }
    localStorage.setItem(STORAGE_KEYS.FACTS, JSON.stringify(facts));
  },

  // Companies & Contacts
  getCompanies(): CompanyItem[] {
    const saved = localStorage.getItem(STORAGE_KEYS.COMPANIES);
    if (!saved) {
      localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(SEED_COMPANIES));
      return SEED_COMPANIES;
    }
    try {
      return JSON.parse(saved);
    } catch {
      return SEED_COMPANIES;
    }
  },

  saveCompany(company: CompanyItem) {
    const companies = this.getCompanies();
    const idx = companies.findIndex((c) => c.id === company.id);
    if (idx >= 0) {
      companies[idx] = company;
    } else {
      companies.unshift(company);
    }
    localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(companies));
  },

  // Activities Feed
  getActivities(): RecentActivityItem[] {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    if (!saved) {
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(SEED_ACTIVITIES));
      return SEED_ACTIVITIES;
    }
    try {
      return JSON.parse(saved);
    } catch {
      return SEED_ACTIVITIES;
    }
  },

  logActivity(activity: Omit<RecentActivityItem, 'id' | 'timestamp'>) {
    const activities = this.getActivities();
    const newAct: RecentActivityItem = {
      ...activity,
      id: 'act-' + Date.now(),
      timestamp: 'Just now',
    };
    activities.unshift(newAct);
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities.slice(0, 30)));
  },
};
