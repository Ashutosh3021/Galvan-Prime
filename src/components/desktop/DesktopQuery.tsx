import { useState, useRef, useEffect } from 'react';
import type { ChatMessage, QuerySession, Citation } from '../../types';

const sessions: QuerySession[] = [
  { id: 'abc123-research',       label: 'abc123-research',        isActive: true },
  { id: 'Q3_financial_analysis', label: 'Q3_financial_analysis'                  },
  { id: 'API_auth_flow_debug',   label: 'API_auth_flow_debug'                    },
  { id: 'Core_Architecture',     label: 'Core Architecture Docs', isSaved: true  },
];

function SessionSidebar({ activeId, onSelect }: { activeId: string; onSelect: (id: string) => void }) {
  return (
    <aside className="w-64 flex-shrink-0 border-r border-surface-container-high bg-surface-container-low flex flex-col">
      <div className="p-4 border-b border-surface-container-high">
        <button className="w-full flex items-center justify-center gap-2 bg-primary-container/10 text-primary-container border border-primary-container/30 hover:bg-primary-container/20 transition-colors py-2 rounded-lg text-[12px] font-semibold tracking-[0.05em]">
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
          New Session
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className="text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant px-2 py-2 mt-2 mb-1 opacity-70">Recent</div>
        {sessions.filter(s => !s.isSaved).map(s => (
          <button key={s.id} onClick={() => onSelect(s.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg relative group text-left ${
              activeId === s.id
                ? 'bg-surface-bright/50 text-on-surface border border-surface-container-high'
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors'
            }`}>
            {activeId === s.id && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-primary-container rounded-r-full" />}
            <span className={`material-symbols-outlined ${activeId === s.id ? 'text-primary-container' : 'opacity-70'}`} style={{ fontSize: '18px' }}>
              {activeId === s.id ? 'chat_bubble' : 'history'}
            </span>
            <div className="flex-1 truncate text-[14px] font-medium">{s.label}</div>
          </button>
        ))}
        <div className="text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant px-2 py-2 mt-4 mb-1 opacity-70">Saved Contexts</div>
        {sessions.filter(s => s.isSaved).map(s => (
          <button key={s.id} onClick={() => onSelect(s.id)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors group text-left">
            <span className="material-symbols-outlined text-secondary-container opacity-70" style={{ fontSize: '18px' }}>bookmark</span>
            <div className="flex-1 truncate text-[14px]">{s.label}</div>
          </button>
        ))}
      </div>
    </aside>
  );
}

const initialMessages: ChatMessage[] = [
  { id: '1', role: 'user', content: 'Summarize the latency issues reported in the Q3 network logs and cross-reference them with the updated routing protocols.', timestamp: 'Today, 14:02 UTC' },
  { id: '2', role: 'bot', content: 'Based on the ingested Q3 network logs and the current routing documentation, the latency spikes correlate strongly with the deployment of protocol <code>v2.4.1-alpha</code> in the US-East region.\n\nThe logs indicate an average latency increase of 45ms during peak loads. The routing protocols stipulate fallback mechanisms, but they were not triggered due to the threshold being set at 50ms.', citations: [{ filename: 'Q3_Network_Logs_Raw.csv', reference: 'Lines 402-510', icon: 'description' }, { filename: 'Routing_Protocols_v2.pdf', reference: 'Pg 14', icon: 'picture_as_pdf' }], timestamp: 'Today, 14:02 UTC' },
  { id: '3', role: 'user', content: 'Can we adjust that threshold dynamically? Show me the specific code block responsible.', timestamp: 'Today, 14:03 UTC' },
];

function CitationChip({ citation }: { citation: Citation }) {
  return (
    <button className="group flex items-center gap-2 bg-secondary-container/5 hover:bg-secondary-container/10 border border-secondary-container/20 hover:border-secondary-container/40 rounded-full px-3 py-1.5 transition-all text-secondary-container text-[14px]">
      <span className="material-symbols-outlined opacity-70 group-hover:opacity-100" style={{ fontSize: '14px' }}>{citation.icon}</span>
      {citation.filename}
      <span className="text-[12px] opacity-50 ml-1">{citation.reference}</span>
    </button>
  );
}

function BotMessage({ message }: { message: ChatMessage }) {
  return (
    <div className="flex justify-start w-full gap-4">
      <div className="w-8 h-8 rounded-full bg-primary-container/20 border border-primary-container/40 flex items-center justify-center flex-shrink-0 mt-1">
        <span className="material-symbols-outlined text-primary-container" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>psychology</span>
      </div>
      <div className="max-w-[85%] flex flex-col gap-3">
        <div className="bg-surface-container text-on-surface px-5 py-4 rounded-2xl rounded-tl-sm border border-surface-container-high shadow-sm">
          <div className="text-[16px] leading-relaxed text-on-surface/90 mb-4"
            dangerouslySetInnerHTML={{ __html: message.content.replace(/<code>(.*?)<\/code>/g, '<code class="font-mono text-[14px] bg-[#05070A] px-1.5 py-0.5 rounded text-secondary-container border border-surface-container-highest">$1</code>') }} />
          {message.citations && message.citations.length > 0 && (
            <div className="mt-5 pt-4 border-t border-surface-container-highest">
              <div className="text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant mb-2 flex items-center gap-1.5">
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>library_books</span>
                Sources Cited
              </div>
              <div className="flex flex-wrap gap-2">
                {message.citations.map(c => <CitationChip key={c.filename} citation={c} />)}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 px-1">
          <button className="text-on-surface-variant hover:text-primary-container transition-colors p-1"><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>thumb_up</span></button>
          <button className="text-on-surface-variant hover:text-error transition-colors p-1"><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>thumb_down</span></button>
          <button className="text-on-surface-variant hover:text-on-surface transition-colors p-1 ml-2"><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>content_copy</span></button>
        </div>
      </div>
    </div>
  );
}

function UserMessage({ message }: { message: ChatMessage }) {
  return (
    <div className="flex justify-end w-full">
      <div className="max-w-[80%] flex flex-col items-end gap-1">
        <div className="bg-surface-container-high text-on-surface px-5 py-3 rounded-2xl rounded-tr-sm border border-surface-container-highest shadow-sm">
          <p className="text-[16px] leading-relaxed">{message.content}</p>
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start w-full gap-4">
      <div className="w-8 h-8 rounded-full bg-primary-container/20 border border-primary-container/40 flex items-center justify-center flex-shrink-0 mt-1">
        <span className="material-symbols-outlined text-primary-container animate-spin" style={{ fontSize: '18px' }}>sync</span>
      </div>
      <div className="bg-surface-container text-on-surface-variant px-5 py-3 rounded-2xl rounded-tl-sm border border-surface-container-high flex items-center gap-2">
        <div className="flex space-x-1">
          {[0, 150, 300].map(delay => (
            <div key={delay} className="w-2 h-2 bg-primary-container/60 rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
          ))}
        </div>
        <span className="text-[14px] ml-2">Retrieving codebase chunks...</span>
      </div>
    </div>
  );
}

export default function DesktopQuery() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeSession, setActiveSession] = useState('abc123-research');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!inputValue.trim() || isStreaming) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: inputValue.trim(), timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsStreaming(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'bot', content: 'Based on the retrieved context, I can provide the following analysis...', timestamp: new Date().toISOString() }]);
      setIsStreaming(false);
    }, 2000);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e as unknown as React.FormEvent); }
  }

  return (
    <div className="flex flex-1 overflow-hidden max-w-[1440px] mx-auto w-full">
      <SessionSidebar activeId={activeSession} onSelect={setActiveSession} />

      <main className="flex-1 flex flex-col bg-surface relative overflow-hidden">
        {/* Chat header */}
        <div className="h-14 border-b border-surface-container-high flex items-center justify-between px-6 bg-surface-container/30 backdrop-blur-sm z-10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-[14px] text-on-surface-variant">Session:</span>
            <span className="text-[14px] font-mono text-secondary-container bg-secondary-container/10 px-2 py-0.5 rounded border border-secondary-container/20">{activeSession}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary-container" />Memory Active
            </div>
            <button className="text-on-surface-variant hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>more_horiz</span>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 scroll-smooth pb-36">
          <div className="flex justify-center">
            <div className="text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant bg-surface-container px-3 py-1 rounded-full border border-surface-container-high">
              Today, 14:02 UTC
            </div>
          </div>
          {messages.map(m => m.role === 'user' ? <UserMessage key={m.id} message={m} /> : <BotMessage key={m.id} message={m} />)}
          {isStreaming && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-surface via-surface/95 to-transparent pt-12">
          <div className="max-w-4xl mx-auto relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-surface-container-high to-surface-container-highest rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-500" />
            <form onSubmit={handleSubmit} className="relative bg-surface-container border border-surface-container-high rounded-xl shadow-lg flex flex-col focus-within:border-primary-container/50 transition-colors">
              <textarea rows={2} value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyDown={handleKeyDown}
                placeholder="Ask a question about the ingested data..."
                className="w-full bg-transparent text-on-surface text-[16px] placeholder:text-on-surface-variant/50 border-none focus:ring-0 resize-none p-4 pb-0 max-h-32 overflow-y-auto"
                style={{ minHeight: '56px' }} />
              <div className="flex justify-between items-center p-3 mt-1">
                <div className="flex gap-2 text-on-surface-variant">
                  <button type="button" className="p-1.5 rounded hover:bg-surface-bright transition-colors"><span className="material-symbols-outlined" style={{ fontSize: '20px' }}>attach_file</span></button>
                  <button type="button" className="p-1.5 rounded hover:bg-surface-bright transition-colors"><span className="material-symbols-outlined" style={{ fontSize: '20px' }}>tune</span></button>
                  <div className="h-6 w-px bg-surface-container-high mx-1 my-auto" />
                  <span className="text-[12px] font-semibold flex items-center px-2 opacity-60">Context: Global</span>
                </div>
                <button type="submit" disabled={!inputValue.trim() || isStreaming}
                  className="bg-primary-container hover:brightness-110 text-white px-5 py-2 rounded-lg text-[12px] font-semibold tracking-[0.05em] flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  Ask <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>send</span>
                </button>
              </div>
            </form>
            <div className="text-center mt-2">
              <span className="text-[12px] font-semibold text-on-surface-variant/50">GalvanR.A.G. v1.0.4 — Responses are synthesized from retrieved context.</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}