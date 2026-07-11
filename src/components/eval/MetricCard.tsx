import { Icon } from '../ui/Icon';

interface MetricCardProps {
  label: string;
  value: number | null;
  target: number;
  icon: string;
  color: string;
}

export function MetricCard({ label, value, target, icon, color }: MetricCardProps) {
  const isNull = value == null;
  const passes = !isNull && value >= target;

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-rule last:border-b-0">
      <div className="flex items-center gap-2 min-w-0">
        <Icon name={icon} size={16} filled className="flex-shrink-0" style={{ color }} />
        <span className="text-[14px] font-medium text-ink truncate">{label}</span>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="font-mono text-[15px] text-ink">{isNull ? '—' : value.toFixed(2)}</span>
        <span
          className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${passes ? 'bg-pass/15 text-pass' : 'bg-warn/15 text-warn'}`}
          role="status"
        >
          {passes ? 'PASS' : 'FAIL'}
        </span>
        <span className="font-mono text-[12px] text-ink-soft w-24 text-right hidden sm:inline">
          target › {Math.round(target * 100)}%
        </span>
      </div>
    </div>
  );
}
