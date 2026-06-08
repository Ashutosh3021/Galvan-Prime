import { Link } from 'react-router-dom';
import MobileBottomNav from '../shared/MobileBottomNav';

export default function MobileProfile() {
  return (
    <div className="bg-[#001231] text-[#d7e2ff] antialiased flex flex-col h-screen overflow-hidden font-sans">
      <main className="flex-1 overflow-y-auto pb-20">
        {/* Mobile Header */}
        <header className="bg-[#001231] border-b border-[#5a4136] flex justify-between items-center w-full px-6 py-4 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <h1 className="text-[24px] font-bold text-[#ff6600]">Profile</h1>
          </div>
          <Link to="/login" className="w-8 h-8 rounded-full border border-[#5a4136] flex items-center justify-center text-[#e3bfb1] hover:text-white hover:bg-[#133466]/30 transition-colors">
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </Link>
        </header>

        <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-4">
          {/* Main Profile Identity Card */}
          <div className="bg-[#001e48] border border-[#5a4136] rounded-xl p-6 flex flex-col items-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#ffb596]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="w-32 h-32 rounded-full bg-[#ffb596] overflow-hidden border-4 border-[#001231] shrink-0 shadow-[0_0_15px_rgba(0,0,0,0.5)] z-10 flex items-center justify-center">
              <span className="text-[48px] text-[#581e00] font-black">JD</span>
            </div>
            <div className="text-center z-10 mt-4">
              <h2 className="text-[32px] font-bold tracking-[-0.02em] text-[#d7e2ff]">Admin User</h2>
              <p className="text-[16px] text-[#e3bfb1] mb-3">admin.user@galvanrag.io</p>
              <div className="flex flex-wrap gap-2 justify-center mb-6">
                <span className="inline-flex items-center px-3 py-1 rounded-md bg-[#8bd5ff]/10 border border-[#8bd5ff]/20 text-[#8bd5ff] font-mono text-[13px]">
                  <span className="material-symbols-outlined text-[16px] mr-1">admin_panel_settings</span>
                  System Architect
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-md bg-[#4ae176]/10 border border-[#4ae176]/20 text-[#4ae176] font-mono text-[13px]">
                  <span className="w-2 h-2 rounded-full bg-[#4ae176] mr-2" />
                  Active
                </span>
              </div>
              <div className="pt-4 border-t border-[#5a4136] w-full flex justify-center">
                <button className="bg-[#ff6600] text-white px-6 py-2.5 rounded-lg text-[12px] font-bold tracking-[0.05em] hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg shadow-[#ff6600]/20">
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                  EDIT PROFILE
                </button>
              </div>
            </div>
          </div>

          {/* Quick Stats Cards */}
          <div className="flex flex-col gap-4">
            <div className="bg-[#001e48] border border-[#5a4136] rounded-xl p-4 flex flex-col justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#ffb596]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="flex justify-between items-start mb-2">
                <p className="text-[12px] font-bold tracking-[0.05em] text-[#e3bfb1] uppercase">Total Queries Executed</p>
                <span className="material-symbols-outlined text-[#e3bfb1]/50">database</span>
              </div>
              <p className="text-[32px] font-bold text-[#ffb596] tracking-[-0.02em]">124,592</p>
              <p className="font-mono text-[13px] text-[#8bd5ff] mt-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">trending_up</span> +12% this week
              </p>
            </div>
            <div className="bg-[#001e48] border border-[#5a4136] rounded-xl p-4 flex flex-col justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#8bd5ff]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="flex justify-between items-start mb-2">
                <p className="text-[12px] font-bold tracking-[0.05em] text-[#e3bfb1] uppercase">Data Ingested Volume</p>
                <span className="material-symbols-outlined text-[#e3bfb1]/50">memory</span>
              </div>
              <p className="text-[32px] font-bold text-[#d7e2ff] tracking-[-0.02em]">4.8 TB</p>
              <p className="font-mono text-[13px] text-[#e3bfb1] mt-1">Across 3 vector stores</p>
            </div>
          </div>

          {/* Biography Section */}
          <div className="bg-[#001e48] border border-[#5a4136] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4 border-b border-[#5a4136] pb-3">
              <span className="material-symbols-outlined text-[#ffb596]">description</span>
              <h3 className="text-[20px] font-semibold text-[#d7e2ff]">Biography & Scope</h3>
            </div>
            <div className="text-[14px] text-[#e3bfb1] leading-relaxed space-y-4">
              <p>
                Lead System Architect overseeing the core deployment of GalvanR.A.G. infrastructure. Responsible for maintaining the high-throughput vector database clusters, optimizing semantic search pipelines, and ensuring sub-100ms retrieval latency across all tenant indexes.
              </p>
              <p>
                Focus areas include fine-tuning embedding models for domain-specific terminology, implementing robust chunking strategies for varied document formats, and establishing rigorous evaluation protocols using RAGAS metrics to prevent hallucination degradation.
              </p>
            </div>
          </div>

          {/* Technical Details / Metadata */}
          <div className="bg-[#001e48] border border-[#5a4136] rounded-xl p-0 overflow-hidden mb-8">
            <table className="w-full text-left border-collapse">
              <tbody>
                <tr className="border-b border-[#5a4136] bg-[#001231]/30">
                  <th className="py-3 px-4 text-[12px] font-bold tracking-[0.05em] text-[#e3bfb1] uppercase w-1/3">Account Created</th>
                  <td className="py-3 px-4 font-mono text-[13px] text-[#d7e2ff]">2023-10-14T08:30:00Z</td>
                </tr>
                <tr className="border-b border-[#5a4136]">
                  <th className="py-3 px-4 text-[12px] font-bold tracking-[0.05em] text-[#e3bfb1] uppercase">Last Login</th>
                  <td className="py-3 px-4 font-mono text-[13px] text-[#d7e2ff]">2023-11-02T14:15:22Z<br/>(IP: 192.168.1.104)</td>
                </tr>
                <tr>
                  <th className="py-3 px-4 text-[12px] font-bold tracking-[0.05em] text-[#e3bfb1] uppercase">API Key Status</th>
                  <td className="py-3 px-4 font-mono text-[13px] text-[#4ae176] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4ae176]" /> Active (sk_live_...)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
}
