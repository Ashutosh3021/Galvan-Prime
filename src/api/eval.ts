/**
 * src/api/eval.ts
 *
 * RAGAS evaluation API calls.
 *
 * Backend routes (FastAPI):
 *   POST /eval/run         — start async eval { collection, test_set[] }
 *   GET  /eval/metrics     — get scores for a run: ?run_id=<uuid>
 *   GET  /eval/history     — list all eval runs (in-memory, resets on restart)
 */

import { apiGet, apiPost } from './client';
import type { EvalMetrics, EvalRunResponse } from '../types';

// ── Backend response shapes ────────────────────────────────────────────────

export interface BackendMetricOut {
  metric: string;
  score: number;
  target: number;
  passed: boolean;
}

export interface BackendEvalRunOut {
  run_id: string;
  collection: string;
  status: 'running' | 'complete' | 'failed';
  faithfulness: number | null;
  answer_relevancy: number | null;
  context_recall: number | null;
  context_precision: number | null;
  created_at: string;
}

export interface EvalTestItem {
  question: string;
  ground_truth: string;
}

export interface EvalRunRequest {
  collection: string;
  test_set: EvalTestItem[];
}

// ── API functions ──────────────────────────────────────────────────────────

export async function runEval(req: EvalRunRequest): Promise<EvalRunResponse> {
  const res = await apiPost<BackendEvalRunOut>('/eval/run', req);
  return { status: 'running', job_id: res.run_id };
}

export async function getEvalMetricsByRunId(runId: string): Promise<BackendMetricOut[]> {
  return apiGet<BackendMetricOut[]>(`/eval/metrics?run_id=${encodeURIComponent(runId)}`);
}

export async function getEvalHistory(): Promise<BackendEvalRunOut[]> {
  return apiGet<BackendEvalRunOut[]>('/eval/history');
}

/**
 * Fetches the eval history and transforms it into the EvalMetrics shape
 * the frontend components expect. Uses the most recent completed run for
 * current scores and builds a history array from all completed runs.
 */
export async function getEvalMetrics(): Promise<EvalMetrics> {
  const history = await getEvalHistory();
  const completed = history.filter(r => r.status === 'complete');

  if (completed.length === 0) {
    // No completed runs yet — return zeros
    return {
      faithfulness: 0,
      answer_relevancy: 0,
      context_recall: 0,
      context_precision: 0,
      history: [],
    };
  }

  // Sort ascending by created_at so chart renders left-to-right
  const sorted = [...completed].sort((a, b) =>
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  const latest = sorted[sorted.length - 1];

  return {
    faithfulness: latest.faithfulness ?? 0,
    answer_relevancy: latest.answer_relevancy ?? 0,
    context_recall: latest.context_recall ?? 0,
    context_precision: latest.context_precision ?? 0,
    history: sorted.map(r => ({
      timestamp: r.created_at,
      faithfulness: r.faithfulness ?? 0,
      answer_relevancy: r.answer_relevancy ?? 0,
      context_recall: r.context_recall ?? 0,
      context_precision: r.context_precision ?? 0,
    })),
  };
}
