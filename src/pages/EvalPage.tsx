import { MetricCard } from '../components/eval/MetricCard';
import { ScoreChart } from '../components/eval/ScoreChart';
import { HistoryTable } from '../components/eval/HistoryTable';
import { Icon } from '../components/ui/Icon';
import { useEvalMetrics, useRunEval } from '../hooks/useEval';

const METRIC_CONFIG = [
  { key: 'faithfulness'      as const, label: 'Faithfulness',      target: 0.80, icon: 'verified',                color: '#00BFFF' },
  { key: 'answer_relevancy'  as const, label: 'Answer Relevancy',  target: 0.75, icon: 'target',                  color: '#22C55E' },
  { key: 'context_recall'    as const, label: 'Context Recall',    target: 0.70, icon: 'memory',                  color: '#FACC15' },
  { key: 'context_precision' as const, label: 'Context Precision', target: 0.75, icon: 'precision_manufacturing', color: '#FF6600' },
];

function exportCsv(history: { timestamp: string; faithfulness: number; answer_relevancy: number; context_recall: number; context_precision: number }[]) {
  const header = 'timestamp,faithfulness,answer_relevancy,context_recall,context_precision\n';
  const rows = history.map(h => `${h.timestamp},${h.faithfulness},${h.answer_relevancy},${h.context_recall},${h.context_precision}`).join('\n');
  const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `galvanrag-eval-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function EvalPage() {
  const { data: metrics, isLoading, isError, refetch } = useEvalMetrics();
  const { isRunning, runError, triggerRun } = useRunEval();

  if (isLoading) {
    return (
      <main id="main-content" className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-on-surface-variant" role="status">
          <Icon name="sync" size={40} className="animate-spin" />
          <p className="text-[14px]">Loading evaluation metrics…</p>
        </div>
      </main>
    );
  }

  if (isError || !metrics) {
    return (
      <main id="main-content" className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-[#ef4444]">
          <Icon name="error" size={40} filled />
          <p className="text-[14px]">Failed to load evaluation metrics.</p>
          <button onClick={() => void refetch()} className="px-4 py-2 rounded-lg bg-surface-container border border-surface-container-high text-on-surface text-[13px] hover:bg-surface-container-high transition-colors">
            Retry
          </button>
        </div>
      </main>
    );
  }

  return (
    <main id="main-content" className="w-full max-w-[1440px] mx-auto px-4 md:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-bold leading-tight text-on-surface">Evaluation Suite</h1>
          <p className="text-[14px] text-on-surface-variant mt-1">RAGAS pipeline quality assessment — all 4 metrics across every run.</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <button
            onClick={() => void triggerRun()}
            disabled={isRunning}
            aria-label={isRunning ? 'Evaluation running…' : 'Run new evaluation'}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary-container text-on-primary font-semibold text-[13px] hover:brightness-110 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-primary-container/20"
          >
            <Icon name={isRunning ? 'sync' : 'play_arrow'} size={18} className={isRunning ? 'animate-spin' : ''} />
            {isRunning ? 'Running evaluation…' : 'Run Evaluation'}
          </button>
          {runError && (
            <p role="alert" className="text-[12px] text-[#ef4444] flex items-center gap-1">
              <Icon name="error" size={13} />
              {runError}
            </p>
          )}
        </div>
      </div>

      {/* Metric cards */}
      <section aria-label="Current metric scores">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {METRIC_CONFIG.map(m => (
            <MetricCard key={m.key} label={m.label} value={metrics[m.key]} target={m.target} icon={m.icon} color={m.color} />
          ))}
        </div>
      </section>

      {/* Chart */}
      <section className="bg-surface-container border border-surface-container-high rounded-xl p-5" aria-label="Score over time">
        <h2 className="text-[16px] font-semibold text-on-surface mb-5 flex items-center gap-2">
          <Icon name="show_chart" size={20} className="text-on-surface-variant" />
          Score Over Time
        </h2>
        <ScoreChart history={metrics.history} />
      </section>

      {/* History table */}
      <section aria-label="Evaluation history">
        <HistoryTable history={metrics.history} onExportCsv={() => exportCsv(metrics.history)} />
      </section>
    </main>
  );
}
