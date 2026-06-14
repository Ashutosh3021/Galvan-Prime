/**
 * src/api/query.ts
 *
 * RAG query API calls.
 *
 * Backend route: POST /query
 */

import { apiPost } from './client';
import type { QueryRequest, QueryResponse } from '../types';

export async function queryDocument(req: QueryRequest): Promise<QueryResponse> {
  return apiPost<QueryResponse>('/query', req);
}
