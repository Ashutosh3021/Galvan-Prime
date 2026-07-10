import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { EvalMetricsHistory } from '../../types';

interface ScoreChartProps {
  history: EvalMetricsHistory[];
}

const METRICS = [
  { key: 'faithfulness',      label: 'Faithfulness',      color: '#00BFFF', target: 0.80 },
  { key: 'answer_relevancy',  label: 'Answer Relevancy',  color: '#22C55E', target: 0.75 },
  { key: 'context_recall',    label: 'Context Recall',    color: '#FACC15', target: 0.70 },
  { key: 'context_precision', label: 'Context Precision', color: '#FF6600', target: 0.75 },
] as const;

function formatTs(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

interface TooltipPayload {
  name: string;
  value: number | null;
  color: string;
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a2338] border border-[#303443] rounded-lg p-3 shadow-xl text-[13px]">
      <p className="text-[#e3bfb1] font-semibold mb-2">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="text-[#dee2f5]">{p.name}:</span>
          <span className="font-mono font-bold" style={{ color: p.color }}>{p.value == null ? 'N/A' : p.value.toFixed(3)}</span>
        </div>
      ))}
    </div>
  );
}

export function ScoreChart({ history }: ScoreChartProps) {
  const data = history.map(h => ({
    ts: formatTs(h.timestamp),
    faithfulness: h.faithfulness,
    answer_relevancy: h.answer_relevancy,
    context_recall: h.context_recall,
    context_precision: h.context_precision,
  }));

  return (
    // min-h forces recharts to get a real height; w-full with block display gives real width
    <div className="w-full" style={{ minHeight: '288px', height: '288px' }}>
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <LineChart data={data} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#252a38" vertical={false} />
          <XAxis
            dataKey="ts"
            tick={{ fill: '#e3bfb1', fontSize: 11 }}
            axisLine={{ stroke: '#303443' }}
            tickLine={false}
          />
          <YAxis
            domain={[0.5, 1]}
            tick={{ fill: '#e3bfb1', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => v.toFixed(1)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
            formatter={(value: string) => (
              <span style={{ color: '#dee2f5', fontSize: '12px' }}>{value}</span>
            )}
          />
          {/* Target reference lines */}
          {METRICS.map(m => (
            <ReferenceLine
              key={m.key}
              y={m.target}
              stroke={m.color}
              strokeDasharray="4 4"
              strokeOpacity={0.3}
            />
          ))}
          {METRICS.map(m => (
            <Line
              key={m.key}
              type="monotone"
              dataKey={m.key}
              name={m.label}
              stroke={m.color}
              strokeWidth={2}
              dot={{ fill: m.color, r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
