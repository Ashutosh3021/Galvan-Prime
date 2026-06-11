import { useState, useCallback } from 'react';
import type { IngestionJob } from '../../types';

function JobIcon({ type }: { type: IngestionJob['fileType'] }) {
  const map = {
    pdf:      { icon: 'picture_as_pdf', color: 'text-error' },
    url:      { icon: 'link',           color: 'text-secondary-container' },
    markdown: { icon: 'description',    color: 'text-secondary' },
    error:    { icon: 'error',          color: 'text-error' },
  };
  const { icon, color } = map[type];
  return <span className={`material-symbols-outlined ${color}`}>{icon}</span>;
}

function JobStatus({ job }: { job: IngestionJob }) {
  if (job.status === 'success')
    return <span className="text-[#4ae176] material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>check_circle</span>;
  if (job.status === 'failed')
    return <span className="text-error material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>error</span>;
  return (
    <div className="flex flex-col items-end gap-1">
      <span className="text-[12px] font-bold text-primary-container">{job.progress}%</span>
      <div className="w-20 bg-surface-container-highest h-1 rounded-full overflow-hidden">
        <div className="bg-primary-container h-full transition-all" style={{ width: `${job.progress}%` }} />
      </div>
    </div>
  );
}

const initialJobs: IngestionJob[] = [
  { id: '1', filename: 'q3_financial_report.pdf',   fileType: 'pdf',      status: 'success',    chunks: 128,  timestamp: '2024-01-15T14:20:00Z' },
  { id: '2', filename: 'https://docs.example.com/api', fileType: 'url',   status: 'processing', progress: 72, timestamp: '2024-01-15T14:22:00Z' },
  { id: '3', filename: 'design_system.md',           fileType: 'markdown', status: 'success',    chunks: 32,   timestamp: '2024-01-15T14:18:00Z' },
  { id: '4', filename: 'corrupted_data.csv',         fileType: 'error',    status: 'failed',     timestamp: '2024-01-15T14:15:00Z', errorMessage: 'Unsupported file type' },
];

