import { useState } from 'react';
import { Icon } from '../ui/Icon';
import type { QueryCitation } from '../../types';

function CitationItem({ citation, index }: { citation: QueryCitation; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const isUrl = citation.source.startsWith('http://') || citation.source.startsWith('https://');

  return (
    <li className="border border-surface-container-high rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(v => !v)}
        aria-expanded={expanded}
        className="w-full flex items-start gap-3 p-3 text-left hover:bg-surface-container-high transition-colors"
      >
        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-secondary-container/20 text-secondary-container text-[11px] font-bold flex items-center justify-center mt-0.5">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <Icon name={isUrl ? 'link' : 'picture_as_pdf'} size={13} className="text-on-surface-variant flex-shrink-0" />
            <span className="text-[13px] font-semibold text-secondary-container truncate" title={citation.source}>
              {citation.source}
            </span>
          </div>
          <span className="text-[11px] text-on-surface-variant mt-0.5 block">Page {citation.page}</span>
        </div>
        <Icon
          name="expand_more"
          size={18}
          className={`text-on-surface-variant flex-shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-surface-container-high animate-sweep">
          <blockquote className="text-[13px] text-on-surface-variant leading-relaxed border-l-2 border-secondary-container/40 pl-3 mt-3 font-mono">
            "{citation.chunk}"
          </blockquote>
        </div>
      )}
    </li>
  );
}

export function CitationsPanel({ citations }: { citations: QueryCitation[] }) {
  if (citations.length === 0) return null;
  return (
    <div className="mt-4 pt-4 border-t border-surface-container-high">
      <p className="text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant mb-3 flex items-center gap-1.5">
        <Icon name="library_books" size={14} />
        {citations.length} source{citations.length !== 1 ? 's' : ''} cited
      </p>
      <ul className="flex flex-col gap-2" aria-label="Citations">
        {citations.map((c, i) => (
          <CitationItem key={`${c.source}-${i}`} citation={c} index={i} />
        ))}
      </ul>
    </div>
  );
}
