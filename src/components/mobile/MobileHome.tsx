import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { useEvalMetrics } from '../../hooks/useEval';

export function MobileTopAppBar({ title }: { title: string }) {
  return (
    <header className="bg-paper border-b border-rule flex justify-between items-center w-full px-6 py-4 sticky top-0 z-30">
      <div className="flex items-center gap-2">
        <Icon name="terminal" size={20} className="text-cite" />
        <h1 className="text-[22px] font-bold text-ink tracking-tight">{title}</h1>
      </div>
      <div className="w-8 h-8 rounded-full bg-paper-deep flex items-center justify-center border border-rule">
        <Icon name="person" size={18} className="text-ink-soft" />
      </div>
    </header>
  );
}

export default function MobileHome() {
  const [copied, setCopied] = useState(false);
  const command = 'git clone https://github.com/galvan/rag.git && docker-compose up';
  const { data: metrics } = useEvalMetrics();

  function handleCopy() {
    void navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const fmt = (v?: number) => (v && v > 0 ? v.toFixed(2) : '—');

  return (
    <div className="text-ink font-sans flex flex-col min-h-dvh" style={{ backgroundColor: '#E9E0CC' }}>
      <MobileTopAppBar title="GalvanR.A.G" />
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <section className="py-4">
            <h2 className="text-[28px] font-bold leading-tight tracking-[-0.02em] text-ink mb-3">
              Self-hosted RAG.{' '}
              <span className="text-ink-soft">Upload docs. Get answers you can trace back to the source.</span>
            </h2>
            <p className="text-[15px] leading-relaxed text-ink-soft">
              Upload PDFs, URLs, or text. Ask in plain language. Every answer links to the exact
              chunk it came from — and a RAGAS score tells you how far to trust it.
            </p>
          </section>

          {/* Signature: citation-highlight moment */}
          <section>
            <div className="bg-paper-deep border border-rule rounded-xl p-5">
              <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-ink-soft mb-2">
                An answer, shown the way the product shows it
              </p>
              <p className="font-serif text-[17px] leading-relaxed text-ink">
                The model reports a 12% yield,{' '}
                <span className="bg-cite/15 underline decoration-cite decoration-2 underline-offset-2 rounded-sm px-0.5">
                  but only on the third pass
                </span>.¹
              </p>
              <div className="mt-3 pt-3 border-t border-rule flex items-baseline gap-2">
                <span className="font-mono text-[12px] text-cite">¹</span>
                <span className="font-mono text-[12px] text-ink-soft">pdf · p.4 · chunk 2</span>
              </div>
            </div>
          </section>

          {/* Install command */}
          <section className="flex items-center justify-between bg-paper-deep border border-rule rounded-lg p-4 gap-3">
            <code className="font-mono text-[12px] text-ink truncate">{command}</code>
            <button
              onClick={handleCopy}
              title="Copy to clipboard"
              aria-label="Copy install command"
              className="text-ink-soft hover:text-ink transition-colors flex-shrink-0"
            >
              <Icon name={copied ? 'check' : 'content_copy'} size={16} />
            </button>
          </section>

          {/* Quiet stat strip */}
          <section className="flex items-center justify-center gap-4 text-[12px] font-mono text-ink-soft">
            <span>faith. <span className="text-ink font-semibold">{fmt(metrics?.faithfulness)}</span></span>
            <span aria-hidden="true">·</span>
            <span>rel. <span className="text-ink font-semibold">{fmt(metrics?.answer_relevancy)}</span></span>
            <span aria-hidden="true">·</span>
            <span>rec. <span className="text-ink font-semibold">{fmt(metrics?.context_recall)}</span></span>
          </section>

          <section className="flex justify-center pt-2">
            <Link
              to="/query"
              className="bg-ink text-paper px-8 py-4 rounded-lg text-[18px] font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              Open the query console
              <Icon name="arrow_forward" size={20} />
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
