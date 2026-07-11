import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { CitationsPanel } from './CitationsPanel';
import { Icon } from '../ui/Icon';
import type { ChatMessage } from '../../types';

function formatTime(iso: string): string {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export function MessageBubble({ message }: { message: ChatMessage }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  function handleCopy() {
    void navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Questions read as margin notes; answers read as annotated body text.
  if (isUser) {
    return (
      <div className="w-full">
        <p className="text-[14px] text-ink-soft">
          <span className="font-mono font-semibold text-ink mr-1.5">Q.</span>
          {message.content}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-2 animate-fade-in">
      <div className="pl-3 border-l-2 border-rule">
        <div className="font-serif text-[16px] leading-relaxed text-ink
          [&_code]:font-mono [&_code]:text-[13px] [&_code]:bg-paper-deep [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-cite [&_code]:border [&_code]:border-rule
          [&_pre]:bg-paper-deep [&_pre]:border [&_pre]:border-rule [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:font-mono [&_pre]:text-[13px]
          [&_strong]:font-semibold [&_ul]:my-2 [&_li]:my-0.5 [&_p]:my-1">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
        {message.citations && message.citations.length > 0 && (
          <CitationsPanel citations={message.citations} />
        )}
      </div>

      <div className="flex items-center gap-1 pl-3">
        <button
          onClick={handleCopy}
          aria-label={copied ? 'Copied' : 'Copy answer'}
          title={copied ? 'Copied!' : 'Copy answer'}
          className="text-ink-soft hover:text-ink transition-colors p-1.5 rounded hover:bg-paper-deep"
        >
          <Icon name={copied ? 'check' : 'content_copy'} size={15} />
        </button>
        {message.timestamp && (
          <span className="text-[11px] text-ink-soft/70 ml-1">{formatTime(message.timestamp)}</span>
        )}
      </div>
    </div>
  );
}
