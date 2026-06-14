/**
 * useStatus — fetches the system health report from GET /status
 * and exposes it for use in the home page and settings panel.
 */
import { useQuery } from '@tanstack/react-query';
import { getSystemStatus } from '../api/status';
import type { BackendStatusOut } from '../api/status';

export const STATUS_KEY = 'system-status';

export function useStatus() {
  return useQuery<BackendStatusOut, Error>({
    queryKey: [STATUS_KEY],
    queryFn: getSystemStatus,
    staleTime: 30_000,
    refetchInterval: 60_000, // auto-refresh every minute
  });
}
