import { useLocation } from 'react-router-dom';
import MobileBottomNav from '../shared/MobileBottomNav';
import type { ServiceHealth } from '../../types';

const services: ServiceHealth[] = [
  { name: 'PostgreSQL', status: 'up',       icon: 'database'   },
  { name: 'ChromaDB',   status: 'up',       icon: 'dns'        },
  { name: 'Pinecone',   status: 'degraded', icon: 'memory'     },
  { name: 'LLM Gemini', status: 'up',       icon: 'psychology' },
  { name: 'Redis',      status: 'down',     icon: 'storage'    },
];

const latencyData = [
  { label: 'P50', value: 20, text: '120ms' },
  { label: 'P90', value: 45, text: '450ms' },
  { label: 'P99', value: 85, text: '1200ms', isError: true },
];

const logLines = [
  { ts: '[2023-10-27 14:32:01]', level: 'INFO',  msg: 'Ingestion complete for batch ID: 89a2f1'          },
  { ts: '[2023-10-27 14:32:15]', level: 'WARN',  msg: 'Pinecone latency high (450ms)'                   },
  { ts: '[2023-10-27 14:32:45]', level: 'ERROR', msg: 'Redis connection lost. Attempting reconnect...'  },
  { ts: '[2023-10-27 14:33:02]', level: 'INFO',  msg: 'LLM Gemini returned successfully (tokens: 452)'  },
  { ts: '[2023-10-27 14:33:10]', level: 'INFO',  msg: 'Query cache hit rate: 84%'                       },
];

function statusColor(status: ServiceHealth['status']) {
  if (status === 'up')       return { text: 'text-[#4ae176]', label: 'UP'       };
  if (status === 'degraded') return { text: 'text-[#00bdfd]', label: 'DEGRADED' };
  return                            { text: 'text-[#ffb4ab]', label: 'DOWN'     };
}

function logColor(level: 'INFO' | 'WARN' | 'ERROR') {
  if (level === 'INFO')  return 'text-[#4ae176]';
  if (level === 'WARN')  return 'text-[#00bdfd]';
  return 'text-[#ffb4ab]';
}

export default function MobileStatus() {
  const { pathname } = useLocation();

  return (
    <div style={{ backgroundColor: '#0A0F1C' }} className="text-[#d7e2ff] min-h-screen font-sans flex">
      <main className="flex-1 flex flex-col pb-24">
        {/* TopAppBar (shown on both mobile and desktop-view of this page) */}
        <header className="bg-[#001231] border-b border-[#5a4136] flex justify-between items-center w-full px-6 py-4 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <span className="text-[24px] font-bold text-[#ff6600] tracking-tight">GalvanR.A.G</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[24px] font-bold text-[#ff6600] border-b-2 border-[#ff6600] hidden md:block">Status</span>
            <div className="w-8 h-8 rounded-full bg-[#133466] flex items-center justify-center border border-[#5a4136] text-[12px] font-bold text-[#e3bfb1] cursor-pointer hover:bg-[#133466]/50 transition-colors active:scale-95">UP</div>
          </div>
        </header>

        <div className="p-4 lg:p-6 max-w-5xl mx-auto w-full space-y-6 overflow-x-hidden">
          {/* Page header */}
          <div className="flex flex-col gap-1">
            <h1 className="text-[32px] font-bold leading-tight text-[#d7e2ff]">System Health</h1>
            <p className="text-[14px] text-[#e3bfb1] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#4ae176] inline-block" />
              Last updated: Just now
            </p>
          </div>

          {/* Service grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {services.map(svc => {
              const c = statusColor(svc.status);
              return (
                <div key={svc.name} className="bg-card border border-card rounded-lg p-4 flex flex-col items-center justify-center gap-2">
                  <span className={`material-symbols-outlined ${c.text} text-3xl mb-1`}>{svc.icon}</span>
                  <span className="text-[14px] font-bold">{svc.name}</span>
                  <span className={`text-[12px] font-bold ${c.text} bg-current/10 px-2 py-1 rounded`} style={{ color: c.text.replace('text-', '').replace('[', '').replace(']', '') }}>
                    <span className={c.text}>{c.label}</span>
                  </span>
                </div>
              );
            })}
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Queue depth */}
            <div className="bg-card border border-card rounded-lg p-6 flex flex-col gap-4">
              <h3 className="text-[20px] font-semibold text-[#d7e2ff] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#e3bfb1]">queue</span>
                Queue Depth
              </h3>
              <div className="flex-1 flex items-center justify-center">
                <div className="relative w-32 h-32 flex items-center justify-center rounded-full border-8 border-[#133466]">
                  <div className="text-center">
                    <span className="block text-[32px] font-bold text-[#4ae176]">0</span>
                    <span className="block text-[12px] font-bold text-[#e3bfb1]">DOCS</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ingestion Latency */}
            <div className="bg-card border border-card rounded-lg p-6 flex flex-col gap-4">
              <h3 className="text-[20px] font-semibold text-[#d7e2ff] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#e3bfb1]">speed</span>
                Ingestion Latency
              </h3>
              <div className="flex flex-col justify-center gap-3">
                {latencyData.map(l => (
                  <div key={l.label}>
                    <div className="flex justify-between mb-1">
                      <span className="text-[12px] font-bold text-[#e3bfb1]">{l.label}</span>
                      <span className={`text-[12px] font-bold ${l.isError ? 'text-[#ffb4ab]' : 'text-[#d7e2ff]'}`}>{l.text}</span>
                    </div>
                    <div className="w-full bg-[#2D3748] h-2 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${l.isError ? 'bg-[#ffb4ab]' : 'bg-[#ff6600]'}`} style={{ width: `${l.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Logs */}
          <div className="bg-card border border-card rounded-lg p-4 md:p-6 min-w-0 max-w-full">
            <h3 className="text-[20px] font-semibold text-[#d7e2ff] flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-[#e3bfb1]">list_alt</span>
              System Logs
            </h3>
            <div className="bg-[#0D1117] border border-card rounded p-4 font-mono text-[13px] overflow-x-auto w-full max-w-full">
              <pre className="text-[#e3bfb1] leading-relaxed whitespace-pre-wrap break-words">
                {logLines.map((l, i) => (
                  <span key={i} className="block mb-1">
                    <span className="text-[#e3bfb1]/60">{l.ts}</span>{' '}
                    <span className={logColor(l.level as 'INFO' | 'WARN' | 'ERROR')}>{l.level}:</span>{' '}{l.msg}
                  </span>
                ))}
              </pre>
            </div>
          </div>
        </div>

        {/* Mobile Bottom Nav */}
        <MobileBottomNav />
      </main>
    </div>
  );
}
