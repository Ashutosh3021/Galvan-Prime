import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import MobileBottomNav from '../shared/MobileBottomNav';
import type { SettingsFormState, EnvVar } from '../../types';

const envVars: EnvVar[] = [
  { key: 'GEMINI_API_KEY',   loaded: true  },
  { key: 'PINECONE_API_KEY', loaded: true  },
  { key: 'DATABASE_URL',     loaded: true  },
];

export default function MobileSettings() {
  const { pathname } = useLocation();
  const [form, setForm] = useState<SettingsFormState>({
    llmProvider:  'gemini',
    apiKey:       '************************',
    vectorDB:     'pinecone',
    envRegion:    'us-west4-gcp-free',
    indexName:    '',
    hybridWeight: 70,
  });
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved]     = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="bg-[#0A0F1C] text-[#d7e2ff] font-sans min-h-screen flex">
      <main className="flex-1 flex flex-col pb-32">
        {/* Mobile Header */}
        <header className="bg-[#0A0F1C] border-b border-[#2D3748] flex justify-between items-center w-full px-6 py-4 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <h1 className="text-[24px] font-bold text-[#ff6600]">Settings</h1>
          </div>
          <span className="material-symbols-outlined text-[#ffb596]">person</span>
        </header>

        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
          <div className="hidden md:block">
            <h1 className="text-[32px] font-bold leading-tight text-[#d7e2ff]">Settings</h1>
            <p className="text-[14px] text-[#e3bfb1]">Configure LLM pipeline connections and search parameters.</p>
          </div>

          {/* LLM Provider Section */}
          <section className="tech-card border border-[#2D3748] rounded-lg p-4">
            <h2 className="text-[20px] font-semibold text-[#d7e2ff] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#8bd5ff]">psychology</span>
              LLM Provider
            </h2>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-semibold tracking-[0.05em] text-[#e3bfb1] uppercase">Model Selection</label>
                <div className="relative">
                  <select value={form.llmProvider} onChange={e => setForm(f => ({ ...f, llmProvider: e.target.value }))}
                    className="w-full tech-input border border-[#2D3748] rounded text-[14px] text-[#d7e2ff] py-2 px-3 appearance-none focus:ring-0">
                    <option value="gemini-flash">Gemini 1.5 Flash</option>
                    <option value="gemini-pro">Gemini 1.5 Pro</option>
                    <option value="gpt4o">GPT-4o</option>
                    <option value="claude-35">Claude 3.5 Sonnet</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-2.5 text-[#e3bfb1] pointer-events-none" style={{ fontSize: '20px' }}>expand_more</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-semibold tracking-[0.05em] text-[#e3bfb1] uppercase">API Key</label>
                <div className="relative flex items-center">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={form.apiKey}
                    onChange={e => setForm(f => ({ ...f, apiKey: e.target.value }))}
                    className="w-full tech-input border border-[#2D3748] rounded font-mono text-[13px] text-[#d7e2ff] py-2 px-3 focus:ring-0"
                  />
                  <button type="button" onClick={() => setShowKey(v => !v)}
                    className="absolute right-3 text-[#e3bfb1] hover:text-[#ff6600] transition-colors">
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{showKey ? 'visibility' : 'visibility_off'}</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Vector Store Section */}
          <section className="tech-card border border-[#2D3748] rounded-lg p-4">
            <h2 className="text-[20px] font-semibold text-[#d7e2ff] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#8bd5ff]">database</span>
              Vector Store
            </h2>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-semibold tracking-[0.05em] text-[#e3bfb1] uppercase">Provider</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'chroma',   label: 'ChromaDB (Local)', isCloud: false },
                    { id: 'pinecone', label: 'Pinecone (Cloud)', isCloud: true  },
                  ].map(db => {
                    const isSelected = form.vectorDB === db.id;
                    return (
                      <label key={db.id}
                        className={`flex items-center justify-center gap-2 p-3 border rounded cursor-pointer transition-colors ${
                          isSelected ? 'border-[#ff6600] bg-[#ff6600]/10 text-[#ff6600]' : 'border-[#2D3748] text-[#e3bfb1] hover:border-[#ff6600]/50'
                        }`}>
                        <input type="radio" name="vector_store" value={db.id} checked={isSelected}
                          onChange={() => setForm(f => ({ ...f, vectorDB: db.id }))} className="hidden" />
                        {db.isCloud && <span className="material-symbols-outlined text-[#8bd5ff]" style={{ fontSize: '16px' }}>cloud</span>}
                        <span className="text-[14px]">{db.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-semibold tracking-[0.05em] text-[#e3bfb1] uppercase">Environment</label>
                <input type="text" value={form.envRegion} onChange={e => setForm(f => ({ ...f, envRegion: e.target.value }))}
                  className="w-full tech-input border border-[#2D3748] rounded font-mono text-[13px] text-[#8bd5ff] py-2 px-3 focus:ring-0" />
              </div>
            </div>
          </section>

          {/* Search Configuration */}
          <section className="tech-card border border-[#2D3748] rounded-lg p-4">
            <h2 className="text-[20px] font-semibold text-[#d7e2ff] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#8bd5ff]">tune</span>
              Search Configuration
            </h2>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <label className="text-[12px] font-semibold tracking-[0.05em] text-[#e3bfb1] uppercase">Hybrid Search Weights</label>
                <span className="font-mono text-[12px] text-[#ff6600] bg-[#ff6600]/10 px-2 py-1 rounded">
                  {(form.hybridWeight / 100).toFixed(1)} Vector / {((100 - form.hybridWeight) / 100).toFixed(1)} BM25
                </span>
              </div>
              <input type="range" min="0" max="100" value={form.hybridWeight}
                onChange={e => setForm(f => ({ ...f, hybridWeight: Number(e.target.value) }))}
                className="w-full" />
              <div className="flex justify-between text-[14px] text-[#e3bfb1]">
                <span>Semantic (Vector)</span><span>Keyword (BM25)</span>
              </div>
            </div>
          </section>

          {/* Connection Status */}
          <section className="tech-card border border-[#2D3748] rounded-lg p-4">
            <h2 className="text-[20px] font-semibold text-[#d7e2ff] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#8bd5ff]">power</span>
              Connection Status
            </h2>
            <ul className="space-y-2">
              {envVars.map(ev => (
                <li key={ev.key} className="flex items-center justify-between p-2 rounded bg-[#001231]/50 border border-[#2D3748]/30">
                  <span className="font-mono text-[13px] text-[#e3bfb1]">{ev.key}</span>
                  <span className="material-symbols-outlined text-[#4ae176] icon-fill" style={{ fontSize: '18px' }}>check_circle</span>
                </li>
              ))}
            </ul>
          </section>
          <div className="h-20" />
        </form>

        {/* Fixed bottom actions */}
        <div className="fixed bottom-[60px] left-0 right-0 p-4 border-t border-[#2D3748]/50 tech-card z-20 flex flex-col sm:flex-row-reverse items-center justify-between gap-4">
          <button type="submit" form="settings-form" onClick={handleSave}
            className="w-full sm:w-auto bg-[#ff6600] hover:opacity-90 text-white text-[16px] font-semibold py-3 px-8 rounded-xl transition-all shadow-lg shadow-[#ff6600]/20">
            {saved ? '✓ Saved!' : 'Save Changes'}
          </button>
          <button type="button"
            className="text-[14px] text-[#e3bfb1] hover:text-white transition-colors underline decoration-[#2D3748] underline-offset-4">
            Reset to Defaults
          </button>
        </div>

        <MobileBottomNav />
      </main>
    </div>
  );
}
