import * as RadixToast from '@radix-ui/react-toast';
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { Icon } from './Icon';

type ToastVariant = 'success' | 'error';

interface ToastItem {
  id: string;
  variant: ToastVariant;
  message: string;
}

interface ToastContextValue {
  toast: (variant: ToastVariant, message: string) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => undefined });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((variant: ToastVariant, message: string) => {
    setToasts(prev => [...prev, { id: crypto.randomUUID(), variant, message }]);
  }, []);

  function remove(id: string) {
    setToasts(prev => prev.filter(t => t.id !== id));
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      <RadixToast.Provider swipeDirection="right" duration={4000}>
        {children}
        {toasts.map(t => (
          <RadixToast.Root
            key={t.id}
            onOpenChange={open => { if (!open) remove(t.id); }}
            className={`
              relative flex items-start gap-3 w-80 rounded-lg shadow-xl
              bg-paper-deep border border-rule
              pl-4 pr-3 py-3
              data-[state=open]:animate-fade-in
              data-[state=closed]:opacity-0 data-[state=closed]:translate-x-4
              transition-all duration-200
              before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:rounded-l-lg
              ${t.variant === 'success' ? 'before:bg-pass' : 'before:bg-warn'}
            `}
          >
            <Icon
              name={t.variant === 'success' ? 'check_circle' : 'error'}
              size={18}
              className={`mt-0.5 flex-shrink-0 ${t.variant === 'success' ? 'text-pass' : 'text-warn'}`}
              filled
            />
            <RadixToast.Description className="flex-1 text-[13px] text-ink leading-relaxed">
              {t.message}
            </RadixToast.Description>
            <RadixToast.Close aria-label="Dismiss notification" className="text-ink-soft hover:text-ink transition-colors p-0.5 -mt-0.5">
              <Icon name="close" size={16} className="text-ink-soft hover:text-ink" />
            </RadixToast.Close>
          </RadixToast.Root>
        ))}
        <RadixToast.Viewport className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-80 outline-none" />
      </RadixToast.Provider>
    </ToastContext.Provider>
  );
}
