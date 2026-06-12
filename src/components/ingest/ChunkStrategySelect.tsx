import { Icon } from '../ui/Icon';

interface ChunkStrategySelectProps {
  value: 'fixed' | 'semantic';
  onChange: (v: 'fixed' | 'semantic') => void;
  disabled?: boolean;
}

const OPTIONS = [
  {
    value: 'semantic' as const,
    label: 'Semantic',
    desc: 'Sentence-boundary segmentation. Better context coherence.',
    icon: 'auto_awesome',
  },
  {
    value: 'fixed' as const,
    label: 'Fixed Size (512 tokens)',
    desc: 'Uniform 512-token windows with overlap. Faster ingestion.',
    icon: 'grid_on',
  },
];

export function ChunkStrategySelect({ value, onChange, disabled = false }: ChunkStrategySelectProps) {
  return (
    <fieldset disabled={disabled}>
      <legend className="text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant uppercase mb-3">
        Chunk Strategy
      </legend>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {OPTIONS.map(opt => {
          const isSelected = value === opt.value;
          return (
            <label
              key={opt.value}
              className={`
                flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all
                ${isSelected
                  ? 'border-primary-container bg-primary-container/10 text-on-surface'
                  : 'border-surface-container-high hover:border-primary-container/40 text-on-surface-variant'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <input
                type="radio"
                name="chunk-strategy"
                value={opt.value}
                checked={isSelected}
                onChange={() => onChange(opt.value)}
                className="sr-only"
              />
              <Icon
                name={opt.icon}
                size={20}
                className={`mt-0.5 flex-shrink-0 ${isSelected ? 'text-primary-container' : 'text-on-surface-variant'}`}
              />
              <div className="flex-1 min-w-0">
                <div className={`text-[14px] font-semibold ${isSelected ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                  {opt.label}
                </div>
                <div className="text-[12px] text-on-surface-variant mt-0.5 leading-snug">{opt.desc}</div>
              </div>
              {isSelected && (
                <Icon name="check_circle" size={18} filled className="text-primary-container flex-shrink-0" />
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
