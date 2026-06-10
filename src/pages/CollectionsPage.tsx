// src/pages/CollectionsPage.tsx
import { useState } from 'react';

interface Collection {
  id: string;
  name: string;
  docCount: number;
  store: 'ChromaDB' | 'Pinecone';
  storeColor: 'blue' | 'yellow';
  lastUpdated: string;
}

const MOCK_COLLECTIONS: Collection[] = [
  {
    id: '1',
    name: 'Legal Compliance Docs',
    docCount: 12,
    store: 'ChromaDB',
    storeColor: 'blue',
    lastUpdated: '2h ago',
  },
  {
    id: '2',
    name: 'Q3 Technical Specs',
    docCount: 45,
    store: 'Pinecone',
    storeColor: 'yellow',
    lastUpdated: '5h ago',
  },
  {
    id: '3',
    name: 'API Documentation',
    docCount: 8,
    store: 'ChromaDB',
    storeColor: 'blue',
    lastUpdated: '1d ago',
  },
  {
    id: '4',
    name: 'User Feedback Logs',
    docCount: 128,
    store: 'Pinecone',
    storeColor: 'yellow',
    lastUpdated: '3d ago',
  },
];

function StoreBadge({ store, color }: { store: string; color: 'blue' | 'yellow' }) {
  if (color === 'yellow') {
    return (
      <span className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 font-label-caps text-label-caps px-2 py-1 rounded flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" aria-hidden="true" />
        {store}
      </span>
    );
  }
  return (
    <span className="bg-secondary-container/20 border border-secondary/30 text-secondary font-label-caps text-label-caps px-2 py-1 rounded flex items-center gap-1">
      <span className="w-1.5 h-1.5 rounded-full bg-secondary" aria-hidden="true" />
      {store}
    </span>
  );
}

function CollectionCard({ collection }: { collection: Collection }) {
  return (
    <div
      className="bg-[#1A2338] border border-outline-variant rounded-lg p-5 flex flex-col gap-4
        group hover:border-primary-container/50 transition-colors cursor-pointer relative overflow-hidden"
      role="article"
      aria-label={`Collection: ${collection.name}`}
    >
      {/* Subtle gradient hover overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        aria-hidden="true"
      />

      {/* Card header */}
      <div className="flex justify-between items-start">
        <div className="bg-[#252F4A] p-2 rounded-md border border-[#303C5A]">
          <span
            className="material-symbols-outlined text-primary"
            style={{ fontVariationSettings: "'FILL' 1" }}
            aria-hidden="true"
          >
            folder
          </span>
        </div>
        <button
          className="text-on-surface-variant hover:text-on-surface p-1 rounded hover:bg-surface-container-high transition-colors"
          aria-label={`More options for ${collection.name}`}
        >
          <span className="material-symbols-outlined" aria-hidden="true">more_vert</span>
        </button>
      </div>

      {/* Card body */}
      <div>
        <h3 className="font-title-md text-title-md text-on-surface mb-1">{collection.name}</h3>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="bg-[#1A2338] border border-[#303C5A] text-secondary font-label-caps text-label-caps px-2 py-1 rounded">
            {collection.docCount} documents
          </span>
          <StoreBadge store={collection.store} color={collection.storeColor} />
        </div>
      </div>

      {/* Card footer */}
      <div className="mt-auto pt-4 flex justify-between items-center border-t border-[#303C5A]/50">
        <span className="font-body-sm text-body-sm text-on-surface-variant/70">
          Last updated: {collection.lastUpdated}
        </span>
        <span
          className="material-symbols-outlined text-on-surface-variant group-hover:text-primary-container
            transition-colors translate-x-0 group-hover:translate-x-1 duration-200"
          aria-hidden="true"
        >
          chevron_right
        </span>
      </div>
    </div>
  );
}

export default function CollectionsPage() {
  const [search, setSearch] = useState('');

  const filtered = MOCK_COLLECTIONS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 md:px-8 py-8 md:py-12">
      {/* Page header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface inline-block relative pb-2">
            Collections
            <span
              className="absolute bottom-0 left-0 w-full h-1 bg-primary-container rounded-full"
              aria-hidden="true"
            />
          </h1>
          <p className="font-body-lg text-body-lg text-secondary/80 mt-2">
            Manage your document collections and vector stores
          </p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Search bar */}
          <div className="relative w-full md:w-64" role="search">
            <span
              className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
              style={{ fontSize: '18px' }}
              aria-hidden="true"
            >
              search
            </span>
            <input
              type="search"
              placeholder="Filter collections..."
              aria-label="Filter collections"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#1A2338] border border-[#303C5A] rounded-lg py-2 pl-10 pr-4
                text-on-surface placeholder:text-on-surface-variant font-body-sm text-body-sm
                focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
            />
          </div>

          {/* New Collection CTA */}
          <button
            className="bg-primary-container text-on-primary hover:brightness-110 transition-all
              px-4 py-2 rounded-lg font-body-sm text-body-sm font-bold
              flex items-center gap-2 whitespace-nowrap shadow-lg shadow-primary-container/20"
            aria-label="Create new collection"
          >
            <span className="material-symbols-outlined text-sm" aria-hidden="true">add</span>
            New Collection
          </button>
        </div>
      </div>

      {/* Collections grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(collection => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-on-surface-variant">
          <span className="material-symbols-outlined mb-4" style={{ fontSize: '48px' }} aria-hidden="true">
            folder_off
          </span>
          <p className="font-body-lg text-body-lg">No collections match your search.</p>
          <p className="font-body-sm text-body-sm mt-1">Try a different filter or create a new collection.</p>
        </div>
      )}
    </main>
  );
}