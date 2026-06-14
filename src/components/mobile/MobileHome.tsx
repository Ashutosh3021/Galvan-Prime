import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { useEvalMetrics } from '../../hooks/useEval';

export function MobileTopAppBar({ title }: { title: string }) {
  return (
    <header className="bg-[#001231] border-b border-[#5a4136] flex justify-between items-center w-full px-6 py-4 sticky top-0 z-30">
      <div className="flex items-center gap-2">
        <Icon name="terminal" size={20} className="text-[#ff6600]" />
        <h1 className="text-[24px] font-bold text-[#ff6600] tracking-tight">{title}</h1>
      </div>
      <div className="w-8 h-8 rounded-full bg-[#133466] flex items-center justify-center border border-[#5a4136]">
        <Icon name="person" size={18} className="text-[#e3bfb1]" />
      </div>
    </header>
  );
}

function MobileMetric({ label, value, status, icon }: { label: string; value: number; status: 'good' | 'warn'; icon: string }) {
  const isGood = status === 'good';
  return (
    <div className="bg-[#1A2338] border border-[#2D3748] rounded-lg p-6 flex flex-col gap-2">
      <div className="flex items-center justify-between text-[#e3bfb1]">
        <span className="text-[14px]">{label}</span>
        <Icon name={icon} size={18} className="text-[#e3bfb1]" />
      </div>
      <div className="flex items-end gap-2">
        <span className={`text-[32px] font-bold ${isGood ? 'text-[#10B981]' : 'text-[#F59E0B]'}`}>
          {value > 0 ? value.toFixed(2) : '—'}
        </span>
        {value > 0 && (
          <span className={`text-[12px] font-bold mb-1 ${isGood ? 'text-[#10B981]' : 'text-[#F59E0B]'}`}>
            {isGood ? 'GOOD' : 'WARN'}
          </span>
        )}
      </div>
      {value > 0 && (
        <div className="w-full bg-[#000d27] h-1 rounded-full overflow-hidden">
          <div className={`h-full ${isGood ? 'bg-[#10B981]' : 'bg-[#F59E0B]'}`} style={{ width: `${value * 100}%` }} />
        </div>
      )}
    </div>
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

  const faithfulness = metrics?.faithfulness ?? 0;
  const answerRelevancy = metrics?.answer_relevancy ?? 0;
  const contextRecall = metrics?.context_recall ?? 0;

  return (
    <div className="text-[#d7e2ff] font-sans flex flex-col" style={{ backgroundColor: '#0A0F1C' }}>
      <MobileTopAppBar title="GalvanR.A.G" />
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <section className="text-center md:text-left py-8">
            <h2 className="text-[32px] font-bold leading-tight tracking-[-0.02em] text-[#d7e2ff] mb-4">
              Self-hostable RAG pipeline.{' '}
              <span className="text-[#e3bfb1]">Upload docs. Get cited answers. Measure quality.</span>
            </h2>
            <div className="w-16 h-1 bg-[#ff6600] rounded-full mx-auto md:mx-0 mb-6" />
            <div className="hidden md:inline-flex bg-[#0D1117] rounded-lg border border-[#2D3748] p-4 items-center gap-4 shadow-lg w-full md:w-auto max-w-full overflow-hidden">
              <Icon name="terminal" size={16} className="text-[#e3bfb1] flex-shrink-0" />
              <code className="font-mono text-[13px] text-[#00BFFF] truncate">{command}</code>
              <button onClick={handleCopy} title="Copy to clipboard" className="ml-2 p-1 text-[#e3bfb1] hover:text-[#d7e2ff] transition-colors flex-shrink-0">
                <Icon name={copied ? 'check' : 'content_copy'} size={16} />
              </button>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MobileMetric label="Faithfulness"     value={faithfulness}   status={faithfulness >= 0.80 ? 'good' : 'warn'}   icon="verified" />
            <MobileMetric label="Answer Relevancy" value={answerRelevancy} status={answerRelevancy >= 0.75 ? 'good' : 'warn'} icon="target"   />
            <MobileMetric label="Context Recall"   value={contextRecall}  status={contextRecall >= 0.70 ? 'good' : 'warn'}  icon="memory"   />
          </section>

          <section className="flex justify-center md:justify-start pt-6">
            <Link to="/query" className="bg-[#ff6600] text-white px-8 py-4 rounded-lg text-[20px] font-semibold hover:opacity-90 active:scale-95 transition-all shadow-lg flex items-center gap-2">
              Go to Dashboard
              <Icon name="arrow_forward" size={22} />
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
