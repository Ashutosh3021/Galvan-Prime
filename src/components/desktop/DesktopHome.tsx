import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { MetricCard } from '../../types';

const metrics: MetricCard[] = [
  { label: 'Faithfulness',     value: 0.82, delta: +0.04, status: 'good', icon: 'check_circle' },
  { label: 'Answer Relevancy', value: 0.79, delta: +0.02, status: 'good', icon: 'check_circle' },
  { label: 'Context Recall',   value: 0.74, delta: -0.05, status: 'warn', icon: 'warning' },
];

function MetricCardItem({ card }: { card: MetricCard }) {
  const isWarn = card.status === 'warn';
  return (
    <div className="bg-surface-container rounded-xl p-6 border border-surface-container-high hover:border-surface-variant transition-colors flex flex-col gap-2 relative overflow-hidden group">
      <div className={`absolute top-0 left-0 w-full h-1 ${isWarn ? 'bg-primary' : 'bg-secondary-container'} opacity-20 group-hover:opacity-100 transition-opacity`} />
      <div className="flex justify-between items-center w-full">
        <span className="text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant uppercase">
          {card.label}
        </span>
        <span className={`material-symbols-outlined ${isWarn ? 'text-primary' : 'text-secondary'}`} style={{ fontSize: '18px' }}>
          {card.icon}
        </span>
      </div>
      <div className="flex items-baseline gap-2 mt-2">
        <span className="text-[32px] font-semibold leading-tight text-on-surface">{card.value}</span>
        {card.delta !== undefined && (
          <span className={`text-[14px] ${isWarn ? 'text-primary' : 'text-secondary'}`}>
            {card.delta > 0 ? '+' : ''}{card.delta.toFixed(2)}
          </span>
        )}
      </div>
      {isWarn && (
        <div className="mt-2 w-full bg-surface-container-lowest h-1.5 rounded-full overflow-hidden">
          <div className="bg-primary h-full" style={{ width: `${card.value * 100}%` }} />
        </div>
      )}
    </div>
  );
}

export default function DesktopHome() {
  const [copied, setCopied] = useState(false);
  const command = 'git clone https://github.com/galvan/rag.git && docker-compose up -d';

  function handleCopy() {
    void navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <main
      id="main-content"
      className="flex-grow flex flex-col items-center justify-center px-gutter py-24 w-full max-w-[1440px] mx-auto relative"
    >
      {/* Background decor */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-secondary-container/5 blur-[100px]" />
      </div>

      {/* Hero */}
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

      {/* CLI command */}
      <section className="w-full max-w-2xl mx-auto mb-20 relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-surface-container-high to-surface-variant rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-500" />
        <div className="relative bg-surface-container-lowest border border-surface-container-high rounded-xl p-6 flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-4 overflow-x-auto">
            <span className="text-outline-variant select-none">$</span>
            <code className="font-mono text-[14px] leading-relaxed text-secondary-container whitespace-nowrap">
              {command}
            </code>
          </div>
          <button
            onClick={handleCopy}
            title="Copy to clipboard"
            className="text-on-surface-variant hover:text-on-surface transition-colors p-2 ml-4 flex-shrink-0"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              {copied ? 'check' : 'content_copy'}
            </span>
          </button>
        </div>
      </section>

      {/* Metrics row */}
      <section className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
        {metrics.map((m) => <MetricCardItem key={m.label} card={m} />)}
      </section>

      {/* CTA */}
      <section className="flex justify-center">
        <Link
          to="/query"
          className="bg-primary-container text-white px-8 py-4 rounded-lg text-[20px] font-semibold flex items-center gap-3 transition-all duration-300 hover:brightness-110"
        >
          <span>Go to Dashboard</span>
          <span className="material-symbols-outlined">arrow_forward</span>
        </Link>
      </section>

      <footer className="w-full border-t border-surface-container py-8 mt-16 text-center">
        <p className="text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant">
          © 2024 Galvan Systems. All metrics simulated.
        </p>
      </footer>
    </main>
  );
}