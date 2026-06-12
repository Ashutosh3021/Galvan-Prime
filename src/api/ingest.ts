import { IS_MOCK, apiGet, apiPostForm, apiDelete } from './client';
import {
  mockIngestDocument,
  mockIngestUrl,
  mockGetDocuments,
  mockDeleteDocument,
} from '../mocks/ingest.mock';
import type { IngestResponse, DocumentRecord } from '../types';

export async function ingestDocument(
  file: File,
  chunkStrategy: 'fixed' | 'semantic',
  collection: string,
): Promise<IngestResponse> {
  if (IS_MOCK) return mockIngestDocument(file, chunkStrategy, collection);
  const form = new FormData();
  form.append('file', file);
  form.append('chunk_strategy', chunkStrategy);
  form.append('collection', collection);
  return apiPostForm<IngestResponse>('/ingest', form);
}

export async function ingestUrl(
  url: string,
  chunkStrategy: 'fixed' | 'semantic',
  collection: string,
): Promise<IngestResponse> {
  if (IS_MOCK) return mockIngestUrl(url, chunkStrategy, collection);
  const form = new FormData();
  form.append('url', url);
  form.append('chunk_strategy', chunkStrategy);
  form.append('collection', collection);
  return apiPostForm<IngestResponse>('/ingest/url', form);
}

export async function getDocuments(collection?: string): Promise<DocumentRecord[]> {
  if (IS_MOCK) return mockGetDocuments(collection);
  const qs = collection ? `?collection=${encodeURIComponent(collection)}` : '';
  return apiGet<DocumentRecord[]>(`/documents${qs}`);
}

export async function deleteDocument(docId: string): Promise<{ success: boolean }> {
  if (IS_MOCK) return mockDeleteDocument(docId);
  return apiDelete<{ success: boolean }>(`/documents/${encodeURIComponent(docId)}`);
}
