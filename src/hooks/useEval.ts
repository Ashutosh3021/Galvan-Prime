import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getEvalMetrics, runEval } from '../api/eval';
import type { EvalMetrics } from '../types';
import type { EvalTestItem } from '../api/eval';

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

  /**
   * Trigger a new evaluation run.
   * @param collection  The ChromaDB collection to evaluate against.
   * @param testSet     At least one { question, ground_truth } pair.
   */
  async function triggerRun(collection: string, testSet: EvalTestItem[]) {
    if (!collection || testSet.length === 0) {
      setRunError('A collection and at least one test item are required.');
      return;
    }
    setIsRunning(true);
    setRunError(null);
    try {
      const since = new Date().toISOString();
      await runEval({ collection, test_set: testSet });

      // Poll GET /eval/history up to 15× every 3 s until a newer completed
      // run appears, then refresh the metrics cache.
      for (let i = 0; i < 15; i++) {
        await new Promise(r => setTimeout(r, 3000));
        const fresh = await getEvalMetrics();
        const latestTs = fresh.history[fresh.history.length - 1]?.timestamp;
        if (latestTs && latestTs > since) {
          qc.setQueryData<EvalMetrics>([EVAL_METRICS_KEY], fresh);
          break;
        }
      }
      // Final invalidate to ensure consistency
      await qc.invalidateQueries({ queryKey: [EVAL_METRICS_KEY] });
    } catch (err) {
      setRunError(err instanceof Error ? err.message : 'Evaluation run failed');
    } finally {
      setIsRunning(false);
    }
  }

  return { isRunning, runError, triggerRun };
}
