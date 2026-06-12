import type { DocumentRecord, IngestResponse } from '../types';

/** Simulated network delay in ms */
const DELAY = 800;

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

// In-memory store so deletions/additions persist across calls within a session
let mockDocs: DocumentRecord[] = [
  {
    doc_id: 'mock-1',
    source: 'research_paper.pdf',
    chunks: 47,
    collection: 'my-docs',
    created_at: '2025-07-01T10:00:00Z',
  },
  {
    doc_id: 'mock-2',
    source: 'https://arxiv.org/abs/2005.11401',
    chunks: 31,
    collection: 'my-docs',
    created_at: '2025-07-02T14:30:00Z',
  },
  {
    doc_id: 'mock-3',
    source: 'system_architecture.pdf',
    chunks: 62,
    collection: 'research-papers',
    created_at: '2025-07-03T09:15:00Z',
  },
  {
    doc_id: 'mock-4',
    source: 'api_reference.txt',
    chunks: 18,
    collection: 'research-papers',
    created_at: '2025-07-04T16:45:00Z',
  },
];

export async function mockIngestDocument(
  _file: File,
  _chunkStrategy: string,
  collection: string,
): Promise<IngestResponse> {
  await sleep(DELAY);
  const newDoc: DocumentRecord = {
    doc_id: `mock-${crypto.randomUUID()}`,
    source: _file.name,
    chunks: Math.floor(Math.random() * 80) + 20,
    collection,
    created_at: new Date().toISOString(),
  };
  mockDocs = [newDoc, ...mockDocs];
  return { doc_id: newDoc.doc_id, chunks: newDoc.chunks, status: 'success' };
}

export async function mockIngestUrl(
  url: string,
  _chunkStrategy: string,
  collection: string,
): Promise<IngestResponse> {
  await sleep(DELAY);
  const newDoc: DocumentRecord = {
    doc_id: `mock-${crypto.randomUUID()}`,
    source: url,
    chunks: 47,
    collection,
    created_at: new Date().toISOString(),
  };
  mockDocs = [newDoc, ...mockDocs];
  return { doc_id: newDoc.doc_id, chunks: newDoc.chunks, status: 'success' };
}

export async function mockGetDocuments(collection?: string): Promise<DocumentRecord[]> {
  await sleep(300);
  if (collection) return mockDocs.filter(d => d.collection === collection);
  return [...mockDocs];
}

export async function mockDeleteDocument(docId: string): Promise<{ success: boolean }> {
  await sleep(300);
  mockDocs = mockDocs.filter(d => d.doc_id !== docId);
  return { success: true };
}
