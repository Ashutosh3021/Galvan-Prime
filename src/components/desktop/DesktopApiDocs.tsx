import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { ApiEndpoint } from '../../types';

import DesktopTopNav from '../shared/DesktopTopNav';

// ─── Data ─────────────────────────────────────────────────────────────────────

const endpoints: ApiEndpoint[] = [
  {
    id: 'ingest',
    method: 'POST',
    path: '/api/v1/ingest',
    description: 'Ingest documents into the vector database.',
    parameters: [
      { name: 'documents', type: 'Array[Object]', description: "Required. List of document objects containing 'text' and optional 'metadata'.", required: true },
      { name: 'collection', type: 'String', description: "Optional. Target vector collection name. Defaults to 'default'." },
    ],
    exampleRequest: `curl -X POST "https://api.galvanrag.com/v1/ingest" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "documents": [
      {
        "text": "The quick brown fox...",
        "metadata": {"source": "manual"}
      }
    ]
  }'`,
    exampleResponse: `{
  "status": "processing",
  "job_id": "job_987654321",
  "documents_queued": 1
}`,
  },
  {
    id: 'query',
    method: 'POST',
    path: '/api/v1/query',
    description: 'Execute a RAG retrieval and generation pipeline.',
    parameters: [
      { name: 'query',      type: 'String', description: 'Required. The question or prompt to evaluate.', required: true },
      { name: 'session_id', type: 'String', description: 'Optional. Identifier for conversation history management.' },
      { name: 'collection', type: 'String', description: 'Optional. Vector collection to query against.' },
    ],
    exampleRequest: `curl -X POST "https://api.galvanrag.com/v1/query" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "How do I configure the embedding model?",
    "session_id": "usr_abc123",
    "collection": "docs-v2"
  }'`,
    exampleResponse: `{
  "answer": "To configure the embedding model...",
  "citations": [
    {"source": "config_guide.md", "score": 0.92}
  ],
  "latency_ms": 845
}`,
  },
  {
    id: 'health',
    method: 'GET',
    path: '/api/v1/health',
    description: 'Check system status and dependency health.',
    parameters: [],
    exampleRequest: `curl -X GET "https://api.galvanrag.com/v1/health"`,
    exampleResponse: `{
  "status": "healthy",
  "version": "1.0.4-stable",
  "dependencies": {
    "vector_db": "connected",
    "llm_engine": "operational"
  }
}`,
  },
];

// ─── Accordion Endpoint ───────────────────────────────────────────────────────

function EndpointAccordion({ endpoint }: { endpoint: ApiEndpoint }) {
  const [open, setOpen] = useState(false);
  const isGet = endpoint.method === 'GET';

  return (
    <div className="bg-surface-container rounded-xl border border-surface-container-highest overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-4 bg-surface-container hover:bg-surface-bright transition-colors text-left focus:outline-none"
      >
        <div className="flex items-center gap-4">
          <span className={`text-[12px] font-semibold tracking-[0.05em] ${isGet ? 'bg-secondary-container/20 text-secondary-container' : 'bg-primary-container/20 text-primary-container'} px-3 py-1 rounded font-bold uppercase`}>
            {endpoint.method}
          </span>
          <span className="text-[20px] font-semibold text-on-surface font-mono">{endpoint.path}</span>
          <span className="text-[14px] text-on-surface-variant hidden md:inline ml-4">{endpoint.description}</span>
        </div>
        <span className={`material-symbols-outlined text-on-surface-variant transform transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>

      {open && (
        <div className="border-t border-surface-container-highest bg-surface-container">
          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 animate-sweep">
            {/* Left: details */}
            <div className="space-y-6">
              <div>
                <h3 className="text-[20px] font-semibold text-on-surface mb-2">Description</h3>
                <p className="text-[14px] text-on-surface-variant">{endpoint.description}</p>
              </div>
              {endpoint.parameters && endpoint.parameters.length > 0 && (
                <div>
                  <h3 className="text-[20px] font-semibold text-on-surface mb-4">
                    {isGet ? 'Query Parameters' : 'Request Body'}
                  </h3>
                  <div className="bg-surface-container-lowest rounded border border-surface-container-high overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-surface-container-high border-b border-surface-container-highest">
                          {['Parameter', 'Type', 'Description'].map(h => (
                            <th key={h} className="p-3 text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="text-[14px] text-on-surface">
                        {endpoint.parameters.map(p => (
                          <tr key={p.name} className="border-b border-surface-container-highest last:border-0">
                            <td className="p-3 font-mono text-secondary">{p.name}</td>
                            <td className="p-3 text-on-surface-variant">{p.type}</td>
                            <td className="p-3">{p.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {endpoint.parameters && endpoint.parameters.length === 0 && (
                <div>
                  <h3 className="text-[20px] font-semibold text-on-surface mb-4">Query Parameters</h3>
                  <p className="text-[14px] text-on-surface-variant italic">No parameters required.</p>
                </div>
              )}
              <button className="bg-secondary-container text-on-secondary-container hover:bg-secondary transition-colors px-6 py-2 rounded text-[12px] font-bold flex items-center gap-2 shadow-md shadow-black/20">
                <span className="material-symbols-outlined">play_arrow</span>
                Try it
              </button>
            </div>

            {/* Right: code samples */}
            <div className="space-y-4">
              <div>
                <span className="text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant mb-2 block">Example Request</span>
                <div className="bg-surface-container-lowest border border-surface-container-high rounded-md p-4 overflow-x-auto">
                  <pre className="font-mono text-[14px] leading-relaxed text-secondary whitespace-pre-wrap">{endpoint.exampleRequest}</pre>
                </div>
              </div>
              <div>
                <span className="text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant mb-2 block">
                  Example Response {isGet ? '(200 OK)' : endpoint.id === 'ingest' ? '(202 Accepted)' : '(200 OK)'}
                </span>
                <div className="bg-surface-container-lowest border border-surface-container-high rounded-md p-4 overflow-x-auto">
                  <pre className="font-mono text-[14px] leading-relaxed text-secondary">{endpoint.exampleResponse}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DesktopApiDocs() {
  const { pathname } = useLocation();
  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      <DesktopTopNav />
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-gutter py-[32px]">
        <header className="mb-12">
          <h1 className="text-[48px] font-bold leading-tight tracking-[-0.02em] text-on-surface inline-block border-b-4 border-primary-container pb-2">
            API Reference
          </h1>
          <p className="text-[16px] leading-relaxed text-on-surface-variant mt-4 max-w-2xl">
            Integrate GalvanR.A.G. core capabilities directly into your applications.
            All requests require standard Bearer token authentication.
          </p>
        </header>
        <div className="space-y-6">
          {endpoints.map(ep => <EndpointAccordion key={ep.id} endpoint={ep} />)}
        </div>
      </main>
    </div>
  );
}
