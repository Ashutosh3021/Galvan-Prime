import { Icon } from '../ui/Icon';

interface MetricCardProps {
  label: string;
  value: number;
  target: number;
  icon: string;
  color: string;
}

export function MetricCard({ label, value, target, icon, color }: MetricCardProps) {
  const passes = value >= target;
  const pct = Math.round(value * 100);
  const targetPct = Math.round(target * 100);

  return (
    <div className="bg-surface-container border border-surface-container-high rounded-xl p-5 flex flex-col gap-3 relative overflow-hidden hover:border-surface-variant transition-colors">
      <div className="absolute top-0 left-0 w-full h-0.5 transition-opacity" style={{ background: color, opacity: passes ? 0.8 : 0.4 }} aria-hidden="true" />

      <div className="flex items-center justify-between">
        <span className="text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant uppercase">{label}</span>
        <Icon name={icon} size={18} filled className="flex-shrink-0" style={{ color }} />
      </div>

      <div className="flex items-baseline gap-3">
        <span className="text-[36px] font-bold leading-none text-on-surface">{value.toFixed(2)}</span>
        <span className={`text-[12px] font-bold px-2 py-1 rounded-full ${passes ? 'bg-[#22c55e]/15 text-[#22c55e]' : 'bg-[#ef4444]/15 text-[#ef4444]'}`} role="status">
          {passes ? '✓ PASS' : '✗ FAIL'}
        </span>
      </div>

      <div className="space-y-1">
        <div className="w-full bg-surface-container-lowest h-1.5 rounded-full overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${label}: ${pct}%`}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
        </div>
        <div className="flex justify-between text-[11px] text-on-surface-variant/60">
          <span>Score: {pct}%</span>
          <span>Target: &gt;{targetPct}%</span>
        </div>
      </div>
    </div>
  );
}
