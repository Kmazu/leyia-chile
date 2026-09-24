/**
 * Tipos principales para LeyIA Chile
 */

export interface User {
  id: string;
  email?: string;
  phone?: string;
  created_at: string;
}

export interface Profile {
  id: string; // auth.users.id
  full_name: string;
  plan: 'free' | 'pro' | 'plus';
  role: 'user' | 'admin' | 'superadmin';
  query_count: number;
  query_reset_date: string;
  created_at: string;
  updated_at: string;
}

export interface LegalCase {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: 'open' | 'closed' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface LegalConsultation {
  id: string;
  user_id: string;
  case_id?: string;
  category: string;
  query: string;
  response: string;
  created_at: string;
}

export interface LegalDocument {
  id: string;
  user_id: string;
  case_id?: string;
  title: string;
  storage_path: string;
  created_at: string;
}

export interface LegalSource {
  id: string;
  id_norma: string;
  title: string;
  article: string;
  content: string;
  url: string;
  embedding?: number[];
  created_at: string;
}

export interface GeminiResponse {
  summary: string;
  analysis: string;
  legal_basis: {
    law: string;
    article: string;
    source: string;
    url: string;
    validity: string;
  }[];
  warnings: string[];
  needs_more_information: boolean;
}
