import { useSettingsForm } from '../../hooks/useSettingsForm';
import type { EnvVar } from '../../types';

const envVars: EnvVar[] = [
  { key: 'GEMINI_API_KEY',   loaded: true },
  { key: 'PINECONE_API_KEY', loaded: true },
  { key: 'DATABASE_URL',     loaded: true },
];

export default function MobileSettings() {
  const { form, showKey, saved, setField, toggleShowKey, handleSave } = useSettingsForm();

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
            <span className="material-symbols-outlined text-secondary">psychology</span>
            LLM Provider
          </h2>
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant uppercase">Model Selection</label>
              <div className="relative">
                <select value={form.llmProvider} onChange={e => setField('llmProvider', e.target.value)}
                  className="w-full bg-surface-container-lowest border border-surface-container-high rounded text-[14px] text-on-surface py-2 px-3 appearance-none focus:outline-none focus:border-primary-container">
                  <option value="gemini-flash">Gemini 1.5 Flash</option>
                  <option value="gemini-pro">Gemini 1.5 Pro</option>
                  <option value="gpt4o">GPT-4o</option>
                  <option value="claude-35">Claude 3.5 Sonnet</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-2.5 text-on-surface-variant pointer-events-none" style={{ fontSize: '20px' }}>expand_more</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant uppercase">API Key</label>
              <div className="relative flex items-center">
                <input type={showKey ? 'text' : 'password'} value={form.apiKey} onChange={e => setField('apiKey', e.target.value)}
                  className="w-full bg-surface-container-lowest border border-surface-container-high rounded font-mono text-[13px] text-on-surface py-2 px-3 focus:outline-none focus:border-primary-container" />
                <button type="button" onClick={toggleShowKey} className="absolute right-3 text-on-surface-variant hover:text-primary-container transition-colors">
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{showKey ? 'visibility' : 'visibility_off'}</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Vector Store */}
        <section className="bg-surface-container border border-surface-container-high rounded-lg p-4">
          <h2 className="text-[20px] font-semibold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">database</span>
            Vector Store
          </h2>
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant uppercase">Provider</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'chroma',   label: 'ChromaDB (Local)', isCloud: false },
                  { id: 'pinecone', label: 'Pinecone (Cloud)',  isCloud: true  },
                ].map(db => {
                  const isSelected = form.vectorDB === db.id;
                  return (
                    <label key={db.id} className={`flex items-center justify-center gap-2 p-3 border rounded cursor-pointer transition-colors ${
                      isSelected ? 'border-primary-container bg-primary-container/10 text-primary-container' : 'border-surface-container-high text-on-surface-variant hover:border-primary-container/50'
                    }`}>
                      <input type="radio" name="vector_store" value={db.id} checked={isSelected} onChange={() => setField('vectorDB', db.id)} className="hidden" />
                      {db.isCloud && <span className="material-symbols-outlined text-secondary" style={{ fontSize: '16px' }}>cloud</span>}
                      <span className="text-[14px]">{db.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant uppercase">Environment</label>
              <input type="text" value={form.envRegion} onChange={e => setField('envRegion', e.target.value)}
                className="w-full bg-surface-container-lowest border border-surface-container-high rounded font-mono text-[13px] text-secondary py-2 px-3 focus:outline-none focus:border-primary-container" />
            </div>
          </div>
        </section>

        {/* Search Config */}
        <section className="bg-surface-container border border-surface-container-high rounded-lg p-4">
          <h2 className="text-[20px] font-semibold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">tune</span>
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
            <span className="material-symbols-outlined text-secondary">power</span>
            Connection Status
          </h2>
          <ul className="space-y-2">
            {envVars.map(ev => (
              <li key={ev.key} className="flex items-center justify-between p-2 rounded bg-surface-container-lowest border border-surface-container-high">
                <span className="font-mono text-[13px] text-on-surface-variant">{ev.key}</span>
                <span className="material-symbols-outlined text-[#4ae176]" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row-reverse items-center gap-4 pt-2">
          <button type="submit"
            className="w-full sm:w-auto bg-primary-container hover:brightness-110 text-on-primary text-[16px] font-semibold py-3 px-8 rounded-lg transition-all shadow-lg shadow-primary-container/20">
            {saved ? '✓ Saved!' : 'Save Changes'}
          </button>
          <button type="button" className="text-[14px] text-on-surface-variant hover:text-on-surface transition-colors underline underline-offset-4">
            Reset to Defaults
          </button>
        </div>

      </form>
    </main>
  );
}