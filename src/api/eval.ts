import { IS_MOCK, apiGet, apiPost } from './client';
import {
  mockGetEvalMetrics,
  mockRunEval,
  mockCompleteEvalRun,
} from '../mocks/eval.mock';
import type { EvalMetrics, EvalRunResponse } from '../types';

export async function getEvalMetrics(): Promise<EvalMetrics> {
  if (IS_MOCK) return mockGetEvalMetrics();
  return apiGet<EvalMetrics>('/eval/metrics');
}

export async function runEval(): Promise<EvalRunResponse> {
  if (IS_MOCK) return mockRunEval();
  return apiPost<EvalRunResponse>('/eval/run', {});
}

/**
 * Polls for updated metrics after a run is triggered.
 * In mock mode, waits 3 s and returns fresh scores.
 * In real mode, polls GET /eval/metrics until data is fresher than `since`.
 */
export async function pollEvalCompletion(since: string): Promise<EvalMetrics> {
  if (IS_MOCK) return mockCompleteEvalRun();
  // Real polling: retry up to 10× every 2 s
  for (let i = 0; i < 10; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const metrics = await apiGet<EvalMetrics>('/eval/metrics');
    const latestTs = metrics.history[metrics.history.length - 1]?.timestamp;
    if (latestTs && latestTs > since) return metrics;
  }
  throw new Error('Evaluation timed out after 20 seconds');
}

// Re-export for the hook to use directly
export { mockCompleteEvalRun };
