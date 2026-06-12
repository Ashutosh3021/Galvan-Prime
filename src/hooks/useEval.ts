import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getEvalMetrics, runEval, mockCompleteEvalRun } from '../api/eval';
import { IS_MOCK } from '../api/client';
import type { EvalMetrics } from '../types';

export const EVAL_METRICS_KEY = 'eval-metrics';

export function useEvalMetrics() {
  return useQuery<EvalMetrics, Error>({
    queryKey: [EVAL_METRICS_KEY],
    queryFn: getEvalMetrics,
    staleTime: 60_000,
  });
}

export function useRunEval() {
  const qc = useQueryClient();
  const [isRunning, setIsRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);

  async function triggerRun() {
    setIsRunning(true);
    setRunError(null);
    try {
      const since = new Date().toISOString();
      await runEval();

      if (IS_MOCK) {
        // mock waits 3 s then returns fresh metrics
        const fresh = await mockCompleteEvalRun();
        qc.setQueryData<EvalMetrics>([EVAL_METRICS_KEY], fresh);
      } else {
        // real: poll up to 10× every 2 s
        for (let i = 0; i < 10; i++) {
          await new Promise(r => setTimeout(r, 2000));
          const metrics = await getEvalMetrics();
          const latestTs = metrics.history[metrics.history.length - 1]?.timestamp;
          if (latestTs && latestTs > since) {
            qc.setQueryData<EvalMetrics>([EVAL_METRICS_KEY], metrics);
            break;
          }
        }
      }
    } catch (err) {
      setRunError(err instanceof Error ? err.message : 'Evaluation run failed');
    } finally {
      setIsRunning(false);
    }
  }

  return { isRunning, runError, triggerRun };
}
