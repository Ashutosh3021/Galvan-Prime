import { useRef, useEffect } from 'react';
import { MessageBubble } from './MessageBubble';
import { Icon } from '../ui/Icon';
import type { ChatMessage } from '../../types';

function TypingIndicator() {
  return (
    <div className="flex justify-start w-full gap-3 animate-fade-in" role="status" aria-label="Assistant is thinking">
      <div className="w-8 h-8 rounded-full bg-primary-container/20 border border-primary-container/40 flex items-center justify-center flex-shrink-0 mt-1">
        <Icon name="sync" size={18} className="text-primary-container animate-spin" />
      </div>
      <div className="bg-surface-container text-on-surface-variant px-5 py-3 rounded-2xl rounded-tl-sm border border-surface-container-high flex items-center gap-1.5">
        {[0, 150, 300].map(delay => (
          <span key={delay} className="w-2 h-2 bg-primary-container/60 rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} aria-hidden="true" />
        ))}
        <span className="text-[13px] ml-2">Retrieving context…</span>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-on-surface-variant py-24 select-none">
      <Icon name="chat_bubble" size={48} filled className="opacity-30" />
      <p className="text-[16px] font-semibold opacity-60">Ask anything about your documents</p>
      <p className="text-[13px] opacity-40">Select a collection and send a question below</p>
    </div>
  );
}

interface ChatWindowProps {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
}

export function ChatWindow({ messages, isLoading, error, onRetry }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto px-6 md:px-8 py-6 space-y-8 custom-scrollbar" aria-live="polite" aria-label="Chat messages">
      {messages.length === 0 && !isLoading ? (
        <EmptyState />
      ) : (
        <>
          {messages.map(m => <MessageBubble key={m.id} message={m} />)}
          {isLoading && <TypingIndicator />}
        </>
      )}

      {error && (
        <div role="alert" className="flex items-start gap-3 p-4 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/30 text-[#ef4444]">
          <Icon name="error" size={18} filled className="flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold">Request failed</p>
            <p className="text-[13px] mt-0.5 opacity-80">{error}</p>
          </div>
          {onRetry && (
            <button onClick={onRetry} className="flex-shrink-0 px-3 py-1.5 rounded-lg border border-[#ef4444]/50 text-[#ef4444] text-[12px] font-semibold hover:bg-[#ef4444]/20 transition-colors">
              Retry
            </button>
          )}
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
