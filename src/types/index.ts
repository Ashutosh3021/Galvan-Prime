// ─────────────────────────────────────────────
//  Shared application-wide TypeScript types
// ─────────────────────────────────────────────

/** Navigation item used in sidebars / top navs */
export interface NavItem {
  label: string;
  to: string;
  icon: string;
}

/** A RAG metric card value */
export interface MetricCard {
  label: string;
  value: number;
  delta?: number;
  status: 'good' | 'warn' | 'bad';
  icon: string;
}

/** System service health status */
export type ServiceStatus = 'up' | 'degraded' | 'down';

export interface ServiceHealth {
  name: string;
  status: ServiceStatus;
  icon: string;
}

/** Environment variable status */
export interface EnvVar {
  key: string;
  loaded: boolean;
}

/** Chat message types */
export type MessageRole = 'user' | 'bot';

export interface Citation {
  filename: string;
  reference: string;
  icon: string;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  citations?: Citation[];
  isStreaming?: boolean;
  timestamp: string;
}

/** Session in the query sidebar */
export interface QuerySession {
  id: string;
  label: string;
  isActive?: boolean;
  isSaved?: boolean;
}

/** LLM provider option */
export interface LLMProvider {
  id: string;
  name: string;
  description: string;
}

/** Vector DB option */
export interface VectorDB {
  id: string;
  name: string;
  type: 'local' | 'cloud';
}

/** Ingestion job status */
export type JobStatus = 'success' | 'processing' | 'failed';

export interface IngestionJob {
  id: string;
  filename: string;
  fileType: 'pdf' | 'url' | 'markdown' | 'error';
  status: JobStatus;
  chunks?: number;
  progress?: number;
  timestamp: string;
  errorMessage?: string;
}

/** Eval test result row */
export interface EvalResult {
  question: string;
  faithfulness: number;
  relevancy: number;
  recall: number;
  timestamp: string;
}

/** API endpoint definition */
export interface ApiEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  parameters?: ApiParameter[];
  exampleRequest?: string;
  exampleResponse?: string;
}

export interface ApiParameter {
  name: string;
  type: string;
  description: string;
  required?: boolean;
}

/** User / Session Management */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  initials: string;
  isActive: boolean;
}

export interface UserSession {
  id: string;
  device: string;
  deviceIcon: string;
  lastActive: string;
}

export interface DocumentCollection {
  id: string;
  name: string;
  documentCount: number;
  icon: string;
}

/** Ingestion form state */
export interface IngestFormState {
  url: string;
  chunkStrategy: 'fixed' | 'semantic' | 'character';
  targetCollection: string;
}

/** Settings form state */
export interface SettingsFormState {
  llmProvider: string;
  apiKey: string;
  vectorDB: string;
  envRegion: string;
  indexName: string;
  hybridWeight: number;
}
