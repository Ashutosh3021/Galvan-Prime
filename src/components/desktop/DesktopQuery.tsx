import { useState, useRef, useEffect } from 'react';
import { ChatWindow } from '../query/ChatWindow';
import { Select } from '../ui/Select';
import { Icon } from '../ui/Icon';
import { useChat } from '../../hooks/useQuery';
import { useCollections } from '../../hooks/useIngest';
import { useAppState } from '../../store/useAppStore';
import { PROVIDER_LABELS, type QuerySession, type ProvidersResponse } from '../../types';

function SessionSidebar({ sessions, activeId, onSelect, onNew }: {
  sessions: QuerySession[];
  activeId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
}) {
  return (
    <aside className="w-64 flex-shrink-0 border-r border-surface-container-high bg-surface-container-low flex flex-col" aria-label="Chat sessions">
      <div className="p-4 border-b border-surface-container-high">
        <button
          onClick={onNew}
          className="w-full flex items-center justify-center gap-2 bg-primary-container/10 text-primary-container border border-primary-container/30 hover:bg-primary-container/20 transition-colors py-2 rounded-lg text-[12px] font-semibold tracking-[0.05em]"
          aria-label="Start new session"
        >
          <Icon name="add" size={16} />
          New Session
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
        <p className="text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant px-2 py-2 mt-2 mb-1 opacity-70">Recent</p>
        {sessions.map(s => {
          const isActive = activeId === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              aria-current={isActive ? 'true' : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg relative group text-left ${
                isActive
                  ? 'bg-surface-bright/50 text-on-surface border border-surface-container-high'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors'
              }`}
            >
              {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-primary-container rounded-r-full" />}
              <Icon
                name={isActive ? 'chat_bubble' : 'history'}
                size={16}
                filled={isActive}
                className={isActive ? 'text-primary-container' : 'opacity-70'}
              />
              <div className="flex-1 truncate text-[13px] font-medium font-mono">{s.label}</div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

function InputArea({ onSend, isLoading, collection, onCollectionChange, collections, sessionId, provider, onProviderChange, providers }: {
  onSend: (q: string) => void;
  isLoading: boolean;
  collection: string;
  onCollectionChange: (c: string) => void;
  collections: string[];
  sessionId: string;
  provider: string;
  onProviderChange: (v: string) => void;
  providers: ProvidersResponse | null;
}) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }, [value]);

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!value.trim() || isLoading) return;
    onSend(value.trim());
    setValue('');
  }

  return (
    <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-surface via-surface/95 to-transparent pt-12">
      <div className="max-w-4xl mx-auto space-y-2">
        <div className="flex items-center gap-3 px-1">
          <span className="text-[12px] text-on-surface-variant font-semibold tracking-[0.05em] whitespace-nowrap">Collection:</span>
          <div className="w-48">
            <Select value={collection} onValueChange={onCollectionChange} options={collections.map(c => ({ value: c, label: c }))} placeholder="Select collection…" />
          </div>
          {providers && providers.available.length > 0 && (
            <div className="w-40">
              <Select
                value={provider}
                onValueChange={onProviderChange}
                options={providers.available.map(p => ({ value: p, label: PROVIDER_LABELS[p] ?? p }))}
                placeholder="Provider…"
              />
            </div>
          )}
          <span className="text-[11px] font-mono text-on-surface-variant/50 ml-auto truncate">session: {sessionId.slice(0, 8)}…</span>
        </div>

        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-surface-container-high to-surface-container-highest rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-500" />
          <form onSubmit={handleSubmit} className="relative bg-surface-container border border-surface-container-high rounded-xl shadow-lg flex flex-col focus-within:border-primary-container/50 transition-colors">
            <textarea
              ref={textareaRef}
              rows={2}
              value={value}
              onChange={e => setValue(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
              disabled={isLoading}
              placeholder="Ask a question about your documents…"
              aria-label="Question input"
              className="w-full bg-transparent text-on-surface text-[15px] placeholder:text-on-surface-variant/50 border-none focus:ring-0 resize-none p-4 pb-0 overflow-y-auto"
              style={{ minHeight: '56px', maxHeight: '128px' }}
            />
            <div className="flex justify-between items-center p-3 mt-1">
              <div className="flex items-center gap-2 text-on-surface-variant text-[12px] font-semibold opacity-60">
                <Icon name="memory" size={14} />
                Memory Active
              </div>
              <button
                type="submit"
                disabled={!value.trim() || isLoading}
                aria-label="Send question"
                className="bg-primary-container hover:brightness-110 text-white px-5 py-2 rounded-lg text-[12px] font-semibold tracking-[0.05em] flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                {isLoading ? (
                  <><Icon name="sync" size={16} className="animate-spin" />Thinking…</>
                ) : (
                  <>Ask <Icon name="send" size={16} /></>
                )}
              </button>
            </div>
          </form>
        </div>
        <p className="text-center text-[11px] text-on-surface-variant/40">
          Press Enter to send · Shift+Enter for new line · Verify all citations
        </p>
      </div>
    </div>
  );
}

export default function DesktopQuery() {
  const { activeCollection } = useAppState();
  const [collection, setCollection] = useState(activeCollection);
  const collections = useCollections();
  const { messages, sessionId, isLoading, error, sendMessage, clearSession, providers } = useChat({ collection });
  const [provider, setProvider] = useState('');
  useEffect(() => {
    if (providers && !provider) {
      setProvider(providers.default ?? providers.available[0] ?? '');
    }
  }, [providers, provider]);

  const [sessions, setSessions] = useState<QuerySession[]>([
    { id: sessionId, label: sessionId.slice(0, 12), isActive: true },
  ]);
  const [activeSessionId, setActiveSessionId] = useState(sessionId);

  function handleNewSession() {
    clearSession();
    const newId = crypto.randomUUID();
    setSessions(prev => [
      { id: newId, label: newId.slice(0, 12), isActive: true },
      ...prev.map(s => ({ ...s, isActive: false })),
    ]);
    setActiveSessionId(newId);
  }

  return (
    <div className="flex flex-1 overflow-hidden max-w-[1440px] mx-auto w-full">
      <SessionSidebar sessions={sessions} activeId={activeSessionId} onSelect={setActiveSessionId} onNew={handleNewSession} />

      <main className="flex-1 flex flex-col bg-surface relative overflow-hidden" id="main-content">
        <div className="h-14 border-b border-surface-container-high flex items-center justify-between px-6 bg-surface-container/30 backdrop-blur-sm z-10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-[13px] text-on-surface-variant">Session:</span>
            <span className="text-[13px] font-mono text-secondary-container bg-secondary-container/10 px-2 py-0.5 rounded border border-secondary-container/20">
              {activeSessionId.slice(0, 12)}…
            </span>
          </div>
          <div className="flex items-center gap-4">
            {messages.length > 0 && (
              <button onClick={clearSession} aria-label="Clear chat history" className="text-[12px] font-semibold text-on-surface-variant hover:text-on-surface flex items-center gap-1 transition-colors">
                <Icon name="delete_sweep" size={16} />
                Clear
              </button>
            )}
            <div className="flex items-center gap-2 text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary-container" />
              Memory Active
            </div>
          </div>
        </div>

        <ChatWindow messages={messages} isLoading={isLoading} error={error} />

        <InputArea
          onSend={q => void sendMessage(q, provider)}
          isLoading={isLoading}
          collection={collection}
          onCollectionChange={setCollection}
          collections={collections}
          sessionId={sessionId}
          provider={provider}
          onProviderChange={setProvider}
          providers={providers}
        />
      </main>
    </div>
  );
}
