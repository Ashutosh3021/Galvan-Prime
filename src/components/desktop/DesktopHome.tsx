import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { useEvalMetrics } from '../../hooks/useEval';
import type { MetricCard } from '../../types';

function MetricCardItem({ card }: { card: MetricCard }) {
  const isWarn = card.status === 'warn';
  return (
    <div className="bg-surface-container rounded-xl p-6 border border-surface-container-high hover:border-surface-variant transition-colors flex flex-col gap-2 relative overflow-hidden group">
      <div className={`absolute top-0 left-0 w-full h-1 ${isWarn ? 'bg-primary-container' : 'bg-secondary-container'} opacity-20 group-hover:opacity-100 transition-opacity`} />
      <div className="flex justify-between items-center w-full">
        <span className="text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant uppercase">{card.label}</span>
        <Icon name={card.icon} size={18} filled className={isWarn ? 'text-primary-container' : 'text-secondary-container'} />
      </div>
      <div className="flex items-baseline gap-2 mt-2">
        <span className="text-[32px] font-semibold leading-tight text-on-surface">
          {card.value > 0 ? card.value.toFixed(2) : '—'}
        </span>
        {card.delta !== undefined && card.value > 0 && (
          <span className={`text-[14px] ${isWarn ? 'text-primary-container' : 'text-secondary-container'}`}>
            {card.delta > 0 ? '+' : ''}{card.delta.toFixed(2)}
          </span>
        )}
      </div>
      {card.value > 0 && (
        <div className="mt-2 w-full bg-surface-container-lowest h-1.5 rounded-full overflow-hidden">
          <div
            className={`${isWarn ? 'bg-primary-container' : 'bg-secondary-container'} h-full`}
            style={{ width: `${card.value * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default function DesktopHome() {
  const [copied, setCopied] = useState(false);
  const command = 'git clone https://github.com/galvan/rag.git && docker-compose up -d';
  const { data: metrics } = useEvalMetrics();

  function handleCopy() {
    void navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Build metric cards from real eval data; show placeholder values when no runs exist
  const metricCards: MetricCard[] = [
    {
      label: 'Faithfulness',
      value: metrics?.faithfulness ?? 0,
      status: (metrics?.faithfulness ?? 0) >= 0.80 ? 'good' : 'warn',
      icon: 'verified',
    },
    {
      label: 'Answer Relevancy',
      value: metrics?.answer_relevancy ?? 0,
      status: (metrics?.answer_relevancy ?? 0) >= 0.75 ? 'good' : 'warn',
      icon: 'target',
    },
    {
      label: 'Context Recall',
      value: metrics?.context_recall ?? 0,
      status: (metrics?.context_recall ?? 0) >= 0.70 ? 'good' : 'warn',
      icon: 'memory',
    },
  ];

  return (
    <main id="main-content" className="flex-grow flex flex-col items-center justify-center px-gutter py-24 w-full max-w-[1440px] mx-auto relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-container/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-secondary-container/5 blur-[100px]" />
      </div>

      <section className="text-center max-w-4xl mx-auto flex flex-col items-center gap-6 mb-16">
        <h1 className="text-[48px] font-bold leading-tight tracking-[-0.02em] text-on-surface">
          Self-hostable RAG pipeline.<br />
          Upload docs. Get cited answers.<br />
          <span className="text-on-surface-variant">Measure quality.</span>
        </h1>
        <div className="w-32 h-1.5 bg-primary-container rounded-full mt-2 mb-4 shadow-[0_0_10px_rgba(255,102,0,0.5)]" />
        <p className="text-[16px] leading-relaxed text-tertiary-container max-w-2xl">
          Information at light speed. Deploy enterprise-grade Retrieval-Augmented Generation
          infrastructure in minutes, entirely within your secure network boundaries.
        </p>
      </section>

      <section className="w-full max-w-2xl mx-auto mb-20 relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-surface-container-high to-surface-variant rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-500" />
        <div className="relative bg-surface-container-lowest border border-surface-container-high rounded-xl p-6 flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-4 overflow-x-auto">
            <Icon name="terminal" size={18} className="text-on-surface-variant flex-shrink-0" />
            <code className="font-mono text-[14px] leading-relaxed text-secondary-container whitespace-nowrap">{command}</code>
          </div>
          <button onClick={handleCopy} title="Copy to clipboard" className="text-on-surface-variant hover:text-on-surface transition-colors p-2 ml-4 flex-shrink-0">
            <Icon name={copied ? 'check' : 'content_copy'} size={18} />
          </button>
        </div>
      </section>

      <section className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
        {metricCards.map(m => <MetricCardItem key={m.label} card={m} />)}
      </section>

      <section className="flex justify-center">
        <Link to="/query" className="bg-primary-container text-white px-8 py-4 rounded-lg text-[20px] font-semibold flex items-center gap-3 transition-all duration-300 hover:brightness-110">
          <span>Go to Dashboard</span>
          <Icon name="arrow_forward" size={22} />
        </Link>
      </section>

      <footer className="w-full border-t border-surface-container py-8 mt-16 text-center">
        <p className="text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant">© 2025 GalvanR.A.G.</p>
      </footer>
    </main>
  );
}
