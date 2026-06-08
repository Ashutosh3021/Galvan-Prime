import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import MobileBottomNav from '../shared/MobileBottomNav';
import type { ApiEndpoint } from '../../types';

const endpoints: ApiEndpoint[] = [
  {
    id: 'ingest', method: 'POST', path: '/ingest',
    description: 'Upload raw text or documents to be chunked, embedded, and stored in the vector database. Requires valid authentication token.',
    exampleRequest: `{\n  "document_id": "doc_84729a",\n  "content": "The quick brown fox jumps over...",\n  "metadata": {\n    "source": "wiki",\n    "author": "admin"\n  }\n}`,
  },
  {
    id: 'query', method: 'POST', path: '/query',
    description: 'Submit a natural language query against the vector store. Provide an optional session_id for multi-turn conversational context.',
    exampleRequest: `{\n  "query": "What are the configuration limits?",\n  "session_id": "sess_x92k1l",\n  "top_k": 5\n}`,
  },
  {
    id: 'health', method: 'GET', path: '/health',
    description: 'System health check endpoint. Returns the operational status of the inference API, vector database, and caching layer.',
    exampleRequest: `// Request\nGET /api/v1/health\n\n// Response (200 OK)\n{\n  "status": "healthy",\n  "vector_db": "connected",\n  "llm_api": "available"\n}`,
  },
];

function MobileApiEndpointCard({ endpoint }: { endpoint: ApiEndpoint }) {
  const [open, setOpen] = useState(false);
  const isGet = endpoint.method === 'GET';
  return (
    <div className="group bg-[#001231] border border-[#5a4136] rounded-lg overflow-hidden transition-all duration-200">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-4 cursor-pointer hover:bg-[#133466]/30 transition-colors duration-200 text-left"
      >
        <div className="flex items-center gap-4">
          <span className={`text-[12px] font-bold tracking-[0.05em] px-2 py-1 rounded ${
            isGet ? 'bg-[#00ae4f]/20 text-[#4ae176]' : 'bg-[#ff6600]/20 text-[#ff6600]'
          }`}>{endpoint.method}</span>
          <span className="text-[16px] font-bold text-[#d7e2ff] font-mono">{endpoint.path}</span>
        </div>
        <span className={`material-symbols-outlined text-[#e3bfb1] transition-transform duration-300 ${open ? 'rotate-180' : ''}`}>expand_more</span>
      </button>
      {open && (
        <div className="p-4 pt-0 flex flex-col gap-4 border-t border-[#5a4136]/50 mt-2 animate-sweep">
          <p className="text-[14px] text-[#e3bfb1] pt-4">{endpoint.description}</p>
          <div className="bg-[#000d27] border border-[#5a4136] rounded-lg p-4 overflow-x-auto">
            <pre className="font-mono text-[12px] text-[#00bdfd]">{endpoint.exampleRequest}</pre>
          </div>
          <div className="flex justify-end">
            <button className="border border-[#00bdfd] text-[#00bdfd] hover:bg-[#00bdfd]/10 px-4 py-2 rounded-lg font-semibold text-[12px] transition-colors active:scale-95 flex items-center gap-2">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>play_arrow</span>
              Try it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MobileApiDocs() {
  const { pathname } = useLocation();

  return (
    <div className="bg-[#001231] text-[#d7e2ff] min-h-screen flex flex-col font-sans">
      {/* TopAppBar */}
      <header className="bg-[#001231] border-b border-[#5a4136] sticky top-0 z-50">
        <div className="flex justify-between items-center w-full px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ff6600] icon-fill">terminal</span>
            <span className="text-[24px] font-bold text-[#ff6600] tracking-tight">GalvanR.A.G</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#133466] flex items-center justify-center border border-[#5a4136] overflow-hidden cursor-pointer active:scale-95 transition-transform">
            <span className="material-symbols-outlined text-[#e3bfb1]" style={{ fontSize: '20px' }}>person</span>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full px-6 py-6 pb-32 max-w-2xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-[32px] font-bold leading-tight text-[#d7e2ff]">API Reference</h1>
          <div className="w-16 h-1 bg-[#ff6600] rounded-full" />
          <p className="text-[14px] text-[#e3bfb1] mt-2">
            Explore the core RAG pipeline endpoints. Use the try it buttons to test payload structures in real-time.
          </p>
        </div>

        {/* Endpoint cards */}
        <div className="flex flex-col gap-4">
          {endpoints.map(ep => <MobileApiEndpointCard key={ep.id} endpoint={ep} />)}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <MobileBottomNav />
    </div>
  );
}
