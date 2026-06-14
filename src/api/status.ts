/**
 * src/api/status.ts
 *
 * System health status API calls.
 *
 * Backend route: GET /status
 */

import { apiGet } from './client';

export interface BackendServiceStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  latency_ms: number | null;
}

export interface BackendStatusOut {
  api: 'healthy' | 'degraded';
  services: BackendServiceStatus[];
  uptime_seconds: number;
  version: string;
}

export async function getSystemStatus(): Promise<BackendStatusOut> {
  return apiGet<BackendStatusOut>('/status');
}
