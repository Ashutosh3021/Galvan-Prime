import { useState } from 'react';
import { useDocuments } from '../hooks/useIngest';
import { useAppState, useAppDispatch } from '../store/useAppStore';
import { Icon } from '../components/ui/Icon';
import type { DocumentRecord } from '../types';

/** Derive collection summaries from the flat document list */
function buildCollections(docs: DocumentRecord[]) {
  const map = new Map<string, { name: string; count: number; latest: string }>();
  for (const doc of docs) {
    const existing = map.get(doc.collection);
    if (!existing) {
      map.set(doc.collection, { name: doc.collection, count: 1, latest: doc.created_at });
    } else {
      existing.count++;
      if (doc.created_at > existing.latest) existing.latest = doc.created_at;
    }
  }
  return Array.from(map.values()).sort((a, b) => b.latest.localeCompare(a.latest));
}

function formatDate(iso: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function CollectionCard({
  collection,
  isActive,
  onSetActive,
}: {
  collection: { name: string; count: number; latest: string };
  isActive: boolean;
  onSetActive: () => void;
}) {
  return (
    <div
      className={`
        bg-paper-deep border rounded-xl p-5 flex flex-col gap-4
        group hover:border-primary-container/50 transition-colors relative overflow-hidden
        ${isActive ? 'border-primary-container/60' : 'border-outline-variant'}
      `}
      role="article"
      aria-label={`Collection: ${collection.name}${isActive ? ' (active)' : ''}`}
    >
      {/* Active indicator */}
      {isActive && (
        <div className="absolute top-0 left-0 w-full h-0.5 bg-primary-container" aria-hidden="true" />
      )}

      {/* Hover overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-ink/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        aria-hidden="true"
      />

      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="bg-paper-deep p-2 rounded-md border border-rule">
          <Icon name="folder_open" size={22} filled={isActive} className={isActive ? 'text-primary-container' : 'text-cite'} />
        </div>
        {isActive && (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary-container/20 text-primary-container border border-primary-container/30">
            ACTIVE
          </span>
        )}
      </div>

      {/* Body */}
      <div>
        <h3 className="text-[16px] font-semibold text-on-surface mb-2 font-mono">{collection.name}</h3>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="bg-surface-container border border-surface-container-high text-cite text-[11px] font-semibold px-2 py-0.5 rounded font-mono">
            {collection.count} doc{collection.count !== 1 ? 's' : ''}
          </span>
          <span className="text-[11px] text-on-surface-variant">
            <Icon name="calendar_today" size={11} className="inline align-middle mr-0.5" />
            {formatDate(collection.latest)}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-rule/50">
        <button
          onClick={onSetActive}
          disabled={isActive}
          aria-label={isActive ? `${collection.name} is already active` : `Set ${collection.name} as active collection`}
          className={`
            w-full flex items-center justify-center gap-2 py-2 rounded-lg
            text-[12px] font-semibold transition-all
            ${isActive
              ? 'bg-primary-container/20 text-primary-container cursor-default'
              : 'border border-surface-container-high text-on-surface-variant hover:border-primary-container/50 hover:text-primary-container hover:bg-primary-container/10'
            }
          `}
        >
          <Icon
            name={isActive ? 'check_circle' : 'radio_button_unchecked'}
            size={16}
            filled={isActive}
            className="flex-shrink-0"
          />
          {isActive ? 'Active Collection' : 'Set as Active'}
        </button>
      </div>
    </div>
  );
}

export default function CollectionsPage() {
  const [search, setSearch] = useState('');
  const { data: docs = [], isLoading, isError, refetch } = useDocuments();
  const { activeCollection } = useAppState();
  const dispatch = useAppDispatch();

  const collections = buildCollections(docs);
  const filtered = collections.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <main id="main-content" className="flex-grow w-full max-w-[1440px] mx-auto px-4 md:px-8 py-8 md:py-12">

      {/* Page header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <h1 className="text-[32px] font-bold leading-tight text-on-surface inline-block relative pb-2">
            Collections
            <span className="absolute bottom-0 left-0 w-full h-1 bg-primary-container rounded-full" aria-hidden="true" />
          </h1>
          <p className="text-[14px] text-on-surface-variant mt-2">
            Manage your document collections. The active collection is used by the Query page.
          </p>
        </div>

        {/* Search */}
        <div className="w-full md:w-64" role="search">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
              <Icon name="search" size={16} />
            </span>
            <input
              type="search"
              placeholder="Filter collections…"
              aria-label="Filter collections"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="
                w-full bg-paper-deep border border-rule rounded-lg py-2 pl-10 pr-4
                text-on-surface placeholder:text-on-surface-variant text-[14px]
                focus:outline-none focus:border-cite focus:ring-1 focus:ring-cite transition-all
              "
            />
          </div>
        </div>
      </div>

      {/* States */}
      {isLoading && (
        <div className="flex items-center justify-center py-24 text-on-surface-variant gap-3" role="status">
          <Icon name="sync" size={28} className="animate-spin" />
          <span className="text-[14px]">Loading collections…</span>
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-warn">
          <Icon name="error" size={40} filled />
          <p className="text-[14px]">Failed to load collections.</p>
          <button
            onClick={() => void refetch()}
            className="px-4 py-2 rounded-lg bg-surface-container border border-surface-container-high text-on-surface text-[13px] hover:bg-surface-container-high transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !isError && (
        filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(c => (
              <CollectionCard
                key={c.name}
                collection={c}
                isActive={c.name === activeCollection}
                onSetActive={() => dispatch({ type: 'SET_ACTIVE_COLLECTION', payload: c.name })}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-on-surface-variant">
            <Icon name="folder_off" size={48} className="mb-4 opacity-30" />
            <p className="text-[15px] font-semibold">
              {search ? 'No collections match your search.' : 'No collections yet.'}
            </p>
            <p className="text-[13px] mt-1 opacity-70">
              {search ? 'Try a different filter or ingest some documents first.' : 'Ingest documents to create your first collection.'}
            </p>
          </div>
        )
      )}
    </main>
  );
}
