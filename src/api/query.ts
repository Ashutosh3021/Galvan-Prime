/**
 * src/api/query.ts
 *
 * RAG query API calls.
 *
 * Backend route: POST /query
 */

import { apiGet, apiPost } from './client';
import type { QueryRequest, QueryResponse, ProvidersResponse } from '../types';

export async function queryDocument(req: QueryRequest): Promise<QueryResponse> {
  return apiPost<QueryResponse>('/query', req);
}

export async function getProviders(): Promise<ProvidersResponse> {
  return apiGet<ProvidersResponse>('/query/providers');
}
