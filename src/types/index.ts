// ─────────────────────────────────────────────────────────────────────────────
//  Shared application-wide TypeScript types
// ─────────────────────────────────────────────────────────────────────────────

// ─── Navigation ──────────────────────────────────────────────────────────────

export interface NavItem {
  label: string;
  to: string;
  icon: string;
}

// ─── API — Ingest ─────────────────────────────────────────────────────────────

export interface IngestRequest {
  file: File;
  chunk_strategy: 'fixed' | 'semantic';
  collection: string;
}

export interface IngestResponse {
  doc_id: string;
  chunks: number;
  status: 'success' | 'failed';
}

/** A document record returned from GET /documents */
export interface DocumentRecord {
  doc_id: string;
  source: string;
  chunks: number;
  collection: string;
  created_at: string;
}

// ─── API — Query ──────────────────────────────────────────────────────────────

export interface QueryRequest {
  question: string;
  collection: string;
  session_id: string;
  provider?: string;
}

export interface QueryCitation {
  source: string;
  page: number;
  chunk: string;
}

export interface QueryResponse {
  answer: string;
  citations: QueryCitation[];
  session_id: string;
}

export interface ProvidersResponse {
  default: string | null;
  available: string[];
  models: Record<string, string>;
}

/** Display labels for provider ids returned by GET /query/providers */
export const PROVIDER_LABELS: Record<string, string> = {
  gemini: 'Gemini',
  openai: 'OpenAI',
  groq: 'Groq',
  openrouter: 'OpenRouter',
};

// ─── API — Eval ───────────────────────────────────────────────────────────────

export interface EvalMetricsHistory {
  timestamp: string;
  faithfulness: number | null;
  answer_relevancy: number | null;
  context_recall: number | null;
  context_precision: number | null;
}

export interface EvalMetrics {
  faithfulness: number | null;
  answer_relevancy: number | null;
  context_recall: number | null;
  context_precision: number | null;
  history: EvalMetricsHistory[];
}

export interface EvalRunResponse {
  status: 'running';
  job_id: string;
}

// ─── API — Collections ────────────────────────────────────────────────────────

export interface Collection {
  id: string;
  name: string;
  document_count: number;
  created_at: string;
}

// ─── API — Settings ───────────────────────────────────────────────────────────

export interface PersistedSettings {
  llmProvider: string;
  defaultChunkStrategy: 'fixed' | 'semantic';
  defaultCollection: string;
}

/** Effective settings returned by GET /settings (snake_case to match the API) */
export interface SettingsResponse {
  llm_provider: string;
  chunk_strategy: 'fixed' | 'semantic';
  default_collection: string | null;
  eval_auto_run: boolean;
}

/** Fields the Settings page can update at runtime (snake_case to match the API) */
export interface SettingsUpdateRequest {
  llm_provider?: string;
  chunk_strategy?: 'fixed' | 'semantic';
  default_collection?: string | null;
  eval_auto_run?: boolean;
}

// ─── UI — Chat ────────────────────────────────────────────────────────────────

export type MessageRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  citations?: QueryCitation[];
  timestamp: string;
}

// ─── UI — Ingestion job (local queue state) ───────────────────────────────────

export type JobStatus = 'success' | 'processing' | 'failed';
export type FileType = 'pdf' | 'url' | 'txt' | 'markdown' | 'error';

export interface IngestionJob {
  id: string;
  filename: string;
  fileType: FileType;
  status: JobStatus;
  chunks?: number;
  progress?: number;
  timestamp: string;
  errorMessage?: string;
  collection: string;
}

// ─── UI — Metric card ─────────────────────────────────────────────────────────

export interface MetricCard {
  label: string;
  value: number;
  delta?: number;
  status: 'good' | 'warn' | 'bad';
  icon: string;
}

// ─── UI — Settings form ───────────────────────────────────────────────────────

export interface SettingsFormState {
  llmProvider: string;
  apiKey: string;
  vectorDB: string;
  envRegion: string;
  indexName: string;
  hybridWeight: number;
}

// ─── UI — Query session sidebar ───────────────────────────────────────────────

export interface QuerySession {
  id: string;
  label: string;
  isActive?: boolean;
  isSaved?: boolean;
}

// ─── UI — misc ────────────────────────────────────────────────────────────────

export type ServiceStatus = 'up' | 'degraded' | 'down';

export interface ServiceHealth {
  name: string;
  status: ServiceStatus;
  icon: string;
}

export interface EnvVar {
  key: string;
  loaded: boolean;
}

export interface LLMProvider {
  id: string;
  name: string;
  description: string;
}

export interface VectorDB {
  id: string;
  name: string;
  type: 'local' | 'cloud';
}

export interface EvalResult {
  question: string;
  faithfulness: number;
  relevancy: number;
  recall: number;
  timestamp: string;
}

export interface ApiEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  initials: string;
  isActive: boolean;
}

// Legacy alias kept for backward compat with existing components
export interface Citation {
  filename: string;
  reference: string;
  icon: string;
}
