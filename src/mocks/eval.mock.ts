import type { EvalMetrics, EvalRunResponse } from '../types';

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

const BASE_HISTORY = [
  {
    timestamp: '2025-07-01T09:00:00Z',
    faithfulness: 0.76,
    answer_relevancy: 0.71,
    context_recall: 0.68,
    context_precision: 0.74,
  },
  {
    timestamp: '2025-07-02T09:00:00Z',
    faithfulness: 0.80,
    answer_relevancy: 0.74,
    context_recall: 0.70,
    context_precision: 0.77,
  },
  {
    timestamp: '2025-07-03T09:00:00Z',
    faithfulness: 0.84,
    answer_relevancy: 0.78,
    context_recall: 0.73,
    context_precision: 0.81,
  },
];

/** Mutable — new runs append here so the chart updates live */
let mockHistory = [...BASE_HISTORY];

export async function mockGetEvalMetrics(): Promise<EvalMetrics> {
  await sleep(400);
  const latest = mockHistory[mockHistory.length - 1];
  return {
    faithfulness: latest.faithfulness,
    answer_relevancy: latest.answer_relevancy,
    context_recall: latest.context_recall,
    context_precision: latest.context_precision,
    history: [...mockHistory],
  };
}

export async function mockRunEval(): Promise<EvalRunResponse> {
  await sleep(200);
  return { status: 'running', job_id: `eval-run-${crypto.randomUUID()}` };
}

/** Called after the polling delay to simulate a completed run */
export async function mockCompleteEvalRun(): Promise<EvalMetrics> {
  await sleep(3000);
  const prev = mockHistory[mockHistory.length - 1];
  const jitter = () => parseFloat((Math.random() * 0.06 - 0.02).toFixed(2));
  const clamp = (v: number) => Math.min(1, Math.max(0, parseFloat(v.toFixed(2))));

  const newEntry = {
    timestamp: new Date().toISOString(),
    faithfulness: clamp(prev.faithfulness + jitter()),
    answer_relevancy: clamp(prev.answer_relevancy + jitter()),
    context_recall: clamp(prev.context_recall + jitter()),
    context_precision: clamp(prev.context_precision + jitter()),
  };
  mockHistory = [...mockHistory, newEntry];

  return {
    faithfulness: newEntry.faithfulness,
    answer_relevancy: newEntry.answer_relevancy,
    context_recall: newEntry.context_recall,
    context_precision: newEntry.context_precision,
    history: [...mockHistory],
  };
}
