import { Icon } from '../ui/Icon';
import type { EvalMetricsHistory } from '../../types';

const TARGETS = { faithfulness: 0.80, answer_relevancy: 0.75, context_recall: 0.70, context_precision: 0.75 };

function ScoreBadge({ value, target }: { value: number | null; target: number }) {
  if (value == null) {
    return (
      <span className="inline-block text-[12px] font-bold font-mono px-2 py-0.5 rounded text-on-surface-variant bg-surface-container-high">
        N/A
      </span>
    );
  }
  const passes = value >= target;
  return (
    <span className={`inline-block text-[12px] font-bold font-mono px-2 py-0.5 rounded ${passes ? 'text-[#22c55e] bg-[#22c55e]/15' : 'text-[#ef4444] bg-[#ef4444]/15'}`}>
      {value.toFixed(3)}
    </span>
  );
}

function rowPasses(row: EvalMetricsHistory): boolean {
  // A missing score counts as a failure (null → 0 < target).
  return (row.faithfulness ?? 0) >= TARGETS.faithfulness && (row.answer_relevancy ?? 0) >= TARGETS.answer_relevancy && (row.context_recall ?? 0) >= TARGETS.context_recall && (row.context_precision ?? 0) >= TARGETS.context_precision;
}

export function HistoryTable({ history, onExportCsv }: { history: EvalMetricsHistory[]; onExportCsv: () => void }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-on-surface flex items-center gap-2">
          <Icon name="history" size={18} className="text-on-surface-variant" />
          Evaluation History
        </h3>
        <button
          onClick={onExportCsv}
          aria-label="Export evaluation history as CSV"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-surface-container-high text-on-surface-variant text-[12px] font-semibold hover:bg-surface-container hover:text-on-surface transition-colors"
        >
          <Icon name="download" size={15} />
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-surface-container-high">
        <table className="w-full text-left border-collapse" aria-label="Evaluation history">
          <thead>
            <tr className="bg-surface-container-lowest border-b border-surface-container-high">
              <th className="p-3 text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant whitespace-nowrap">Run Time</th>
              <th className="p-3 text-[12px] font-semibold tracking-[0.05em] text-[#00BFFF] text-center">Faithfulness</th>
              <th className="p-3 text-[12px] font-semibold tracking-[0.05em] text-[#22C55E] text-center">Ans. Relevancy</th>
              <th className="p-3 text-[12px] font-semibold tracking-[0.05em] text-[#FACC15] text-center">Ctx. Recall</th>
              <th className="p-3 text-[12px] font-semibold tracking-[0.05em] text-[#FF6600] text-center">Ctx. Precision</th>
              <th className="p-3 text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {[...history].reverse().map((row, i) => (
              <tr key={i} className="border-b border-surface-container-high last:border-0 hover:bg-surface-container-low/50 transition-colors">
                <td className="p-3 text-[13px] text-on-surface-variant whitespace-nowrap font-mono">
                  {new Date(row.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="p-3 text-center"><ScoreBadge value={row.faithfulness} target={TARGETS.faithfulness} /></td>
                <td className="p-3 text-center"><ScoreBadge value={row.answer_relevancy} target={TARGETS.answer_relevancy} /></td>
                <td className="p-3 text-center"><ScoreBadge value={row.context_recall} target={TARGETS.context_recall} /></td>
                <td className="p-3 text-center"><ScoreBadge value={row.context_precision} target={TARGETS.context_precision} /></td>
                <td className="p-3 text-center">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${rowPasses(row) ? 'bg-[#22c55e]/15 text-[#22c55e]' : 'bg-[#ef4444]/15 text-[#ef4444]'}`}>
                    {rowPasses(row) ? 'PASS' : 'FAIL'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
