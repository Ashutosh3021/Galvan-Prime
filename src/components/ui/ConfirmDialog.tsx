import * as Dialog from '@radix-ui/react-dialog';
import { Icon } from './Icon';
import type { ReactNode } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  destructive?: boolean;
  children?: ReactNode;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  destructive = false,
}: ConfirmDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm animate-fade-in" />
        <Dialog.Content
          className="
            fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50
            bg-paper-deep border border-rule rounded-xl shadow-card
            w-[90vw] max-w-md p-6 flex flex-col gap-5
          "
        >
          <div className="flex items-start gap-3">
            <Icon
              name={destructive ? 'warning' : 'info'}
              size={22}
              filled
              className={`mt-0.5 flex-shrink-0 ${destructive ? 'text-warn' : 'text-cite'}`}
            />
            <div>
              <Dialog.Title className="text-[18px] font-semibold text-on-surface">{title}</Dialog.Title>
              <Dialog.Description className="text-[14px] text-on-surface-variant mt-1 leading-relaxed">
                {description}
              </Dialog.Description>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-2">
            <Dialog.Close asChild>
              <button className="px-4 py-2 rounded-lg text-[14px] font-semibold text-on-surface-variant border border-surface-container-high hover:bg-surface-container transition-colors">
                {cancelLabel}
              </button>
            </Dialog.Close>
            <button
              onClick={() => { onConfirm(); onOpenChange(false); }}
              className={`px-4 py-2 rounded-lg text-[14px] font-semibold text-paper transition-all hover:opacity-90 active:scale-95 ${destructive ? 'bg-warn' : 'bg-ink'}`}
            >
              {confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
