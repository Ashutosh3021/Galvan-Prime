import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ingestDocument,
  ingestUrl,
  getDocuments,
  deleteDocument,
} from '../api/ingest';
import type { DocumentRecord } from '../types';

export const DOCUMENTS_KEY = 'documents';

/** Fetch all ingested documents, optionally filtered by collection */
export function useDocuments(collection?: string) {
  return useQuery<DocumentRecord[], Error>({
    queryKey: [DOCUMENTS_KEY, collection ?? 'all'],
    queryFn: () => getDocuments(collection),
    staleTime: 30_000,
  });
}

/** Ingest a file via multipart form */
export function useIngestFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      file,
      chunkStrategy,
      collection,
    }: {
      file: File;
      chunkStrategy: 'fixed' | 'semantic';
      collection: string;
    }) => ingestDocument(file, chunkStrategy, collection),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [DOCUMENTS_KEY] });
    },
  });
}

/** Ingest a URL */
export function useIngestUrl() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      url,
      chunkStrategy,
      collection,
    }: {
      url: string;
      chunkStrategy: 'fixed' | 'semantic';
      collection: string;
    }) => ingestUrl(url, chunkStrategy, collection),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [DOCUMENTS_KEY] });
    },
  });
}

/** Delete a document — optimistic update. Requires docId AND collection. */
export function useDeleteDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ docId, collection }: { docId: string; collection: string }) =>
      deleteDocument(docId, collection),
    onMutate: async ({ docId }) => {
      await qc.cancelQueries({ queryKey: [DOCUMENTS_KEY] });
      const snapshot = qc.getQueriesData<DocumentRecord[]>({ queryKey: [DOCUMENTS_KEY] });
      qc.setQueriesData<DocumentRecord[]>({ queryKey: [DOCUMENTS_KEY] }, old =>
        old ? old.filter(d => d.doc_id !== docId) : [],
      );
      return { snapshot };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.snapshot) {
        for (const [key, data] of ctx.snapshot) {
          qc.setQueryData(key, data);
        }
      }
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: [DOCUMENTS_KEY] });
    },
  });
}

/**
 * Derive unique collections from the documents list.
 * No hardcoded defaults — only real collections from the backend are shown.
 */
export function useCollections() {
  const { data: docs = [] } = useDocuments();
  return Array.from(new Set(docs.map(d => d.collection)));
}
