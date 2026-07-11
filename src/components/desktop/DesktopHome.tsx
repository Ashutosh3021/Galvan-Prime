import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { useEvalMetrics } from '../../hooks/useEval';

export default function DesktopHome() {
  const [copied, setCopied] = useState(false);
  const command = 'git clone https://github.com/galvan/rag.git && docker-compose up -d';
  const { data: metrics } = useEvalMetrics();

  function handleCopy() {
    void navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const fmt = (v?: number) => (v && v > 0 ? v.toFixed(2) : '—');

  return (
    <main id="main-content" className="flex-grow flex flex-col items-center justify-center px-gutter py-24 w-full max-w-[1440px] mx-auto">
      <section className="text-center max-w-3xl mx-auto flex flex-col items-center gap-5 mb-14">
        <h1 className="text-[44px] font-bold leading-tight tracking-[-0.02em] text-ink">
          Self-hosted RAG. Upload docs.<br />
          Get answers you can <span className="text-ink-soft">trace back to the source.</span>
        </h1>
        <p className="text-[16px] leading-relaxed text-ink-soft max-w-2xl">
          Upload PDFs, URLs, or text. Ask in plain language. Every answer links to the exact
          chunk it came from — and a RAGAS score tells you how far to trust it.
        </p>
      </section>

      {/* Signature: the citation-highlight moment, no terminal chrome */}
      <section className="w-full max-w-2xl mx-auto mb-14">
        <div className="bg-paper-deep border border-rule rounded-xl p-7">
          <p className="text-[12px] font-semibold tracking-[0.08em] uppercase text-ink-soft mb-3">
            An answer, shown the way the product shows it
          </p>
          <p className="font-serif text-[19px] leading-relaxed text-ink">
            The model reports a 12% yield,{' '}
            <span className="bg-cite/15 underline decoration-cite decoration-2 underline-offset-2 rounded-sm px-0.5">
              but only on the third pass
            </span>.¹
          </p>
          <div className="mt-4 pt-3 border-t border-rule flex items-baseline gap-2">
            <span className="font-mono text-[12px] text-cite">¹</span>
            <span className="font-mono text-[12px] text-ink-soft">pdf · p.4 · chunk 2</span>
          </div>
        </div>
      </section>

      {/* Install command, set like a library call-number */}
      <section className="w-full max-w-2xl mx-auto mb-10">
        <div className="flex items-center justify-between bg-paper-deep border border-rule rounded-lg p-4 gap-4">
          <code className="font-mono text-[13px] text-ink whitespace-nowrap overflow-x-auto">{command}</code>
          <button
            onClick={handleCopy}
            title="Copy to clipboard"
            aria-label="Copy install command"
            className="text-ink-soft hover:text-ink transition-colors p-2 flex-shrink-0"
          >
            <Icon name={copied ? 'check' : 'content_copy'} size={18} />
          </button>
        </div>
      </section>

      {/* Quiet stat strip — not the focal hero */}
      <section className="w-full max-w-2xl mx-auto mb-14 flex items-center justify-center gap-5 text-[13px] font-mono text-ink-soft">
        <span>faithfulness <span className="text-ink font-semibold">{fmt(metrics?.faithfulness)}</span></span>
        <span aria-hidden="true">·</span>
        <span>relevancy <span className="text-ink font-semibold">{fmt(metrics?.answer_relevancy)}</span></span>
        <span aria-hidden="true">·</span>
        <span>recall <span className="text-ink font-semibold">{fmt(metrics?.context_recall)}</span></span>
      </section>

      <section className="flex justify-center">
        <Link
          to="/query"
          className="bg-ink text-paper px-8 py-4 rounded-lg text-[18px] font-semibold flex items-center gap-3 hover:opacity-90 transition-opacity"
        >
          <span>Open the query console</span>
          <Icon name="arrow_forward" size={22} />
        </Link>
      </section>

      <footer className="w-full border-t border-rule py-8 mt-16 text-center">
        <p className="text-[12px] font-semibold tracking-[0.05em] text-ink-soft">© 2025 GalvanR.A.G.</p>
      </footer>
    </main>
  );
}
