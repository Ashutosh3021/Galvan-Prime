import { Icon } from '../ui/Icon';
import { useSettingsForm } from '../../hooks/useSettingsForm';
import type { EnvVar } from '../../types';

const envVars: EnvVar[] = [
  { key: 'GEMINI_API_KEY',   loaded: true  },
  { key: 'PINECONE_API_KEY', loaded: true  },
  { key: 'DATABASE_URL',     loaded: true  },
  { key: 'LANGSMITH_KEY',    loaded: false },
];

export default function DesktopSettings() {
  const { form, showKey, saved, setField, toggleShowKey, handleSave, handleReset } = useSettingsForm();

  return (
    <main id="main-content" className="max-w-[1440px] mx-auto px-gutter py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-[32px] font-semibold leading-tight tracking-[-0.01em] text-on-surface">System Configuration</h1>
        <p className="text-[16px] leading-relaxed text-on-surface-variant mt-2 max-w-2xl">
          Manage your active LLM providers, embedding models, and vector database connections.
        </p>
      </div>

      <form onSubmit={handleSave}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8 flex flex-col gap-6">

            {/* LLM Provider */}
            <div className="bg-surface-container rounded-lg border border-surface-container-high p-6 flex flex-col gap-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary-container" />
              <div>
                <h2 className="text-[20px] font-semibold text-on-surface flex items-center gap-2">
                  <Icon name="psychology" size={20} className="text-primary-container" />
                  LLM Provider
                </h2>
                <p className="text-[14px] text-on-surface-variant mt-1">Select the primary model used for synthesis and generation.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { id: 'gemini', name: 'Gemini 1.5 Flash', desc: 'Optimized for speed and long-context retrieval tasks.' },
                  { id: 'openai', name: 'OpenAI GPT-4o',    desc: 'High reasoning capability for complex synthesis.' },
                ].map(opt => {
                  const isSelected = form.llmProvider === opt.id;
                  return (
                    <label key={opt.id} className={`cursor-pointer relative rounded-lg border p-4 flex flex-col gap-2 transition-all ${isSelected ? 'border-primary-container bg-primary-container/5' : 'border-surface-container-highest bg-surface hover:bg-surface-variant/50'}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-[16px] font-bold text-on-surface">{opt.name}</span>
                        <input type="radio" name="llm_provider" value={opt.id} checked={isSelected} onChange={() => setField('llmProvider', opt.id)} className="sr-only" />
                        <Icon name={isSelected ? 'radio_button_checked' : 'radio_button_unchecked'} size={18} filled={isSelected} className={isSelected ? 'text-primary-container' : 'text-on-surface-variant'} />
                      </div>
                      <span className="text-[14px] text-on-surface-variant">{opt.desc}</span>
                    </label>
                  );
                })}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant">API Key</label>
                <div className="relative">
                  <input type={showKey ? 'text' : 'password'} value={form.apiKey} onChange={e => setField('apiKey', e.target.value)}
                    className="w-full bg-[#05070A] border border-surface-container-highest rounded px-4 py-3 font-mono text-[14px] text-secondary focus:outline-none focus:border-primary-container transition-colors" />
                  <button type="button" onClick={toggleShowKey} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface">
                    <Icon name={showKey ? 'visibility' : 'visibility_off'} size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Vector Store */}
            <div className="bg-surface-container rounded-lg border border-surface-container-high p-6 flex flex-col gap-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-secondary-container" />
              <div>
                <h2 className="text-[20px] font-semibold text-on-surface flex items-center gap-2">
                  <Icon name="database" size={20} className="text-secondary-container" />
                  Vector Database
                </h2>
                <p className="text-[14px] text-on-surface-variant mt-1">Configure the storage backend for document embeddings.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[{ id: 'chroma', name: 'ChromaDB', badge: 'Local' }, { id: 'pinecone', name: 'Pinecone', badge: 'Cloud' }].map(db => {
                  const isSelected = form.vectorDB === db.id;
                  return (
                    <label key={db.id} className={`cursor-pointer relative rounded-lg border p-4 flex flex-col gap-2 transition-all ${isSelected ? 'border-secondary-container bg-secondary-container/5' : 'border-surface-container-highest bg-surface hover:bg-surface-variant/50'}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-[16px] font-bold text-on-surface">{db.name}</span>
                        <span className={`text-[12px] font-semibold ${isSelected ? 'bg-secondary-container/20 text-secondary-container' : 'bg-surface-container-lowest text-on-surface-variant'} px-2 py-1 rounded`}>{db.badge}</span>
                        <input type="radio" name="vector_db" value={db.id} checked={isSelected} onChange={() => setField('vectorDB', db.id)} className="sr-only" />
                        <Icon name={isSelected ? 'radio_button_checked' : 'radio_button_unchecked'} size={18} filled={isSelected} className={isSelected ? 'text-secondary-container' : 'text-on-surface-variant'} />
                      </div>
                    </label>
                  );
                })}
              </div>
              <div className="flex flex-col gap-4 bg-surface p-4 rounded border border-surface-container-highest">
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant">Environment Region</label>
                  <input type="text" value={form.envRegion} onChange={e => setField('envRegion', e.target.value)} className="w-full bg-[#05070A] border border-surface-container-highest rounded px-4 py-2 font-mono text-[14px] text-on-surface focus:outline-none focus:border-secondary transition-colors" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant">Index Name</label>
                  <input type="text" value={form.indexName} onChange={e => setField('indexName', e.target.value)} className="w-full bg-[#05070A] border border-surface-container-highest rounded px-4 py-2 font-mono text-[14px] text-on-surface focus:outline-none focus:border-secondary transition-colors" />
                </div>
              </div>
            </div>

            {/* Hybrid Search */}
            <div className="bg-surface-container rounded-lg border border-surface-container-high p-6 flex flex-col gap-6">
              <div>
                <h2 className="text-[20px] font-semibold text-on-surface flex items-center gap-2">
                  <Icon name="tune" size={20} className="text-on-surface-variant" />
                  Hybrid Search Weights
                </h2>
                <p className="text-[14px] text-on-surface-variant mt-1">Balance between semantic similarity and keyword matching.</p>
              </div>
              <div className="flex flex-col gap-8 mt-4">
                <div className="flex items-center justify-between text-[14px]">
                  <span className="text-secondary-container font-bold">Dense Vector (Semantic)</span>
                  <span className="text-primary-container font-bold">Sparse BM25 (Keyword)</span>
                </div>
                <div className="relative w-full">
                  <input type="range" min="0" max="100" value={form.hybridWeight} onChange={e => setField('hybridWeight', Number(e.target.value))} className="w-full h-2" />
                  <div className="absolute -top-8 -translate-x-1/2 bg-surface-bright px-2 py-1 rounded text-[12px] font-semibold text-on-surface shadow-md" style={{ left: `${form.hybridWeight}%` }}>
                    {(form.hybridWeight / 100).toFixed(1)} / {((100 - form.hybridWeight) / 100).toFixed(1)}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-6 mt-4">
              <button type="button" onClick={handleReset} className="text-on-surface-variant hover:text-on-surface transition-colors text-[12px] font-semibold tracking-[0.05em]">
                Reset to defaults
              </button>
              <button type="submit" className="bg-primary-container hover:brightness-110 text-white px-8 py-3 rounded text-[12px] font-semibold tracking-[0.05em] shadow-lg shadow-primary-container/20 transition-all flex items-center gap-2">
                <Icon name="save" size={16} />
                {saved ? '✓ Saved!' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Env status */}
          <div className="md:col-span-4 flex flex-col gap-6">
            <div className="bg-surface-container rounded-lg border border-surface-container-high p-6">
              <h3 className="text-[20px] font-semibold text-on-surface flex items-center gap-2 mb-6">
                <Icon name="terminal" size={20} className="text-on-surface-variant" />
                Environment Status
              </h3>
              <ul className="flex flex-col gap-4">
                {envVars.map(ev => (
                  <li key={ev.key} className={`flex items-center justify-between p-3 rounded bg-[#05070A] border ${ev.loaded ? 'border-surface-container-highest' : 'border-[#ef4444]/30 border-dashed'}`}>
                    <div className="flex items-center gap-3">
                      <Icon name={ev.loaded ? 'check_circle' : 'error'} size={18} filled className={ev.loaded ? 'text-secondary-container' : 'text-[#ef4444]'} />
                      <span className="font-mono text-[14px] text-on-surface">{ev.key}</span>
                    </div>
                    <span className={`text-[12px] font-semibold tracking-[0.05em] ${ev.loaded ? 'text-secondary-container bg-secondary-container/10' : 'text-[#ef4444] bg-[#ef4444]/10'} px-2 py-1 rounded`}>
                      {ev.loaded ? 'Loaded' : 'Missing'}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-6 border-t border-surface-variant text-[14px] text-on-surface-variant flex gap-3">
                <Icon name="info" size={18} className="text-primary-container flex-shrink-0 mt-0.5" />
                <p>Changes to environment variables may require a service restart to take full effect.</p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </main>
  );
}
