import { useState } from 'react';
import { MetricCard } from '../components/eval/MetricCard';
import { ScoreChart } from '../components/eval/ScoreChart';
import { HistoryTable } from '../components/eval/HistoryTable';
import { Icon } from '../components/ui/Icon';
import { useEvalMetrics, useRunEval } from '../hooks/useEval';
import { useCollections } from '../hooks/useIngest';
import type { EvalTestItem } from '../api/eval';

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

/** Minimal inline form for collecting eval run inputs */
function EvalRunForm({
  onRun,
  isRunning,
  runError,
}: {
  onRun: (collection: string, testSet: EvalTestItem[]) => void;
  isRunning: boolean;
  runError: string | null;
}) {
  const collections = useCollections();
  const [collection, setCollection] = useState('');
  const [question, setQuestion] = useState('');
  const [groundTruth, setGroundTruth] = useState('');
  const [items, setItems] = useState<EvalTestItem[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  function addItem() {
    if (!question.trim() || !groundTruth.trim()) {
      setFormError('Both question and ground truth are required.');
      return;
    }
    setItems(prev => [...prev, { question: question.trim(), ground_truth: groundTruth.trim() }]);
    setQuestion('');
    setGroundTruth('');
    setFormError(null);
  }

  function removeItem(idx: number) {
    setItems(prev => prev.filter((_, i) => i !== idx));
  }

  function handleSubmit() {
    if (!collection) { setFormError('Select a collection.'); return; }
    if (items.length === 0) { setFormError('Add at least one test item.'); return; }
    setFormError(null);
    onRun(collection, items);
  }

  return (
    <div className="bg-surface-container border border-surface-container-high rounded-xl p-5 flex flex-col gap-4">
      <h2 className="text-[16px] font-semibold text-on-surface flex items-center gap-2">
        <Icon name="science" size={18} className="text-primary-container" />
        Configure Evaluation Run
      </h2>

      {/* Collection selector */}
      <div className="flex flex-col gap-1">
        <label className="text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant">Collection</label>
        {collections.length === 0 ? (
          <p className="text-[13px] text-on-surface-variant italic">No collections available — ingest documents first.</p>
        ) : (
          <select
            value={collection}
            onChange={e => setCollection(e.target.value)}
            className="bg-surface border border-surface-container-high rounded px-3 py-2 text-[14px] text-on-surface focus:outline-none focus:border-primary-container"
          >
            <option value="">Select a collection…</option>
            {collections.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        )}
      </div>

      {/* Test item input */}
      <div className="flex flex-col gap-2">
        <label className="text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant">Add Test Item</label>
        <input
          type="text"
          placeholder="Question"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          className="bg-surface border border-surface-container-high rounded px-3 py-2 text-[14px] text-on-surface focus:outline-none focus:border-primary-container"
        />
        <input
          type="text"
          placeholder="Ground truth answer"
          value={groundTruth}
          onChange={e => setGroundTruth(e.target.value)}
          className="bg-surface border border-surface-container-high rounded px-3 py-2 text-[14px] text-on-surface focus:outline-none focus:border-primary-container"
        />
        <button
          type="button"
          onClick={addItem}
          className="self-start flex items-center gap-1 px-3 py-1.5 text-[12px] font-semibold rounded border border-surface-container-high text-on-surface hover:bg-surface-container transition-colors"
        >
          <Icon name="add" size={14} />
          Add Item
        </button>
      </div>

      {/* Test item list */}
      {items.length > 0 && (
        <ul className="flex flex-col gap-2">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 bg-surface rounded px-3 py-2 border border-surface-container-high text-[13px]">
              <div className="flex-1 min-w-0">
                <p className="text-on-surface font-medium truncate">Q: {item.question}</p>
                <p className="text-on-surface-variant truncate">A: {item.ground_truth}</p>
              </div>
              <button
                onClick={() => removeItem(i)}
                aria-label={`Remove item ${i + 1}`}
                className="text-on-surface-variant hover:text-[#ef4444] transition-colors flex-shrink-0 mt-0.5"
              >
                <Icon name="close" size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {(formError || runError) && (
        <p role="alert" className="text-[12px] text-[#ef4444] flex items-center gap-1">
          <Icon name="error" size={13} />
          {formError ?? runError}
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={isRunning || collections.length === 0}
        aria-label={isRunning ? 'Evaluation running…' : 'Run evaluation'}
        className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary-container text-on-primary font-semibold text-[13px] hover:brightness-110 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-primary-container/20 self-start"
      >
        <Icon name={isRunning ? 'sync' : 'play_arrow'} size={18} className={isRunning ? 'animate-spin' : ''} />
        {isRunning ? 'Running evaluation…' : 'Run Evaluation'}
      </button>
    </div>
  );
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

  if (isError) {
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

  const hasRuns = metrics && metrics.history.length > 0;

  return (
    <main id="main-content" className="w-full max-w-[1440px] mx-auto px-4 md:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-[32px] font-bold leading-tight text-on-surface">Evaluation Suite</h1>
        <p className="text-[14px] text-on-surface-variant mt-1">RAGAS pipeline quality assessment — all 4 metrics across every run.</p>
      </div>

      {/* Run form */}
      <EvalRunForm onRun={triggerRun} isRunning={isRunning} runError={runError} />

      {/* Results — only shown after at least one completed run */}
      {hasRuns && metrics ? (
        <>
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
        </>
      ) : (
        !isLoading && (
          <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant gap-3">
            <Icon name="assessment" size={48} className="opacity-30" />
            <p className="text-[15px] font-semibold">No evaluation runs yet.</p>
            <p className="text-[13px] opacity-70">Configure a run above and click Run Evaluation to see results.</p>
          </div>
        )
      )}
    </main>
  );
}
