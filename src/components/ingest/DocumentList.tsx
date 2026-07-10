import { useState } from 'react';
import { useDocuments, useDeleteDocument } from '../../hooks/useIngest';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useToast } from '../ui/Toast';
import { Icon } from '../ui/Icon';
import type { DocumentRecord } from '../../types';

function fileIconName(source: string): { icon: string; colorClass: string } {
  if (source.startsWith('http://') || source.startsWith('https://'))
    return { icon: 'link', colorClass: 'text-secondary-container' };
  const ext = source.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return { icon: 'picture_as_pdf', colorClass: 'text-[#ef4444]' };
  return { icon: 'description', colorClass: 'text-on-surface-variant' };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function DocumentRow({ doc, onDelete }: { doc: DocumentRecord; onDelete: (id: string, src: string) => void }) {
  const { icon, colorClass } = fileIconName(doc.source);
  return (
    <tr className="border-b border-surface-container-high last:border-0 hover:bg-surface-container-low/50 transition-colors">
      <td className="p-3">
        <div className="flex items-center gap-3 min-w-0">
          <Icon name={icon} size={18} filled className={`flex-shrink-0 ${colorClass}`} />
          <span className="text-[13px] text-on-surface truncate max-w-[240px]" title={doc.source}>
            {doc.source}
          </span>
        </div>
      </td>
      <td className="p-3 text-[13px] text-on-surface-variant whitespace-nowrap">{doc.collection}</td>
      <td className="p-3 text-[13px] text-center">
        <span className="bg-surface-container-high px-2 py-0.5 rounded text-secondary-container font-mono">
          {doc.chunks}
        </span>
      </td>
      <td className="p-3 text-[12px] text-on-surface-variant whitespace-nowrap">{formatDate(doc.created_at)}</td>
      <td className="p-3 text-right">
        <button
          onClick={() => onDelete(doc.doc_id, doc.source)}
          aria-label={`Delete ${doc.source}`}
          className="p-1.5 rounded text-on-surface-variant hover:text-[#ef4444] hover:bg-[#ef4444]/10 transition-colors"
        >
          <Icon name="delete" size={16} />
        </button>
      </td>
    </tr>
  );
}

export function DocumentList({ collection }: { collection: string }) {
  const { data: docs = [], isLoading, isError, refetch } = useDocuments(collection);
  const deleteMutation = useDeleteDocument();
  const { toast } = useToast();
  const [confirmDoc, setConfirmDoc] = useState<{ id: string; src: string } | null>(null);

  async function handleConfirmDelete() {
    if (!confirmDoc) return;
    try {
      await deleteMutation.mutateAsync({ docId: confirmDoc.id, collection });
      toast('success', `Deleted "${confirmDoc.src}"`);
    } catch (err) {
      toast('error', err instanceof Error ? err.message : 'Failed to delete document');
    } finally {
      setConfirmDoc(null);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-on-surface-variant gap-3" role="status">
        <Icon name="sync" size={20} className="animate-spin" />
        <span className="text-[14px]">Loading documents…</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4 text-[#ef4444]">
        <Icon name="error" size={36} filled />
        <p className="text-[14px]">Failed to load documents.</p>
        <button onClick={() => void refetch()} className="px-4 py-2 rounded-lg bg-surface-container border border-surface-container-high text-on-surface text-[13px] hover:bg-surface-container-high transition-colors">
          Retry
        </button>
      </div>
    );
  }

  if (docs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant gap-3">
        <Icon name="inbox" size={48} className="opacity-30" />
        <p className="text-[14px]">No documents ingested yet.</p>
        <p className="text-[12px] opacity-70">Upload a file or paste a URL above to get started.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-surface-container-high">
        <table className="w-full text-left border-collapse" aria-label="Ingested documents">
          <thead>
            <tr className="bg-surface-container-lowest border-b border-surface-container-high">
              <th className="p-3 text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant">Source</th>
              <th className="p-3 text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant">Collection</th>
              <th className="p-3 text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant text-center">Chunks</th>
              <th className="p-3 text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant">Ingested</th>
              <th className="p-3 text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {docs.map(doc => (
              <DocumentRow key={doc.doc_id} doc={doc} onDelete={(id, src) => setConfirmDoc({ id, src })} />
            ))}
          </tbody>
        </table>
      </div>
      <ConfirmDialog
        open={confirmDoc !== null}
        onOpenChange={open => { if (!open) setConfirmDoc(null); }}
        title="Delete Document"
        description={`Permanently remove "${confirmDoc?.src}" from the collection? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={() => void handleConfirmDelete()}
        destructive
      />
    </>
  );
}
