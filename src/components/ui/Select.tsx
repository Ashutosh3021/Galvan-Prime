import * as RadixSelect from '@radix-ui/react-select';
import { Icon } from './Icon';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onValueChange: (v: string) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  id?: string;
  disabled?: boolean;
}

export function Select({
  value,
  onValueChange,
  options,
  placeholder = 'Select…',
  label,
  id,
  disabled = false,
}: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={id}
          className="text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant uppercase"
        >
          {label}
        </label>
      )}
      <RadixSelect.Root value={value} onValueChange={onValueChange} disabled={disabled}>
        <RadixSelect.Trigger
          id={id}
          aria-label={label ?? placeholder}
          className="
            flex items-center justify-between w-full
            bg-surface-container-lowest border border-surface-container-high
            text-on-surface rounded px-3 py-2 text-[14px]
            hover:border-primary-container/60
            focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
          "
        >
          <RadixSelect.Value placeholder={placeholder} />
          <RadixSelect.Icon>
            <Icon name="expand_more" size={18} className="text-on-surface-variant" />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>

        <RadixSelect.Portal>
          <RadixSelect.Content
            position="popper"
            sideOffset={4}
            className="
              z-50 bg-paper-deep border border-rule rounded-lg shadow-card
              overflow-hidden w-[var(--radix-select-trigger-width)]
              animate-fade-in
            "
          >
            <RadixSelect.Viewport className="p-1">
              {options.map(opt => (
                <RadixSelect.Item
                  key={opt.value}
                  value={opt.value}
                  className="
                    relative flex items-center px-3 py-2 rounded text-[14px] text-on-surface
                    cursor-pointer select-none outline-none
                    hover:bg-surface-container-high
                    data-[state=checked]:text-primary-container data-[state=checked]:bg-primary-container/10
                    focus:bg-surface-container-high
                  "
                >
                  <RadixSelect.ItemText>{opt.label}</RadixSelect.ItemText>
                  <RadixSelect.ItemIndicator className="absolute right-3">
                    <Icon name="check" size={14} className="text-primary-container" />
                  </RadixSelect.ItemIndicator>
                </RadixSelect.Item>
              ))}
            </RadixSelect.Viewport>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>
    </div>
  );
}
