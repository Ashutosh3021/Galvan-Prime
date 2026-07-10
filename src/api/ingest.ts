/**
 * src/api/ingest.ts
 *
 * All document ingestion API calls.
 *
 * Backend routes (FastAPI):
 *   POST   /ingest                 — upload file or URL (multipart)
 *   GET    /ingest/collections     — list all ChromaDB collections
 *   DELETE /ingest/{doc_id}        — delete a document's vectors
 *
 * Note: The backend /ingest endpoint handles both file uploads and URL
 * ingestion via the same multipart form — pass either `file` or `url`.
 */

import { apiDelete, apiGet, apiPostForm } from './client';
import type { IngestResponse, DocumentRecord } from '../types';

// ── Backend response shapes ────────────────────────────────────────────────

/**
 * Shape returned by POST /ingest (IngestOut schema)
 */
interface BackendIngestOut {
  doc_id: string;
  filename: string;
  collection: string;
  chunk_count: number;
  chunk_strategy: 'fixed' | 'semantic';
  status: 'processing' | 'ready' | 'failed';
  ingested_at: string;
}

/**
 * Shape returned by GET /ingest/documents (DocumentOut schema)
 */
interface BackendDocumentOut {
  doc_id: string;
  source: string;
  collection: string;
  chunk_count: number;
  created_at: string;
}

// ── API functions ──────────────────────────────────────────────────────────

export async function ingestDocument(
  file: File,
  chunkStrategy: 'fixed' | 'semantic',
  collection: string,
): Promise<IngestResponse> {
  const form = new FormData();
  form.append('file', file);
  form.append('chunk_strategy', chunkStrategy);
  form.append('collection', collection);
  const result = await apiPostForm<BackendIngestOut>('/ingest', form);
  // Normalise to frontend IngestResponse shape
  return {
    doc_id: result.doc_id,
    chunks: result.chunk_count,
    status: result.status === 'ready' ? 'success' : result.status === 'failed' ? 'failed' : 'success',
  };
}

export async function ingestUrl(
  url: string,
  chunkStrategy: 'fixed' | 'semantic',
  collection: string,
): Promise<IngestResponse> {
  // Backend handles URL ingestion on the same POST /ingest endpoint
  const form = new FormData();
  form.append('url', url);
  form.append('chunk_strategy', chunkStrategy);
  form.append('collection', collection);
  const result = await apiPostForm<BackendIngestOut>('/ingest', form);
  return {
    doc_id: result.doc_id,
    chunks: result.chunk_count,
    status: result.status === 'ready' ? 'success' : result.status === 'failed' ? 'failed' : 'success',
  };
}

/**
 * Fetches real per-document records from GET /ingest/documents (reconstructed
 * from ChromaDB metadata: real doc_id + source).  Returns DocumentRecord
 * objects carrying genuine doc_ids so deletion targets a real vector set.
 */
export async function getDocuments(collection?: string): Promise<DocumentRecord[]> {
  const url = collection
    ? `/ingest/documents?collection=${encodeURIComponent(collection)}`
    : '/ingest/documents';
  const docs = await apiGet<BackendDocumentOut[]>(url);
  return docs.map(d => ({
    doc_id: d.doc_id,
    source: d.source,
    chunks: d.chunk_count,
    collection: d.collection,
    created_at: d.created_at,
  }));
}

export async function deleteDocument(docId: string, collection: string): Promise<{ success: boolean }> {
  // Backend: DELETE /ingest/{doc_id}?collection=...
  await apiDelete<void>(`/ingest/${encodeURIComponent(docId)}?collection=${encodeURIComponent(collection)}`);
  return { success: true };
}
