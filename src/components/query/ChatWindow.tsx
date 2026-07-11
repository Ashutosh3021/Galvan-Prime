import { useRef, useEffect } from 'react';
import { MessageBubble } from './MessageBubble';
import { Icon } from '../ui/Icon';
import type { ChatMessage } from '../../types';

function TypingIndicator() {
  return (
    <div className="flex justify-start w-full gap-3" role="status" aria-label="Assistant is retrieving context">
      <div className="w-8 h-8 rounded-full bg-paper-deep border border-rule flex items-center justify-center flex-shrink-0 mt-1">
        <Icon name="sync" size={18} className="text-cite animate-spin" />
      </div>
      <div className="bg-paper-deep text-ink-soft px-5 py-3 rounded-lg border border-rule flex items-center gap-2">
        <span className="text-[13px]">Retrieving context…</span>
      </div>
    </div>
  );
}

function EmptyState({ onSample }: { onSample?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-ink-soft py-24 select-none">
      <Icon name="chat_bubble" size={40} className="opacity-40" />
      <p className="text-[16px] font-semibold text-ink/80">Pick a collection, then ask a question</p>
      <p className="text-[13px] opacity-70">Try something like “What are the main findings?”</p>
      {onSample && (
        <button
          onClick={onSample}
          className="mt-1 text-[13px] font-semibold text-cite hover:underline underline-offset-2"
        >
          Use that example
        </button>
      )}
    </div>
  );
}

interface ChatWindowProps {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
  onSample?: () => void;
}

export function ChatWindow({ messages, isLoading, error, onRetry, onSample }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto px-6 md:px-8 py-6 space-y-6 custom-scrollbar" aria-live="polite" aria-label="Chat messages">
      {messages.length === 0 && !isLoading ? (
        <EmptyState onSample={onSample} />
      ) : (
        <>
          {messages.map(m => <MessageBubble key={m.id} message={m} />)}
          {isLoading && <TypingIndicator />}
        </>
      )}

      {error && (
        <div role="alert" className="flex items-start gap-3 p-4 rounded-lg bg-warn/10 border border-warn/30 text-warn">
          <Icon name="error" size={18} filled className="flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold">The query returned no answer.</p>
            <p className="text-[13px] mt-0.5 opacity-80">{error}</p>
          </div>
          {onRetry && (
            <button onClick={onRetry} className="flex-shrink-0 px-3 py-1.5 rounded-lg border border-warn/50 text-[12px] font-semibold hover:bg-warn/20 transition-colors">
              Retry
            </button>
          )}
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
