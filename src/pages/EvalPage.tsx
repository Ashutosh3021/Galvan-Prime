import { useState } from 'react';
import { MetricCard } from '../components/eval/MetricCard';
import { ScoreChart } from '../components/eval/ScoreChart';
import { HistoryTable } from '../components/eval/HistoryTable';
import { Icon } from '../components/ui/Icon';
import { useEvalMetrics, useRunEval } from '../hooks/useEval';
import { useCollections } from '../hooks/useIngest';
import type { EvalTestItem } from '../api/eval';

const METRIC_CONFIG = [
  { key: 'faithfulness'      as const, label: 'Faithfulness',      target: 0.80, icon: 'verified',                color: '#1E4E8C' },
  { key: 'answer_relevancy'  as const, label: 'Answer Relevancy',  target: 0.75, icon: 'target',                  color: '#3E7D5A' },
  { key: 'context_recall'    as const, label: 'Context Recall',    target: 0.70, icon: 'memory',                  color: '#514739' },
  { key: 'context_precision' as const, label: 'Context Precision', target: 0.75, icon: 'precision_manufacturing', color: '#A23A28' },
];

function exportCsv(history: { timestamp: string; faithfulness: number | null; answer_relevancy: number | null; context_recall: number | null; context_precision: number | null }[]) {
  const header = 'timestamp,faithfulness,answer_relevancy,context_recall,context_precision\n';
  const rows = history.map(h => `${h.timestamp},${h.faithfulness ?? 'N/A'},${h.answer_relevancy ?? 'N/A'},${h.context_recall ?? 'N/A'},${h.context_precision ?? 'N/A'}`).join('\n');
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
    <div className="bg-paper-deep border border-rule rounded-xl p-5 flex flex-col gap-4">
      <h2 className="text-[16px] font-semibold text-ink flex items-center gap-2">
        <Icon name="science" size={18} className="text-cite" />
        Configure Evaluation Run
      </h2>

      <div className="flex flex-col gap-1">
        <label className="text-[12px] font-semibold tracking-[0.05em] text-ink-soft">Collection</label>
        {collections.length === 0 ? (
          <p className="text-[13px] text-ink-soft italic">No collections available — ingest documents first.</p>
        ) : (
          <select
            value={collection}
            onChange={e => setCollection(e.target.value)}
            className="bg-paper border border-rule rounded px-3 py-2 text-[14px] text-ink focus:outline-none focus:border-cite"
          >
            <option value="">Select a collection…</option>
            {collections.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[12px] font-semibold tracking-[0.05em] text-ink-soft">Add Test Item</label>
        <input
          type="text"
          placeholder="Question"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          className="bg-paper border border-rule rounded px-3 py-2 text-[14px] text-ink focus:outline-none focus:border-cite"
        />
        <input
          type="text"
          placeholder="Ground truth answer"
          value={groundTruth}
          onChange={e => setGroundTruth(e.target.value)}
          className="bg-paper border border-rule rounded px-3 py-2 text-[14px] text-ink focus:outline-none focus:border-cite"
        />
        <button
          type="button"
          onClick={addItem}
          className="self-start flex items-center gap-1 px-3 py-1.5 text-[12px] font-semibold rounded border border-rule text-ink hover:bg-paper transition-colors"
        >
          <Icon name="add" size={14} />
          Add Item
        </button>
      </div>

      {items.length > 0 && (
        <ul className="flex flex-col gap-2">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 bg-paper rounded px-3 py-2 border border-rule text-[13px]">
              <div className="flex-1 min-w-0">
                <p className="text-ink font-medium truncate">Q: {item.question}</p>
                <p className="text-ink-soft truncate">A: {item.ground_truth}</p>
              </div>
              <button
                onClick={() => removeItem(i)}
                aria-label={`Remove item ${i + 1}`}
                className="text-ink-soft hover:text-warn transition-colors flex-shrink-0 mt-0.5"
              >
                <Icon name="close" size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {(formError || runError) && (
        <p role="alert" className="text-[12px] text-warn flex items-center gap-1">
          <Icon name="error" size={13} />
          {formError ?? runError}
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={isRunning || collections.length === 0}
        aria-label={isRunning ? 'Evaluation running…' : 'Run evaluation'}
        className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-ink text-paper font-semibold text-[13px] hover:opacity-90 transition-opacity active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed self-start"
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
        <div className="flex flex-col items-center gap-4 text-ink-soft" role="status">
          <Icon name="sync" size={40} className="animate-spin" />
          <p className="text-[14px]">Loading evaluation metrics…</p>
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main id="main-content" className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-warn max-w-md text-center px-6">
          <Icon name="error" size={40} filled />
          <p className="text-[14px] font-semibold">Couldn't reach the evaluation endpoint (/eval).</p>
          <p className="text-[13px] opacity-80">The API may be down — retry, or check the server logs.</p>
          <button onClick={() => void refetch()} className="px-4 py-2 rounded-lg bg-paper-deep border border-rule text-ink text-[13px] hover:bg-paper transition-colors">
            Retry
          </button>
        </div>
      </main>
    );
  }

  const hasRuns = metrics && metrics.history.length > 0;

  return (
    <main id="main-content" className="w-full max-w-[1440px] mx-auto px-4 md:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-[32px] font-bold leading-tight text-ink">Evaluation Suite</h1>
        <p className="text-[14px] text-ink-soft mt-1">RAGAS pipeline quality assessment — all 4 metrics across every run.</p>
      </div>

      <EvalRunForm onRun={triggerRun} isRunning={isRunning} runError={runError} />

      {hasRuns && metrics ? (
        <>
          {/* Score sheet */}
          <section aria-label="Current metric scores">
            <h2 className="text-[12px] font-semibold tracking-[0.08em] uppercase text-ink-soft mb-2">Score sheet</h2>
            <div className="bg-paper-deep border border-rule rounded-xl px-5 py-1">
              {METRIC_CONFIG.map(m => (
                <MetricCard key={m.key} label={m.label} value={metrics[m.key]} target={m.target} icon={m.icon} color={m.color} />
              ))}
            </div>
          </section>

          {/* Ink plot */}
          <section className="bg-paper-deep border border-rule rounded-xl p-5" aria-label="Score over time">
            <h2 className="text-[16px] font-semibold text-ink mb-5 flex items-center gap-2">
              <Icon name="show_chart" size={20} className="text-ink-soft" />
              Score Over Time
            </h2>
            <ScoreChart history={metrics.history} />
          </section>

          {/* Ledger of runs */}
          <section aria-label="Evaluation history">
            <HistoryTable history={metrics.history} onExportCsv={() => exportCsv(metrics.history)} />
          </section>
        </>
      ) : (
        !isLoading && (
          <div className="flex flex-col items-center justify-center py-16 text-ink-soft gap-3 border border-dashed border-rule rounded-xl">
            <Icon name="assessment" size={40} className="opacity-40" />
            <p className="text-[15px] font-semibold text-ink/80">You haven't run an evaluation yet.</p>
            <p className="text-[13px] opacity-70">Add a question and its ground-truth answer above, then click Run Evaluation.</p>
          </div>
        )
      )}
    </main>
  );
}
