import { useState } from 'react';
import { DropZone } from '../components/ingest/DropZone';
import { ChunkStrategySelect } from '../components/ingest/ChunkStrategySelect';
import { DocumentList } from '../components/ingest/DocumentList';
import { Select } from '../components/ui/Select';
import { Icon } from '../components/ui/Icon';
import { useIngestFile, useIngestUrl, useCollections } from '../hooks/useIngest';
import { useToast } from '../components/ui/Toast';

type ActiveTab = 'file' | 'url';

function CollectionInput({ value, onChange, collections }: { value: string; onChange: (v: string) => void; collections: string[] }) {
  const [mode, setMode] = useState<'existing' | 'new'>('existing');
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3 mb-1">
        <span className="text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant uppercase">Collection</span>
        <button type="button" onClick={() => setMode(m => m === 'existing' ? 'new' : 'existing')} className="text-[11px] text-primary-container hover:underline">
          {mode === 'existing' ? '+ New collection' : '← Use existing'}
        </button>
      </div>
      {mode === 'existing' ? (
        <Select value={value} onValueChange={onChange} options={collections.map(c => ({ value: c, label: c }))} placeholder="Select collection…" />
      ) : (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="e.g. my-research"
          aria-label="New collection name"
          className="w-full bg-surface-container-lowest border border-surface-container-high text-on-surface rounded px-3 py-2 text-[14px] focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors placeholder:text-on-surface-variant"
        />
      )}
    </div>
  );
}

export default function IngestPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('file');
  const [chunkStrategy, setChunkStrategy] = useState<'fixed' | 'semantic'>('semantic');
  const [collection, setCollection] = useState('my-docs');
  const [url, setUrl] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);

  const collections = useCollections();
  const ingestFile = useIngestFile();
  const ingestUrl = useIngestUrl();
  const { toast } = useToast();
  const isIngesting = ingestFile.isPending || ingestUrl.isPending;

  async function handleFile(file: File) {
    try {
      const res = await ingestFile.mutateAsync({ file, chunkStrategy, collection });
      toast('success', `✓ Ingested ${res.chunks} chunks from "${file.name}"`);
    } catch (err) {
      toast('error', err instanceof Error ? err.message : 'Ingestion failed');
    }
  }

  function validateUrl(raw: string): string | null {
    if (!raw.trim()) return 'URL is required';
    try {
      const u = new URL(raw.trim());
      if (!['http:', 'https:'].includes(u.protocol)) return 'URL must start with http:// or https://';
    } catch { return 'Invalid URL format'; }
    return null;
  }

  async function handleUrlSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validateUrl(url);
    if (err) { setUrlError(err); return; }
    setUrlError(null);
    try {
      const res = await ingestUrl.mutateAsync({ url: url.trim(), chunkStrategy, collection });
      toast('success', `✓ Ingested ${res.chunks} chunks from URL`);
      setUrl('');
    } catch (err) {
      toast('error', err instanceof Error ? err.message : 'URL ingestion failed');
    }
  }

  return (
    <main id="main-content" className="w-full max-w-[1440px] mx-auto px-4 md:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-[32px] font-bold leading-tight text-on-surface">Document Ingestion</h1>
        <p className="text-[14px] text-on-surface-variant mt-1">Upload files or ingest from a URL into your vector store.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Upload form */}
        <div className="flex flex-col gap-6 lg:w-[480px] flex-shrink-0">
          <div className="bg-surface-container border border-surface-container-high rounded-xl overflow-hidden">
            <div className="flex border-b border-surface-container-high" role="tablist" aria-label="Ingestion source">
              {(['file', 'url'] as const).map(t => (
                <button key={t} role="tab" aria-selected={activeTab === t} id={`tab-${t}`} onClick={() => setActiveTab(t)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-[12px] font-semibold tracking-[0.05em] uppercase transition-colors ${
                    activeTab === t ? 'text-primary-container bg-surface-container-low border-b-2 border-primary-container' : 'text-on-surface-variant hover:bg-surface-container-low'
                  }`}
                >
                  <Icon name={t === 'file' ? 'upload_file' : 'link'} size={15} />
                  {t === 'file' ? 'Upload File' : 'From URL'}
                </button>
              ))}
            </div>

            <div className="p-5">
              <div role="tabpanel" hidden={activeTab !== 'file'}>
                <DropZone onFile={handleFile} disabled={isIngesting} />
                {ingestFile.isPending && (
                  <div className="mt-4 flex items-center gap-3 text-on-surface-variant text-[13px]">
                    <Icon name="sync" size={16} className="animate-spin text-primary-container" />
                    Ingesting…
                  </div>
                )}
              </div>

              <div role="tabpanel" hidden={activeTab !== 'url'}>
                <form onSubmit={handleUrlSubmit} className="flex flex-col gap-4" noValidate>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="url-input" className="text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant uppercase">URL</label>
                    <input
                      id="url-input" type="url" value={url}
                      onChange={e => { setUrl(e.target.value); setUrlError(null); }}
                      placeholder="https://example.com/document"
                      disabled={isIngesting}
                      aria-invalid={urlError ? 'true' : 'false'}
                      aria-describedby={urlError ? 'url-error' : undefined}
                      className={`w-full bg-surface-container-lowest border rounded px-3 py-2.5 text-[14px] text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-1 transition-colors disabled:opacity-50 ${
                        urlError ? 'border-[#ef4444] focus:border-[#ef4444] focus:ring-[#ef4444]' : 'border-surface-container-high focus:border-primary-container focus:ring-primary-container'
                      }`}
                    />
                    {urlError && (
                      <p id="url-error" role="alert" className="text-[12px] text-[#ef4444] flex items-center gap-1">
                        <Icon name="error" size={13} />
                        {urlError}
                      </p>
                    )}
                  </div>
                  <button type="submit" disabled={isIngesting || !url.trim()}
                    className="flex items-center justify-center gap-2 bg-primary-container text-on-primary font-semibold text-[13px] px-5 py-2.5 rounded-lg hover:brightness-110 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {ingestUrl.isPending
                      ? <><Icon name="sync" size={15} className="animate-spin" />Ingesting…</>
                      : <><Icon name="download" size={15} />Ingest URL</>
                    }
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="bg-surface-container border border-surface-container-high rounded-xl p-5 flex flex-col gap-5">
            <h2 className="text-[16px] font-semibold text-on-surface flex items-center gap-2">
              <Icon name="tune" size={18} className="text-on-surface-variant" />
              Ingestion Settings
            </h2>
            <ChunkStrategySelect value={chunkStrategy} onChange={setChunkStrategy} disabled={isIngesting} />
            <CollectionInput value={collection} onChange={setCollection} collections={collections} />
          </div>
        </div>

        {/* Document list */}
        <div className="flex-1 min-w-0">
          <div className="bg-surface-container border border-surface-container-high rounded-xl overflow-hidden">
            <div className="p-5 border-b border-surface-container-high flex items-center justify-between">
              <h2 className="text-[16px] font-semibold text-on-surface flex items-center gap-2">
                <Icon name="folder_open" size={18} className="text-on-surface-variant" />
                Ingested Documents
              </h2>
            </div>
            <div className="p-4">
              <DocumentList collection={collection} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
