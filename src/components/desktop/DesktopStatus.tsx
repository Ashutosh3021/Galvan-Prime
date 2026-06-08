import { Link } from 'react-router-dom';
import type { ServiceHealth } from '../../types';

import DesktopTopNav from '../shared/DesktopTopNav';

const services: ServiceHealth[] = [
  { name: 'PostgreSQL', status: 'up',       icon: 'database'   },
  { name: 'ChromaDB',   status: 'up',       icon: 'dns'        },
  { name: 'Pinecone',   status: 'degraded', icon: 'memory'     },
  { name: 'LLM Gemini', status: 'up',       icon: 'psychology' },
  { name: 'Redis',      status: 'down',     icon: 'storage'    },
];

const latencyBars = [20, 35, 15, 60, 40, 80, 25];

const logLines: Array<{ ts: string; level: 'INFO' | 'WARN' | 'ERROR'; msg: string }> = [
  { ts: '[2023-10-27T14:32:01Z]', level: 'INFO',  msg: 'Main - Starting ingestion pipeline for batch ID: 89a2b...' },
  { ts: '[2023-10-27T14:32:05Z]', level: 'INFO',  msg: 'ChromaDB - Vectors embedded successfully. Count: 1024' },
  { ts: '[2023-10-27T14:32:12Z]', level: 'WARN',  msg: 'Pinecone - Response latency spiked to 450ms during index update.' },
  { ts: '[2023-10-27T14:32:18Z]', level: 'ERROR', msg: 'Redis - Connection refused. Attempting to reconnect (1/3)...' },
  { ts: '[2023-10-27T14:32:20Z]', level: 'INFO',  msg: 'PostgreSQL - Audit log updated for batch ID: 89a2b...' },
];

function serviceColor(status: ServiceHealth['status']) {
  if (status === 'up')       return { text: 'text-green-500', bar: 'bg-green-500', width: 'w-full' };
  if (status === 'degraded') return { text: 'text-yellow-400', bar: 'bg-yellow-400', width: 'w-3/4' };
  return                            { text: 'text-error',      bar: 'bg-error',      width: 'w-0'   };
}

function logColor(level: 'INFO' | 'WARN' | 'ERROR') {
  if (level === 'INFO')  return 'text-green-400';
  if (level === 'WARN')  return 'text-yellow-400';
  return 'text-error';
}

export default function DesktopStatus() {
  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      <DesktopTopNav />
      <main className="flex-grow w-full max-w-[1440px] mx-auto px-[16px] md:px-[32px] py-8 md:py-12 flex flex-col gap-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-surface-container-high pb-4">
          <div>
            <h1 className="text-[24px] md:text-[32px] font-semibold leading-tight text-on-surface">System Health</h1>
            <p className="text-[14px] text-on-surface-variant mt-2">Monitoring critical services and ingestion pipelines.</p>
          </div>
          <div className="text-[14px] text-on-surface-variant flex items-center gap-2">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>schedule</span>
            Last updated: Just now
          </div>
        </header>

        {/* Service cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {services.map(svc => {
            const c = serviceColor(svc.status);
            return (
              <div key={svc.name} className={`bg-surface-container border ${svc.status === 'down' ? 'border-error/50' : 'border-surface-container-highest'} rounded-lg p-4 flex flex-col gap-3`}>
                <div className="flex justify-between items-center">
                  <span className="text-[14px] text-on-surface-variant">{svc.name}</span>
                  <span className={`material-symbols-outlined ${c.text}`}>
                    {svc.status === 'up' ? 'check_circle' : svc.status === 'degraded' ? 'warning' : 'error'}
                  </span>
                </div>
                <div className={`text-[20px] font-semibold ${c.text}`}>
                  {svc.status.charAt(0).toUpperCase() + svc.status.slice(1)}
                </div>
                <div className="w-full bg-surface-container-lowest h-1 rounded-full overflow-hidden">
                  <div className={`${c.bar} h-full ${c.width}`} />
                </div>
              </div>
            );
          })}
        </section>

        {/* Metrics */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Queue depth */}
          <div className="bg-surface-container border border-surface-container-highest rounded-lg p-6 flex flex-col items-center justify-center gap-4">
            <h3 className="text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant self-start">Queue Depth</h3>
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#090e1b" strokeWidth="10" />
                <circle cx="50" cy="50" r="45" fill="none" stroke="#00bdfd" strokeDasharray="282.7" strokeDashoffset="282.7" strokeWidth="10" className="transition-all duration-1000" />
              </svg>
              <div className="absolute text-[32px] font-semibold text-secondary-container">0</div>
            </div>
            <p className="text-[14px] text-on-surface-variant">Items waiting</p>
          </div>

          {/* Ingestion Latency Bar Chart */}
          <div className="bg-surface-container border border-surface-container-highest rounded-lg p-6 flex flex-col gap-4 lg:col-span-2">
            <h3 className="text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant">Ingestion Latency (ms)</h3>
            <div className="flex-grow flex items-end justify-between gap-2 h-32 pt-4">
              {latencyBars.map((h, i) => (
                <div key={i} className="w-full rounded-t group relative" style={{ height: `${h}%`, backgroundColor: i === latencyBars.length - 1 ? '#00bdfd' : 'rgba(0,189,253,0.2)' }}>
                  {i === latencyBars.length - 1 && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-container-lowest text-on-surface text-[12px] px-2 py-1 rounded">12ms</div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant border-t border-surface-container-lowest pt-2">
              <span>-1h</span><span>Now</span>
            </div>
          </div>
        </section>

        {/* Logs */}
        <section className="bg-[#05070A] border border-surface-container-high rounded-lg overflow-hidden flex flex-col">
          <div className="bg-surface-container-low px-4 py-3 border-b border-surface-container-high flex justify-between items-center">
            <h3 className="text-[12px] font-semibold tracking-[0.05em] text-on-surface flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Live Logs
            </h3>
            <button className="text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>open_in_full</span>
            </button>
          </div>
          <div className="p-4 font-mono text-[14px] leading-relaxed text-tertiary-container overflow-x-auto">
            {logLines.map((l, i) => (
              <div key={i} className="whitespace-nowrap">
                <span className="text-on-surface-variant">{l.ts}</span>{' '}
                <span className={logColor(l.level)}>{l.level}</span>{'  '}{l.msg}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
