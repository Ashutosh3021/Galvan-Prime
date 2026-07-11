import { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useChat } from '../../hooks/useQuery';
import { useCollections } from '../../hooks/useIngest';
import { useAppState } from '../../store/useAppStore';
import { PROVIDER_LABELS, type QueryCitation } from '../../types';

function CitationChips({ citations }: { citations: QueryCitation[] }) {
  return (
    <div className="mt-3 border-t border-rule pt-3">
      <h4 className="text-[11px] font-semibold text-ink-soft mb-2 flex items-center gap-1">
        <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>library_books</span>
        Sources
      </h4>
      <div className="flex flex-wrap gap-1.5">
        {citations.map((c, i) => (
          <span
            key={i}
            title={`${c.source} — p.${c.page}`}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-cite/30 bg-cite/10 text-cite font-mono text-[11px] cursor-default"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>description</span>
            {c.source} p.{c.page}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function MobileQuery() {
  const { activeCollection } = useAppState();
  const [collection, setCollection] = useState(activeCollection);
  const collections = useCollections();

  const { messages, sessionId, isLoading, error, sendMessage, clearSession, providers } = useChat({ collection });
  const [inputValue, setInputValue] = useState('');
  const [provider, setProvider] = useState('');
  useEffect(() => {
    if (providers && !provider) {
      setProvider(providers.default ?? providers.available[0] ?? '');
    }
  }, [providers, provider]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  function handleSubmit() {
    if (!inputValue.trim() || isLoading) return;
    void sendMessage(inputValue.trim(), provider);
    setInputValue('');
  }

  return (
    <div className="bg-paper text-ink font-sans flex flex-col h-full">
      {/* Top bar */}
      <header className="bg-paper border-b border-rule px-4 py-3 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-cite" style={{ fontSize: '20px' }}>terminal</span>
          <span className="text-[20px] font-bold text-ink tracking-tight">GalvanR.A.G</span>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={clearSession}
              aria-label="Clear chat"
              className="text-ink-soft hover:text-ink transition-colors p-1"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>delete_sweep</span>
            </button>
          )}
          <select
            value={collection}
            onChange={e => setCollection(e.target.value)}
            aria-label="Active collection"
            className="bg-paper-deep border border-rule rounded px-2 py-1 text-ink-soft text-[12px] font-semibold focus:outline-none focus:border-cite"
          >
            {collections.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {providers && providers.available.length > 0 && (
            <select
              value={provider}
              onChange={e => setProvider(e.target.value)}
              aria-label="LLM provider"
              className="bg-paper-deep border border-rule rounded px-2 py-1 text-ink-soft text-[12px] font-semibold focus:outline-none focus:border-cite"
            >
              {providers.available.map(p => (
                <option key={p} value={p}>{PROVIDER_LABELS[p] ?? p}</option>
              ))}
            </select>
          )}
        </div>
      </header>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5 bg-paper" aria-live="polite" aria-label="Chat messages">
        <div className="flex justify-center">
          <div className="bg-paper-deep border border-rule rounded-full px-3 py-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-pass" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
            <span className="text-[11px] font-semibold tracking-[0.05em] text-ink-soft">
              RAG Pipeline Ready · Session {sessionId.slice(0, 8)}…
            </span>
          </div>
        </div>

        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center flex-1 gap-3 text-ink-soft py-16 text-center px-6">
            <span className="material-symbols-outlined text-4xl opacity-30" style={{ fontVariationSettings: "'FILL' 1" }}>chat_bubble</span>
            <p className="text-[14px]">Pick a collection, then ask something like “What are the main findings?”</p>
          </div>
        )}

        {messages.map(m => (
          <div key={m.id} className={`flex gap-3 w-full ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`
              flex-shrink-0 w-8 h-8 flex items-center justify-center border border-rule
              ${m.role === 'assistant' ? 'rounded bg-paper-deep' : 'rounded-full bg-paper-deep'}
            `}>
              <span className="material-symbols-outlined text-cite" style={{ fontSize: '16px' }}>
                {m.role === 'assistant' ? 'smart_toy' : 'person'}
              </span>
            </div>
            <div className={`
              rounded-lg p-3 max-w-[82%] border text-[14px] leading-relaxed
              ${m.role === 'assistant'
                ? 'bg-paper-deep border-rule text-ink'
                : 'bg-paper-deep border-rule text-ink'}
            `}>
              {m.role === 'assistant' ? (
                <div className="prose prose-sm max-w-none [&_code]:font-mono [&_code]:text-[13px] [&_code]:bg-paper [&_code]:text-cite [&_code]:border [&_code]:border-rule [&_code]:px-1 [&_code]:rounded">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              ) : (
                <p>{m.content}</p>
              )}
              {m.citations && m.citations.length > 0 && <CitationChips citations={m.citations} />}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded bg-paper-deep flex items-center justify-center border border-rule">
              <span className="material-symbols-outlined text-cite animate-spin" style={{ fontSize: '16px' }}>sync</span>
            </div>
            <div className="bg-paper-deep border border-rule rounded-lg p-3 flex items-center gap-1.5">
              {[0, 150, 300].map(d => (
                <span key={d} className="h-2 w-2 bg-ink-soft rounded-full" style={{ animationDelay: `${d}ms` }} />
              ))}
            </div>
          </div>
        )}

        {error && (
          <div role="alert" className="flex items-start gap-2 p-3 rounded-lg bg-warn/10 border border-warn/30 text-warn text-[13px]">
            <span className="material-symbols-outlined flex-shrink-0" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>error</span>
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-rule bg-paper">
        <div className="flex items-end gap-2 bg-paper-deep border border-rule rounded-lg p-1 focus-within:border-cite transition-colors">
          <textarea
            rows={1}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
            placeholder="Enter query…"
            aria-label="Question input"
            className="flex-1 bg-transparent border-none text-ink text-[14px] focus:ring-0 resize-none py-2 px-2 max-h-[120px] scrollbar-hide"
          />
          <button
            onClick={handleSubmit}
            disabled={!inputValue.trim() || isLoading}
            aria-label="Send question"
            className="bg-ink text-paper px-3 py-2 rounded-lg flex items-center gap-1 text-[12px] font-semibold hover:opacity-90 transition-opacity active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading
              ? <span className="material-symbols-outlined animate-spin" style={{ fontSize: '16px' }}>sync</span>
              : <><span>ASK</span><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>send</span></>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
