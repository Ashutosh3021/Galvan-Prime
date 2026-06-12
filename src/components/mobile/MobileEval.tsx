import { useState } from 'react';
import { useEvalMetrics, useRunEval } from '../../hooks/useEval';

function ScoreBadge({ value, target }: { value: number; target: number }) {
  const passes = value >= target;
  return (
    <span className={`text-[12px] font-bold px-2 py-1 rounded font-mono ${
      passes ? 'text-[#4ae176] bg-[#00ae4f]/20' : 'text-[#f59e0b] bg-[#f59e0b]/20'
    }`}>
      {value.toFixed(2)}
    </span>
  );
}

const METRIC_CONFIG = [
  { key: 'faithfulness'      as const, label: 'Faithfulness',      icon: 'verified',                  target: 0.80, color: 'text-[#00BFFF]' },
  { key: 'answer_relevancy'  as const, label: 'Relevancy',         icon: 'target',                    target: 0.75, color: 'text-[#22C55E]' },
  { key: 'context_recall'    as const, label: 'Ctx. Recall',       icon: 'memory',                    target: 0.70, color: 'text-[#FACC15]' },
  { key: 'context_precision' as const, label: 'Ctx. Precision',    icon: 'precision_manufacturing',   target: 0.75, color: 'text-[#FF6600]' },
];

export default function MobileEval() {
  const [activeTab, setActiveTab] = useState<'results' | 'settings'>('results');
  const { data: metrics, isLoading, isError, refetch } = useEvalMetrics();
  const { isRunning, runError, triggerRun } = useRunEval();

  return (
    <main className="flex-1 flex flex-col w-full max-w-[1440px] mx-auto px-4 md:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-[32px] font-bold leading-tight text-on-surface mb-1">Evaluation Suite</h1>
        <p className="text-[14px] text-on-surface-variant">RAG pipeline quality assessment</p>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-outline-variant" role="tablist">
        {(['results', 'settings'] as const).map(t => (
          <button
            key={t}
            role="tab"
            aria-selected={activeTab === t}
            onClick={() => setActiveTab(t)}
            className={`
              px-5 py-3 text-[14px] font-semibold capitalize transition-colors
              ${activeTab === t
                ? 'text-primary-container border-b-2 border-primary-container'
                : 'text-on-surface-variant hover:text-on-surface'
              }
            `}
          >
            {t}
          </button>
        ))}
      </div>

      {activeTab === 'results' && (
        <div className="space-y-6">
          {isLoading && (
            <div className="flex items-center justify-center py-12 text-on-surface-variant gap-3" role="status">
              <span className="material-symbols-outlined animate-spin">sync</span>
              <span className="text-[14px]">Loading metrics…</span>
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center justify-center py-12 gap-4 text-[#ef4444]">
              <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
              <p className="text-[14px]">Failed to load metrics.</p>
              <button onClick={() => void refetch()} className="px-4 py-2 rounded-lg bg-surface-container border border-surface-container-high text-on-surface text-[13px]">
                Retry
              </button>
            </div>
          )}

          {metrics && (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-2 gap-3">
                {METRIC_CONFIG.map(m => {
                  const value = metrics[m.key];
                  const passes = value >= m.target;
                  return (
                    <div key={m.key} className="bg-surface-container border border-surface-container-high rounded-lg p-4 text-center">
                      <span className={`material-symbols-outlined ${m.color}`} style={{ fontSize: '20px' }}>{m.icon}</span>
                      <div className={`text-[24px] font-bold mt-1 font-mono ${passes ? 'text-[#4ae176]' : 'text-[#f59e0b]'}`}>
                        {value.toFixed(2)}
                      </div>
                      <div className="text-[11px] text-on-surface-variant font-semibold mt-0.5">{m.label}</div>
                      <div className={`text-[10px] mt-1 font-bold ${passes ? 'text-[#4ae176]' : 'text-[#f59e0b]'}`}>
                        {passes ? '✓ PASS' : `✗ target >${m.target}`}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* History table */}
              <div className="bg-surface-container border border-surface-container-high rounded-lg overflow-hidden">
                <div className="p-4 border-b border-surface-container-high">
                  <h2 className="text-[15px] font-semibold text-on-surface">Evaluation Runs</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse" aria-label="Evaluation history">
                    <thead>
                      <tr className="bg-surface-container-lowest border-b border-surface-container-high">
                        <th className="p-3 text-[11px] font-semibold tracking-[0.05em] text-on-surface-variant">Run</th>
                        <th className="p-3 text-[11px] font-semibold text-[#00BFFF] text-center">Faith.</th>
                        <th className="p-3 text-[11px] font-semibold text-[#22C55E] text-center">Relev.</th>
                        <th className="p-3 text-[11px] font-semibold text-[#FACC15] text-center">Recall</th>
                        <th className="p-3 text-[11px] font-semibold text-[#FF6600] text-center">Prec.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...metrics.history].reverse().map((row, i) => (
                        <tr key={i} className="border-b border-surface-container-high last:border-0 hover:bg-surface-container-low/50 transition-colors">
                          <td className="p-3 text-[11px] text-on-surface-variant font-mono whitespace-nowrap">
                            {new Date(row.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </td>
                          <td className="p-2 text-center"><ScoreBadge value={row.faithfulness} target={0.80} /></td>
                          <td className="p-2 text-center"><ScoreBadge value={row.answer_relevancy} target={0.75} /></td>
                          <td className="p-2 text-center"><ScoreBadge value={row.context_recall} target={0.70} /></td>
                          <td className="p-2 text-center"><ScoreBadge value={row.context_precision} target={0.75} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Run button */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => void triggerRun()}
                  disabled={isRunning}
                  className="
                    w-full bg-primary-container text-on-primary py-3 rounded-lg font-semibold
                    hover:brightness-110 transition-all active:scale-95
                    flex items-center justify-center gap-2
                    disabled:opacity-70 disabled:cursor-not-allowed
                  "
                >
                  {isRunning ? (
                    <>
                      <span className="material-symbols-outlined animate-spin" style={{ fontSize: '18px' }}>sync</span>
                      Running evaluation…
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>play_arrow</span>
                      Run New Evaluation
                    </>
                  )}
                </button>
                {runError && (
                  <p role="alert" className="text-[12px] text-[#ef4444] text-center">
                    {runError}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-4">
          <div className="bg-surface-container border border-surface-container-high rounded-lg p-4 flex flex-col gap-4">
            <h2 className="text-[16px] font-semibold text-on-surface">Evaluation Settings</h2>
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-semibold text-on-surface-variant uppercase">Test Set</label>
              <select className="bg-surface-container-lowest border border-surface-container-high text-on-surface rounded p-2 text-[14px] focus:outline-none focus:border-primary-container">
                <option>Default Test Set (25 questions)</option>
                <option>Custom Test Set</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-semibold text-on-surface-variant uppercase">Judge Model</label>
              <select className="bg-surface-container-lowest border border-surface-container-high text-on-surface rounded p-2 text-[14px] focus:outline-none focus:border-primary-container">
                <option>Gemini 1.5 Pro</option>
                <option>GPT-4o</option>
                <option>Claude 3.5 Sonnet</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
