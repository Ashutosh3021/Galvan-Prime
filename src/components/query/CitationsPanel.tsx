import type { QueryCitation } from '../../types';

export function CitationsPanel({ citations }: { citations: QueryCitation[] }) {
  if (citations.length === 0) return null;
  return (
    <div className="mt-3 pt-3 border-t border-rule">
      <p className="text-[11px] font-semibold tracking-[0.05em] uppercase text-ink-soft mb-2">
        {citations.length} source{citations.length !== 1 ? 's' : ''} cited
      </p>
      <ol className="flex flex-col gap-1.5">
        {citations.map((c, i) => (
          <li
            key={`${c.source}-${i}`}
            className="flex items-baseline gap-2 text-[12px] font-mono text-ink-soft"
            title={c.chunk}
          >
            <span className="text-cite font-semibold flex-shrink-0">{i + 1}</span>
            <span className="truncate">{c.source}</span>
            <span className="text-ink-soft/70 flex-shrink-0">· p.{c.page}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
