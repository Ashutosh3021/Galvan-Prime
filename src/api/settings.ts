/**
 * src/api/settings.ts
 *
 * Runtime settings API calls.
 *
 * Backend routes: GET /settings, POST /settings
 */
import { apiGet, apiPost } from './client';
import type { SettingsResponse, SettingsUpdateRequest } from '../types';

export async function getSettings(): Promise<SettingsResponse> {
  return apiGet<SettingsResponse>('/settings');
}

export async function updateSettings(req: SettingsUpdateRequest): Promise<SettingsResponse> {
  return apiPost<SettingsResponse>('/settings', req);
}
