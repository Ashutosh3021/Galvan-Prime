import { useEffect, useState } from 'react';
import { useSettingsForm } from '../../hooks/useSettingsForm';
import { Icon } from '../ui/Icon';
import { useStatus } from '../../hooks/useStatus';
import { getProviders } from '../../api/query';
import { PROVIDER_LABELS, type ProvidersResponse } from '../../types';

export default function MobileSettings() {
  const { form, showKey, saved, error, setField, toggleShowKey, handleSave, handleReset } = useSettingsForm();
  const { data: statusData } = useStatus();
  const [providers, setProviders] = useState<ProvidersResponse | null>(null);
  useEffect(() => {
    getProviders().then(setProviders).catch(() => {});
  }, []);

  const services = statusData?.services ?? [];
  const serviceItems = [
    { key: 'LLM',      loaded: services.find(s => s.name === 'llm')?.status === 'healthy' },
    { key: 'ChromaDB', loaded: services.find(s => s.name === 'chromadb')?.status === 'healthy' },
    { key: 'Pinecone', loaded: services.find(s => s.name === 'pinecone')?.status === 'healthy' },
  ];

  return (
    <main className="flex-1 flex flex-col w-full max-w-[1440px] mx-auto px-4 md:px-8 py-8">
      <form onSubmit={handleSave} className="flex flex-col gap-6">
        <div>
          <h1 className="text-[32px] font-bold leading-tight text-on-surface">Settings</h1>
          <p className="text-[14px] text-on-surface-variant mt-1">Configure LLM pipeline connections and search parameters.</p>
        </div>

        {/* LLM Provider */}
        <section className="bg-surface-container border border-surface-container-high rounded-lg p-4">
          <h2 className="text-[20px] font-semibold text-on-surface mb-4 flex items-center gap-2">
            <Icon name="psychology" size={20} className="text-cite" />
            LLM Provider
          </h2>
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant uppercase">Model Selection</label>
              <div className="relative">
                <select value={form.llmProvider} onChange={e => setField('llmProvider', e.target.value)}
                  className="w-full bg-surface-container-lowest border border-surface-container-high rounded text-[14px] text-on-surface py-2 px-3 appearance-none focus:outline-none focus:border-primary-container">
                  {(providers?.available ?? ['gemini', 'openai']).map(p => (
                    <option key={p} value={p}>{PROVIDER_LABELS[p] ?? p}</option>
                  ))}
                </select>
                <span className="absolute right-3 top-2.5 text-on-surface-variant pointer-events-none">
                  <Icon name="expand_more" size={18} />
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant uppercase">API Key</label>
              <div className="relative flex items-center">
                <input type={showKey ? 'text' : 'password'} value={form.apiKey} onChange={e => setField('apiKey', e.target.value)}
                  className="w-full bg-surface-container-lowest border border-surface-container-high rounded font-mono text-[13px] text-on-surface py-2 px-3 focus:outline-none focus:border-primary-container" />
                <button type="button" onClick={toggleShowKey} className="absolute right-3 text-on-surface-variant hover:text-primary-container transition-colors">
                  <Icon name={showKey ? 'visibility' : 'visibility_off'} size={18} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Vector Store */}
        <section className="bg-surface-container border border-surface-container-high rounded-lg p-4">
          <h2 className="text-[20px] font-semibold text-on-surface mb-4 flex items-center gap-2">
            <Icon name="database" size={20} className="text-cite" />
            Vector Store
          </h2>
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant uppercase">Provider</label>
              <div className="grid grid-cols-2 gap-3">
                {[{ id: 'chroma', label: 'ChromaDB (Local)', isCloud: false }, { id: 'pinecone', label: 'Pinecone (Cloud)', isCloud: true }].map(db => {
                  const isSelected = form.vectorDB === db.id;
                  return (
                    <label key={db.id} className={`flex items-center justify-center gap-2 p-3 border rounded cursor-pointer transition-colors ${isSelected ? 'border-primary-container bg-primary-container/10 text-primary-container' : 'border-surface-container-high text-on-surface-variant hover:border-primary-container/50'}`}>
                      <input type="radio" name="vector_store" value={db.id} checked={isSelected} onChange={() => setField('vectorDB', db.id)} className="sr-only" />
                      {db.isCloud && <Icon name="cloud" size={14} className="text-cite" />}
                      <span className="text-[14px]">{db.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant uppercase">Environment</label>
              <input type="text" value={form.envRegion} onChange={e => setField('envRegion', e.target.value)}
                className="w-full bg-surface-container-lowest border border-surface-container-high rounded font-mono text-[13px] text-cite py-2 px-3 focus:outline-none focus:border-primary-container" />
            </div>
          </div>
        </section>

        {/* Search Config */}
        <section className="bg-surface-container border border-surface-container-high rounded-lg p-4">
          <h2 className="text-[20px] font-semibold text-on-surface mb-4 flex items-center gap-2">
            <Icon name="tune" size={20} className="text-cite" />
            Search Configuration
          </h2>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <label className="text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant uppercase">Hybrid Search Weights</label>
              <span className="font-mono text-[12px] text-primary-container bg-primary-container/10 px-2 py-1 rounded">
                {(form.hybridWeight / 100).toFixed(1)} Vector / {((100 - form.hybridWeight) / 100).toFixed(1)} BM25
              </span>
            </div>
            <input type="range" min="0" max="100" value={form.hybridWeight} onChange={e => setField('hybridWeight', Number(e.target.value))} className="w-full" />
            <div className="flex justify-between text-[14px] text-on-surface-variant">
              <span>Semantic (Vector)</span><span>Keyword (BM25)</span>
            </div>
          </div>
        </section>

        {/* Connection Status */}
        <section className="bg-surface-container border border-surface-container-high rounded-lg p-4">
          <h2 className="text-[20px] font-semibold text-on-surface mb-4 flex items-center gap-2">
            <Icon name="power" size={20} className="text-cite" />
            Connection Status
          </h2>
          <ul className="space-y-2">
            {serviceItems.map(ev => (
              <li key={ev.key} className="flex items-center justify-between p-2 rounded bg-surface-container-lowest border border-surface-container-high">
                <span className="font-mono text-[13px] text-on-surface-variant">{ev.key}</span>
                <Icon
                  name={ev.loaded ? 'check_circle' : 'error'}
                  size={18}
                  filled
                  className={ev.loaded ? 'text-pass' : 'text-warn'}
                />
              </li>
            ))}
          </ul>
        </section>

        {error && (
          <p className="text-[13px] text-warn w-full">⚠ {error}</p>
        )}
        <div className="flex flex-col sm:flex-row-reverse items-center gap-4 pt-2">
          <button type="submit" className="w-full sm:w-auto bg-ink hover:opacity-90 text-paper text-[16px] font-semibold py-3 px-8 rounded-lg transition-all shadow-card">
            {saved ? '✓ Saved!' : 'Save Changes'}
          </button>
          <button type="button" onClick={handleReset} className="text-[14px] text-on-surface-variant hover:text-on-surface transition-colors underline underline-offset-4">
            Reset to Defaults
          </button>
        </div>
      </form>
    </main>
  );
}
