export interface User {
  id: number;
  email: string;
  is_admin: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface ChildProfile {
  id: number;
  user_id: number;
  name: string;
  age_months: number;
  preferences: Record<string, unknown>;
  development_focus_areas: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateChildRequest {
  name: string;
  age_months: number;
  preferences?: Record<string, unknown>;
  development_focus_areas?: string[];
}

export interface ApiValidationError {
  detail: { loc: (string | number)[]; msg: string; type: string }[];
}

export interface AgeStage {
  age_months: number;
  formatted_age: string;
  stage_label: string;
}

export interface TopOfMindCard {
  document_id: number;
  title: string;
  summary: string;
  subcategory: string;
  source_name: string;
  source_url: string;
  similarity_score: number;
}

export interface TopOfMindResponse {
  child_id: number;
  child_name: string;
  age_stage: AgeStage;
  query: string;
  cards: TopOfMindCard[];
  message: string | null;
  disclaimer: string;
}

export interface GuidanceAskRequest {
  child_id: number;
  question: string;
}

export interface GuidanceAskResponse {
  conversation_id: number;
  summary: string;
  developmental_context: string;
  suggested_actions: string[];
  watch_out_for: string[];
  when_to_seek_help: string[];
  disclaimer: string;
}

export interface RagSearchRequest {
  query: string;
  category?: string;
  subcategory?: string;
  top_k?: number;
}

export interface RagSearchMatch {
  document_id: number;
  title: string;
  content: string;
  category: string;
  subcategory: string;
  source_name: string;
  source_url: string;
  safety_level: string;
  similarity_score: number;
  age_min_months: number | null;
  age_max_months: number | null;
}

export interface RagSearchResponse {
  query: string;
  matches: RagSearchMatch[];
  metrics: {
    latency_ms: number;
    top_k: number;
    storage_mode: string;
    match_count: number;
    min_score: number | null;
    max_score: number | null;
  };
}
