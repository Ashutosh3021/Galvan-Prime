import { IS_MOCK, apiPost } from './client';
import { mockQueryDocument } from '../mocks/query.mock';
import type { QueryRequest, QueryResponse } from '../types';

export async function queryDocument(req: QueryRequest): Promise<QueryResponse> {
  if (IS_MOCK) return mockQueryDocument(req);
  return apiPost<QueryResponse>('/query', req);
}
