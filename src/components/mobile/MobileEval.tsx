import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import MobileBottomNav from '../shared/MobileBottomNav';
import DesktopTopNav from '../shared/DesktopTopNav';
import type { EvalResult } from '../../types';

const evalResults: EvalResult[] = [
  { question: 'What is the main purpose of the RAG architecture?', faithfulness: 0.94, relevancy: 0.91, recall: 0.88, timestamp: '2024-01-15T14:23:00Z' },
  { question: 'How does the ingestion pipeline process PDF documents?', faithfulness: 0.87, relevancy: 0.85, recall: 0.79, timestamp: '2024-01-15T14:24:00Z' },
  { question: 'What are the configuration options for hybrid search?', faithfulness: 0.92, relevancy: 0.78, recall: 0.83, timestamp: '2024-01-15T14:25:00Z' },
  { question: 'Explain the token limit handling strategy.', faithfulness: 0.73, relevancy: 0.69, recall: 0.65, timestamp: '2024-01-15T14:26:00Z' },
];

function ScoreBadge({ value }: { value: number }) {
  const isGood = value >= 0.8;
  const isWarn = value >= 0.65 && value < 0.8;
  return (
    <span className={`text-[12px] font-bold px-2 py-1 rounded ${
      isGood ? 'text-[#4ae176] bg-[#00ae4f]/20' : isWarn ? 'text-[#f59e0b] bg-[#f59e0b]/20' : 'text-[#ffb4ab] bg-[#93000a]/30'
    }`}>
      {value.toFixed(2)}
    </span>
  );
}

export default function MobileEval() {
  const { pathname } = useLocation();
  const [activeTab, setActiveTab] = useState<'results' | 'settings'>('results');

  const avgFaithfulness = evalResults.reduce((a, r) => a + r.faithfulness, 0) / evalResults.length;
  const avgRelevancy    = evalResults.reduce((a, r) => a + r.relevancy, 0)    / evalResults.length;
  const avgRecall       = evalResults.reduce((a, r) => a + r.recall, 0)       / evalResults.length;

  return (
    <div className="bg-[#001231] text-[#d7e2ff] font-sans min-h-screen flex">
      <main className="flex-1 flex flex-col pb-20">
        <div className="hidden md:block w-full">
          <DesktopTopNav />
        </div>
        {/* Mobile Header */}
        <header className="md:hidden bg-[#001231] border-b border-[#5a4136] flex justify-between items-center w-full px-6 py-4 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <h1 className="text-[24px] font-bold text-[#ff6600]">Eval</h1>
          </div>
          <div className="h-8 w-8 rounded-full bg-[#133466] flex items-center justify-center">
            <span className="material-symbols-outlined text-[#e3bfb1]" style={{ fontSize: '20px' }}>person</span>
          </div>
        </header>

        <div className="p-4 lg:p-6 space-y-6">
          {/* Title */}
          <div>
            <h1 className="text-[32px] font-bold leading-tight text-[#d7e2ff] mb-1">Evaluation Suite</h1>
            <p className="text-[14px] text-[#e3bfb1]">RAG pipeline quality assessment</p>
          </div>

          {/* Tab bar */}
          <div className="flex border-b border-[#5a4136]">
            {(['results', 'settings'] as const).map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`px-5 py-3 text-[14px] font-semibold capitalize transition-colors ${
                  activeTab === t ? 'text-[#ff6600] border-b-2 border-[#ff6600]' : 'text-[#e3bfb1] hover:text-[#d7e2ff]'
                }`}>
                {t}
              </button>
            ))}
          </div>

          {activeTab === 'results' && (
            <div className="space-y-6">
              {/* Summary cards */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Faithfulness', value: avgFaithfulness, icon: 'verified' },
                  { label: 'Relevancy',    value: avgRelevancy,    icon: 'target'   },
                  { label: 'Recall',       value: avgRecall,       icon: 'memory'   },
                ].map(m => {
                  const isGood = m.value >= 0.8;
                  return (
                    <div key={m.label} className="bg-[#1A2338] border border-[#2D3748] rounded-lg p-4 text-center">
                      <span className={`material-symbols-outlined ${isGood ? 'text-[#4ae176]' : 'text-[#f59e0b]'}`}>{m.icon}</span>
                      <div className={`text-[24px] font-bold mt-1 ${isGood ? 'text-[#4ae176]' : 'text-[#f59e0b]'}`}>{m.value.toFixed(2)}</div>
                      <div className="text-[11px] text-[#e3bfb1] font-semibold mt-1">{m.label}</div>
                    </div>
                  );
                })}
              </div>

              {/* Eval table */}
              <div className="bg-[#1A2338] border border-[#2D3748] rounded-lg overflow-hidden">
                <div className="p-4 border-b border-[#2D3748]">
                  <h2 className="text-[16px] font-semibold text-[#d7e2ff]">Test Results</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#0D1117] border-b border-[#2D3748]">
                        <th className="p-3 text-[12px] font-semibold tracking-[0.05em] text-[#e3bfb1]">Question</th>
                        <th className="p-3 text-[12px] font-semibold tracking-[0.05em] text-[#e3bfb1] text-center">Faith.</th>
                        <th className="p-3 text-[12px] font-semibold tracking-[0.05em] text-[#e3bfb1] text-center">Relev.</th>
                        <th className="p-3 text-[12px] font-semibold tracking-[0.05em] text-[#e3bfb1] text-center">Recall</th>
                      </tr>
                    </thead>
                    <tbody>
                      {evalResults.map((r, i) => (
                        <tr key={i} className="border-b border-[#2D3748] last:border-0 hover:bg-[#001e48] transition-colors">
                          <td className="p-3 text-[13px] text-[#d7e2ff] max-w-[150px] truncate">{r.question}</td>
                          <td className="p-3 text-center"><ScoreBadge value={r.faithfulness} /></td>
                          <td className="p-3 text-center"><ScoreBadge value={r.relevancy} /></td>
                          <td className="p-3 text-center"><ScoreBadge value={r.recall} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <button className="w-full bg-[#ff6600] text-white py-4 rounded-lg font-semibold hover:opacity-90 transition-opacity active:scale-95 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">play_arrow</span>
                Run New Evaluation
              </button>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="bg-[#1A2338] border border-[#2D3748] rounded-lg p-4 flex flex-col gap-4">
                <h2 className="text-[16px] font-semibold text-[#d7e2ff]">Evaluation Settings</h2>
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-semibold text-[#e3bfb1] uppercase">Test Set</label>
                  <select className="bg-[#0A0F1C] border border-[#2D3748] text-[#d7e2ff] rounded p-2 text-[14px] focus:outline-none focus:border-[#ff6600]">
                    <option>Default Test Set (25 questions)</option>
                    <option>Custom Test Set</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-semibold text-[#e3bfb1] uppercase">Judge Model</label>
                  <select className="bg-[#0A0F1C] border border-[#2D3748] text-[#d7e2ff] rounded p-2 text-[14px] focus:outline-none focus:border-[#ff6600]">
                    <option>Gemini 1.5 Pro</option>
                    <option>GPT-4o</option>
                    <option>Claude 3.5 Sonnet</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom nav (mobile only) */}
        <MobileBottomNav />
      </main>
    </div>
  );
}