export default function MobileIngest() {
  const [jobs, setJobs] = useState<IngestionJob[]>(initialJobs);
  const [url, setUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [chunkStrategy, setChunkStrategy] = useState('semantic');
  const [collection, setCollection] = useState('my-docs');
  const [activeTab, setActiveTab] = useState<'file' | 'url'>('file');

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const newJob: IngestionJob = {
      id: Date.now().toString(),
      filename: file.name,
      fileType: file.name.endsWith('.md') ? 'markdown' : 'pdf',
      status: 'processing',
      progress: 0,
      timestamp: new Date().toISOString(),
    };
    setJobs(prev => [newJob, ...prev]);
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 15 + 5;
      if (p >= 100) {
        clearInterval(interval);
        setJobs(prev => prev.map(j => j.id === newJob.id ? { ...j, status: 'success', chunks: Math.floor(Math.random() * 100) + 20 } : j));
      } else {
        setJobs(prev => prev.map(j => j.id === newJob.id ? { ...j, progress: Math.min(100, p) } : j));
      }
    }, 300);
  }, []);

  function handleUrlIngest() {
    if (!url.trim()) return;
    const newJob: IngestionJob = {
      id: Date.now().toString(), filename: url, fileType: 'url',
      status: 'processing', progress: 0, timestamp: new Date().toISOString(),
    };
    setJobs(prev => [newJob, ...prev]);
    setUrl('');
    let p = 0;
    const interval = setInterval(() => {
      p += 8;
      if (p >= 100) {
        clearInterval(interval);
        setJobs(prev => prev.map(j => j.id === newJob.id ? { ...j, status: 'success', chunks: 47 } : j));
      } else {
        setJobs(prev => prev.map(j => j.id === newJob.id ? { ...j, progress: Math.min(100, p) } : j));
      }
    }, 400);
  }

  return (
    <main className="flex-1 flex flex-col w-full max-w-[1440px] mx-auto px-4 md:px-8 py-8 space-y-6">

      {/* Page title */}
      <div>
        <h1 className="text-[32px] font-bold leading-tight text-on-surface">Document Ingestion</h1>
        <p className="text-[14px] text-on-surface-variant mt-1">Upload files or ingest from URL.</p>
      </div>

      {/* Input tabs */}
      <div className="bg-surface-container border border-surface-container-high rounded-lg overflow-hidden">
        <div className="flex border-b border-surface-container-high">
          {(['file', 'url'] as const).map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`flex-1 py-3 text-[12px] font-semibold tracking-[0.05em] uppercase transition-colors ${
                activeTab === t
                  ? 'text-primary-container bg-surface-container-low border-b-2 border-primary-container'
                  : 'text-on-surface-variant hover:bg-surface-container-low'
              }`}
            >
              {t === 'file' ? 'Upload File' : 'From URL'}
            </button>
          ))}
        </div>

        <div className="p-4">
          {activeTab === 'file' ? (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                isDragging
                  ? 'border-primary-container bg-primary-container/5 scale-[1.02]'
                  : 'border-surface-container-high hover:border-primary-container/50'
              }`}
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <span className="material-symbols-outlined text-primary-container text-5xl block mb-4">cloud_upload</span>
              <p className="text-[16px] font-semibold text-on-surface mb-1">Drag & drop files here</p>
              <p className="text-[14px] text-on-surface-variant mb-4">or click to browse</p>
              <label className="bg-primary-container text-on-primary px-4 py-2 rounded font-semibold text-[12px] cursor-pointer hover:brightness-110 transition-all">
                Browse Files
                <input
                  type="file"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) handleDrop({ dataTransfer: { files: [file] }, preventDefault: () => {} } as unknown as React.DragEvent);
                  }}
                />
              </label>
              <p className="text-[12px] text-on-surface-variant/50 mt-4">PDF, DOCX, TXT, MD, CSV supported</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <label className="text-[12px] font-semibold text-on-surface-variant uppercase">URL</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://example.com/page"
                  className="flex-1 bg-surface-container-lowest border border-surface-container-high text-on-surface rounded p-2 text-[14px] focus:outline-none focus:border-primary-container placeholder:text-on-surface-variant"
                />
                <button
                  onClick={handleUrlIngest}
                  className="bg-primary-container text-on-primary px-4 py-2 rounded font-semibold text-[12px] hover:brightness-110 transition-all active:scale-95"
                >
                  Ingest
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Settings */}
      <div className="bg-surface-container border border-surface-container-high rounded-lg p-4 space-y-4">
        <h2 className="text-[16px] font-semibold text-on-surface">Ingestion Settings</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-semibold text-on-surface-variant uppercase">Chunking Strategy</label>
            <select
              value={chunkStrategy}
              onChange={e => setChunkStrategy(e.target.value)}
              className="bg-surface-container-lowest border border-surface-container-high text-on-surface rounded p-2 text-[14px] focus:outline-none focus:border-primary-container"
            >
              <option value="semantic">Semantic</option>
              <option value="fixed">Fixed Size</option>
              <option value="character">Character</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-semibold text-on-surface-variant uppercase">Collection</label>
            <select
              value={collection}
              onChange={e => setCollection(e.target.value)}
              className="bg-surface-container-lowest border border-surface-container-high text-on-surface rounded p-2 text-[14px] focus:outline-none focus:border-primary-container"
            >
              <option value="my-docs">my-docs</option>
              <option value="research-papers">research-papers</option>
              <option value="default">default</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ingestion queue */}
      <div>
        <h2 className="text-[16px] font-semibold text-on-surface mb-3">Ingestion Queue</h2>
        <div className="space-y-3">
          {jobs.map(job => (
            <div
              key={job.id}
              className="bg-surface-container border border-surface-container-high rounded-lg p-4 flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded bg-surface-container-lowest border border-surface-container-high flex items-center justify-center flex-shrink-0">
                <JobIcon type={job.fileType} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-semibold text-on-surface truncate">{job.filename}</div>
                {job.status === 'success'    && <div className="text-[12px] text-on-surface-variant">{job.chunks} chunks</div>}
                {job.status === 'failed'     && <div className="text-[12px] text-error">{job.errorMessage}</div>}
                {job.status === 'processing' && <div className="text-[12px] text-primary-container">Processing...</div>}
              </div>
              <JobStatus job={job} />
            </div>
          ))}
        </div>
      </div>

    </main>
  );
}