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

  if (isUser) {
    return (
      <div className="flex justify-end w-full animate-fade-in">
        <div className="max-w-[80%] flex flex-col items-end gap-1">
          <div className="bg-surface-container-high text-on-surface px-5 py-3 rounded-2xl rounded-tr-sm border border-surface-container-highest shadow-sm">
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
          </div>
          {message.timestamp && (
            <span className="text-[11px] text-on-surface-variant/60 px-1">{formatTime(message.timestamp)}</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start w-full gap-3 animate-fade-in">
      <div className="w-8 h-8 rounded-full bg-primary-container/20 border border-primary-container/40 flex items-center justify-center flex-shrink-0 mt-1">
        <Icon name="psychology" size={18} filled className="text-primary-container" />
      </div>

      <div className="flex-1 min-w-0 max-w-[85%] flex flex-col gap-2">
        <div className="bg-surface-container text-on-surface px-5 py-4 rounded-2xl rounded-tl-sm border border-surface-container-high shadow-sm">
          <div className="prose prose-invert prose-sm max-w-none text-[15px] leading-relaxed text-on-surface/90
            [&_code]:font-mono [&_code]:text-[13px] [&_code]:bg-surface-container-lowest
            [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-secondary-container
            [&_code]:border [&_code]:border-surface-container-highest
            [&_pre]:bg-surface-container-lowest [&_pre]:border [&_pre]:border-surface-container-highest
            [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:overflow-x-auto
            [&_strong]:text-on-surface [&_strong]:font-semibold
            [&_ul]:my-2 [&_li]:my-0.5 [&_p]:my-1">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
          {message.citations && message.citations.length > 0 && (
            <CitationsPanel citations={message.citations} />
          )}
        </div>

        <div className="flex items-center gap-1 px-1">
          <button
            onClick={handleCopy}
            aria-label={copied ? 'Copied' : 'Copy answer'}
            title={copied ? 'Copied!' : 'Copy answer'}
            className="text-on-surface-variant hover:text-on-surface transition-colors p-1.5 rounded hover:bg-surface-container"
          >
            <Icon name={copied ? 'check' : 'content_copy'} size={15} />
          </button>
          {message.timestamp && (
            <span className="text-[11px] text-on-surface-variant/60 ml-1">{formatTime(message.timestamp)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
