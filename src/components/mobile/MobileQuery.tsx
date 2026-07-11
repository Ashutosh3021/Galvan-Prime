import { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useChat } from '../../hooks/useQuery';
import { useCollections } from '../../hooks/useIngest';
import { useAppState } from '../../store/useAppStore';
import { PROVIDER_LABELS, type QueryCitation } from '../../types';

function CitationChips({ citations }: { citations: QueryCitation[] }) {
  return (
    <div className="mt-3 border-t border-[#2D3748] pt-3">
      <h4 className="text-[11px] font-semibold text-[#e3bfb1] mb-2 flex items-center gap-1">
        <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>library_books</span>
        Sources
      </h4>
      <div className="flex flex-wrap gap-1.5">
        {citations.map((c, i) => (
          <span
            key={i}
            title={`${c.source} — p.${c.page}`}
            className="
              inline-flex items-center gap-1 px-2 py-0.5 rounded
              border border-[#00BFFF]/30 bg-[#00BFFF]/10
              text-[#00BFFF] font-mono text-[11px] cursor-default
              hover:bg-[#00BFFF]/20 transition-colors
            "
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
    <div className="bg-[#001231] text-[#d7e2ff] font-sans flex flex-col h-full">
      {/* Top bar */}
      <header className="bg-[#001231] border-b border-[#5a4136] px-4 py-3 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#ffb596]" style={{ fontSize: '20px' }}>terminal</span>
          <span className="text-[20px] font-bold text-[#ff6600] tracking-tight">GalvanR.A.G</span>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={clearSession}
              aria-label="Clear chat"
              className="text-[#e3bfb1] hover:text-[#ff6600] transition-colors p-1"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>delete_sweep</span>
            </button>
          )}
          {/* Collection selector */}
          <select
            value={collection}
            onChange={e => setCollection(e.target.value)}
            aria-label="Active collection"
            className="
              bg-[#001a40] border border-[#5a4136] rounded px-2 py-1
              text-[#e3bfb1] text-[12px] font-semibold
              focus:outline-none focus:border-[#ff6600]
            "
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
              className="bg-[#001a40] border border-[#5a4136] rounded px-2 py-1 text-[#e3bfb1] text-[12px] font-semibold focus:outline-none focus:border-[#ff6600]"
            >
              {providers.available.map(p => (
                <option key={p} value={p}>{PROVIDER_LABELS[p] ?? p}</option>
              ))}
            </select>
          )}
        </div>
      </header>

      {/* Chat area */}
      <div
        className="flex-1 overflow-y-auto p-4 flex flex-col gap-5 bg-[#001231]"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {/* Pipeline status badge */}
        <div className="flex justify-center">
          <div className="bg-[#001a40] border border-[#5a4136] rounded-full px-3 py-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#4ae176]" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
            <span className="text-[11px] font-semibold tracking-[0.05em] text-[#e3bfb1]">
              RAG Pipeline Ready · Session {sessionId.slice(0, 8)}…
            </span>
          </div>
        </div>

        {/* Empty state */}
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center flex-1 gap-3 text-[#e3bfb1]/50 py-16">
            <span className="material-symbols-outlined text-4xl opacity-30" style={{ fontVariationSettings: "'FILL' 1" }}>chat_bubble</span>
            <p className="text-[14px]">Ask anything about your documents</p>
          </div>
        )}

        {/* Messages */}
        {messages.map(m => (
          <div
            key={m.id}
            className={`flex gap-3 w-full ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`
              flex-shrink-0 w-8 h-8 flex items-center justify-center border border-[#2D3748]
              ${m.role === 'assistant' ? 'rounded bg-[#133466]' : 'rounded-full bg-[#02285b]'}
            `}>
              <span className="material-symbols-outlined text-[#ff6600]" style={{ fontSize: '16px' }}>
                {m.role === 'assistant' ? 'smart_toy' : 'person'}
              </span>
            </div>
            <div className={`
              rounded-lg p-3 max-w-[82%] border text-[14px] leading-relaxed
              ${m.role === 'assistant'
                ? 'bg-[#1A2338] border-[#2D3748] text-[#d7e2ff]'
                : 'bg-[#001e48] border-[#5a4136] text-[#d7e2ff]'
              }
            `}>
              {m.role === 'assistant' ? (
                <div className="
                  prose prose-invert prose-sm max-w-none
                  [&_code]:font-mono [&_code]:text-[#00BFFF] [&_code]:bg-[#000d27]
                  [&_code]:px-1 [&_code]:rounded [&_code]:text-[12px]
                  [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0.5
                ">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              ) : (
                <p>{m.content}</p>
              )}
              {m.citations && m.citations.length > 0 && <CitationChips citations={m.citations} />}
            </div>
          </div>
        ))}

        {/* Loading */}
        {isLoading && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded bg-[#133466] flex items-center justify-center border border-[#2D3748]">
              <span className="material-symbols-outlined text-[#ff6600] animate-spin" style={{ fontSize: '16px' }}>sync</span>
            </div>
            <div className="bg-[#1A2338] border border-[#2D3748] rounded-lg p-3 flex items-center gap-1.5">
              {[0, 150, 300].map(d => (
                <span key={d} className="h-2 w-2 bg-[#e3bfb1] rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div role="alert" className="flex items-start gap-2 p-3 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/30 text-[#ef4444] text-[13px]">
            <span className="material-symbols-outlined flex-shrink-0" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>error</span>
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-[#5a4136] bg-[#001231]">
        <div className="flex items-end gap-2 bg-[#0A0F1C] border border-[#2D3748] rounded-lg p-1 focus-within:border-[#ff6600] transition-colors">
          <textarea
            rows={1}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
            placeholder="Enter query…"
            aria-label="Question input"
            className="flex-1 bg-transparent border-none text-[#d7e2ff] text-[14px] focus:ring-0 resize-none py-2 px-2 max-h-[120px] scrollbar-hide"
          />
          <button
            onClick={handleSubmit}
            disabled={!inputValue.trim() || isLoading}
            aria-label="Send question"
            className="
              bg-[#ff6600] text-white px-3 py-2 rounded-lg
              flex items-center gap-1 text-[12px] font-semibold
              hover:bg-[#ff6600]/90 transition-colors active:scale-95
              disabled:opacity-50 disabled:cursor-not-allowed
            "
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
