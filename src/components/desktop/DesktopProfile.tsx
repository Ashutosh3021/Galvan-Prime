import { Link } from 'react-router-dom';
import DesktopTopNav from '../shared/DesktopTopNav';

export default function DesktopProfile() {
  return (
    <div className="bg-[#0A0F1C] text-[#dee2f5] font-sans min-h-screen flex flex-col">
      <DesktopTopNav />
      <main className="flex-grow w-full max-w-[1440px] mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-[32px] font-semibold text-on-surface leading-tight tracking-[-0.01em]">Account Management</h1>
          <p className="text-[16px] text-on-surface-variant mt-2">Manage your identity and technical parameters within the GalvanR.A.G. ecosystem.</p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Primary User Info Card */}
          <div className="col-span-12 lg:col-span-4 bg-[#1A2338] border border-[#2D3748] p-8 rounded-xl flex flex-col items-center text-center transition-transform hover:-translate-y-1 hover:border-[#ff6600]/30 duration-300 shadow-sm">
            <div className="relative mb-6">
              <div className="w-32 h-32 rounded-full bg-[#ff6600] flex items-center justify-center border-4 border-[#0e1320] shadow-xl">
                <span className="text-[48px] text-[#581e00] font-black">JD</span>
              </div>
              <div className="absolute bottom-1 right-1 bg-[#00bdfd] w-8 h-8 rounded-full border-2 border-[#0e1320] flex items-center justify-center">
                <span className="material-symbols-outlined text-[#004964] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              </div>
            </div>
            <h2 className="text-[20px] font-semibold text-[#dee2f5]">John_Doe_Dev</h2>
            <p className="text-[#8bd5ff] text-[12px] font-semibold tracking-widest mt-1 uppercase">Lead Architect</p>
            <div className="w-full h-px bg-[#5a4136]/30 my-6" />
            <div className="w-full space-y-4 text-left">
              <div>
                <span className="text-[12px] font-semibold text-on-surface-variant block mb-1 uppercase tracking-widest">Email Address</span>
                <div className="flex items-center gap-2 text-[#dee2f5]">
                  <span className="material-symbols-outlined text-[18px] text-[#ffb596]">mail</span>
                  <span className="font-mono text-[14px]">john.doe@galvan-rag.ai</span>
                </div>
              </div>
              <div>
                <span className="text-[12px] font-semibold text-on-surface-variant block mb-1 uppercase tracking-widest">Organization</span>
                <div className="flex items-center gap-2 text-[#dee2f5]">
                  <span className="material-symbols-outlined text-[18px] text-[#ffb596]">corporate_fare</span>
                  <span className="text-[14px]">Galvanic Neural Systems</span>
                </div>
              </div>
            </div>
            <Link to="/settings" className="mt-8 w-full bg-[#ff6600] text-[#581e00] font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:brightness-110 transition-all active:scale-95 duration-100 ease-in-out shadow-lg shadow-[#ff6600]/10">
              <span className="material-symbols-outlined text-[20px]">edit</span>
              Edit Profile
            </Link>
          </div>

          {/* Bio and Metadata Section */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
            {/* Bio Card */}
            <div className="bg-[#1A2338] border border-[#2D3748] p-8 rounded-xl flex-1 transition-transform hover:-translate-y-1 hover:border-[#ff6600]/30 duration-300">
              <h3 className="text-[20px] font-semibold text-[#dee2f5] mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#ffb596]">fingerprint</span>
                Biography
              </h3>
              <p className="text-[#e3bfb1] text-[16px] leading-relaxed italic">
                "Specializing in Large Language Model optimization and retrieval-augmented architectures. Currently overseeing the integration of low-latency vector indexing for the GalvanR.A.G. kernel. Passionate about ethical AI and deterministic output pipelines."
              </p>
            </div>

            {/* Stats/Usage Bento */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#1A2338] border border-[#2D3748] p-6 rounded-xl flex flex-col transition-transform hover:-translate-y-1 hover:border-[#ff6600]/30 duration-300">
                <span className="text-[12px] font-semibold tracking-widest text-[#e3bfb1] mb-2 uppercase">Total Queries</span>
                <span className="text-[48px] font-bold text-[#8bd5ff] leading-none">4.2k</span>
                <div className="mt-auto h-1 w-full bg-[#303443] rounded-full overflow-hidden">
                  <div className="bg-[#8bd5ff] h-full" style={{ width: '75%' }} />
                </div>
              </div>
              <div className="bg-[#1A2338] border border-[#2D3748] p-6 rounded-xl flex flex-col transition-transform hover:-translate-y-1 hover:border-[#ff6600]/30 duration-300">
                <span className="text-[12px] font-semibold tracking-widest text-[#e3bfb1] mb-2 uppercase">Ingested Documents</span>
                <span className="text-[48px] font-bold text-[#ffb596] leading-none">842</span>
                <div className="mt-auto h-1 w-full bg-[#303443] rounded-full overflow-hidden">
                  <div className="bg-[#ffb596] h-full" style={{ width: '45%' }} />
                </div>
              </div>
              <div className="bg-[#1A2338] border border-[#2D3748] p-6 rounded-xl flex flex-col transition-transform hover:-translate-y-1 hover:border-[#ff6600]/30 duration-300">
                <span className="text-[12px] font-semibold tracking-widest text-[#e3bfb1] mb-2 uppercase">API Credits</span>
                <span className="text-[48px] font-bold text-[#bdc6e2] leading-none">98%</span>
                <div className="mt-auto h-1 w-full bg-[#303443] rounded-full overflow-hidden">
                  <div className="bg-[#bdc6e2] h-full" style={{ width: '98%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Technical Logs / Timeline */}
          <div className="col-span-12 bg-[#1A2338] border border-[#2D3748] rounded-xl overflow-hidden transition-transform hover:-translate-y-1 hover:border-[#ff6600]/30 duration-300">
            <div className="bg-[#252a38] px-8 py-4 flex justify-between items-center border-b border-[#5a4136]">
              <h3 className="text-[20px] font-semibold text-[#dee2f5] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#8bd5ff]">history</span>
                Recent Activity Logs
              </h3>
              <span className="text-[12px] font-semibold tracking-widest uppercase text-[#e3bfb1]">System Time: 2023-11-24 14:02 UTC</span>
            </div>
            <div className="p-8 font-mono text-[14px] bg-black/40">
              <div className="space-y-3">
                <div className="flex gap-4 border-l-2 border-[#8bd5ff] pl-4">
                  <span className="text-[#e3bfb1] shrink-0">14:02:11</span>
                  <span className="text-[#8bd5ff]">[SYS]</span>
                  <span className="text-[#dee2f5]">Successful authentication from IP 192.168.1.104</span>
                </div>
                <div className="flex gap-4 border-l-2 border-[#ffb596] pl-4">
                  <span className="text-[#e3bfb1] shrink-0">12:45:02</span>
                  <span className="text-[#ffb596]">[RAG]</span>
                  <span className="text-[#dee2f5]">Index updated: "kernel-v4-documentation" (152 nodes)</span>
                </div>
                <div className="flex gap-4 border-l-2 border-[#aa8a7d] pl-4 opacity-60">
                  <span className="text-[#e3bfb1] shrink-0">09:12:44</span>
                  <span className="text-[#5a4136]">[API]</span>
                  <span className="text-[#e3bfb1]">Token refresh issued for session_id: a7f82b</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Visual Identity */}
        <div className="mt-24 border-t border-[#5a4136]/30 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#ffb596]/20 rounded flex items-center justify-center border border-[#ffb596]/30">
              <span className="material-symbols-outlined text-[#ffb596]">shield_person</span>
            </div>
            <div>
              <p className="text-[12px] font-semibold tracking-widest uppercase text-[#dee2f5]">Access Level: Level 4 Admin</p>
              <p className="text-[14px] text-[#e3bfb1]">Encryption Standard: AES-256-GCM</p>
            </div>
          </div>
          <div className="flex gap-8">
            <a className="text-[12px] font-semibold tracking-widest uppercase text-[#e3bfb1] hover:text-[#8bd5ff] transition-colors" href="#">Privacy Policy</a>
            <a className="text-[12px] font-semibold tracking-widest uppercase text-[#e3bfb1] hover:text-[#8bd5ff] transition-colors" href="#">Security Terms</a>
            <a className="text-[12px] font-semibold tracking-widest uppercase text-[#e3bfb1] hover:text-[#8bd5ff] transition-colors" href="#">Audit Logs</a>
          </div>
        </div>
      </main>

      {/* Side Decoration (Atmospheric) */}
      <div className="fixed top-0 right-0 w-1/3 h-screen pointer-events-none z-[-1] opacity-10">
        <div className="absolute inset-0 bg-gradient-to-l from-[#ffb596]/20 to-transparent" />
        <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, #ff6600 0%, transparent 70%)' }} />
      </div>
    </div>
  );
}
