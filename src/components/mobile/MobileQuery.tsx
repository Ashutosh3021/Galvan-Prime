import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import MobileBottomNav from '../shared/MobileBottomNav';
import type { ChatMessage } from '../../types';

const initialMessages: ChatMessage[] = [
  {
    id: 'welcome',
    role: 'bot',
    content: 'Hello. I am connected to the core knowledge base. How can I assist with your data queries today?',
    timestamp: '',
  },
  {
    id: 'q1',
    role: 'user',
    content: 'Summarize the latency issues reported in the Q3 network infrastructure audit.',
    timestamp: '',
  },
  {
    id: 'a1',
    role: 'bot',
    content: 'Based on the Q3 Network Infrastructure Audit, latency issues were primarily concentrated in the US-East region during peak load times (14:00 - 16:00 UTC). The root cause was identified as a misconfiguration in the BGP routing tables for edge nodes, causing traffic to be unnecessarily routed through legacy switch clusters before reaching the main backbone.',
    citations: [
      { filename: 'q3_audit_report_final.pdf (p. 14)', reference: '', icon: 'description' },
      { filename: 'incident_log_sept.json', reference: '', icon: 'code' },
    ],
    timestamp: '',
  },
];

export default function MobileQuery() {
  const { pathname } = useLocation();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  function handleSubmit() {
    if (!inputValue.trim() || isLoading) return;
    const userMsg: ChatMessage = {
      id: Date.now().toString(), role: 'user',
      content: inputValue.trim(), timestamp: '',
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), role: 'bot',
        content: 'Based on the retrieved context, I found relevant information in your knowledge base...',
        timestamp: '',
      }]);
      setIsLoading(false);
    }, 2000);
  }

  return (
    <div className="bg-[#001231] text-[#d7e2ff] font-sans min-h-screen flex">
      <main className="flex-1 flex flex-col h-screen">
        {/* Mobile top bar */}
        <header className="bg-[#001231] border-b border-[#5a4136] w-full px-6 py-4 flex justify-between items-center z-30 sticky top-0">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#ffb596]">terminal</span>
            <h1 className="text-[24px] font-bold text-[#ff6600] tracking-tight">GalvanR.A.G</h1>
          </div>
          <div className="h-8 w-8 rounded-full bg-[#133466] flex items-center justify-center border border-[#5a4136]">
            <span className="material-symbols-outlined text-[#e3bfb1]" style={{ fontSize: '20px' }}>person</span>
          </div>
        </header>



        {/* Chat area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 flex flex-col gap-6 bg-[#001231]">
          {/* Context indicator */}
          <div className="flex justify-center mb-2">
            <div className="bg-[#001a40] border border-[#5a4136] rounded-full px-4 py-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4ae176]" style={{ fontSize: '16px' }}>check_circle</span>
              <span className="text-[12px] font-semibold tracking-[0.05em] text-[#e3bfb1]">RAG Pipeline Ready. Connected to Vector DB: PROD-EU-1</span>
            </div>
          </div>

          {/* Messages */}
          {messages.map(m => (
            <div key={m.id} className={`flex gap-4 w-full max-w-4xl ${m.role === 'user' ? 'self-end flex-row-reverse' : ''}`}>
              <div className={`flex-shrink-0 w-8 h-8 rounded${m.role === 'bot' ? '' : '-full'} flex items-center justify-center border border-[#2D3748] ${m.role === 'bot' ? 'bg-[#133466]' : 'bg-[#02285b]'}`}>
                <span className="material-symbols-outlined text-[#ff6600]" style={{ fontSize: '18px' }}>
                  {m.role === 'bot' ? 'smart_toy' : 'person'}
                </span>
              </div>
              <div className={`rounded-lg p-4 max-w-[85%] border ${
                m.role === 'bot' ? 'bg-[#1A2338] border-[#2D3748] text-[#d7e2ff]' : 'bg-[#001e48] border-[#5a4136] text-[#d7e2ff]'
              }`}>
                {m.role === 'bot' && m.citations && (
                  <div className="flex items-center gap-2 mb-2 text-[12px] font-semibold text-[#e3bfb1]">
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>database</span>
                    Retrieved 3 chunks in 142ms
                  </div>
                )}
                <p className="text-[14px] leading-relaxed">{m.content}</p>
                {m.citations && (
                  <div className="mt-3 border-t border-[#2D3748] pt-3">
                    <h4 className="text-[12px] font-semibold text-[#e3bfb1] mb-2">Sources:</h4>
                    <div className="flex flex-wrap gap-2">
                      {m.citations.map(c => (
                        <span key={c.filename} className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-[#00BFFF]/30 bg-[#00BFFF]/10 text-[#00BFFF] font-mono text-[11px] cursor-pointer hover:bg-[#00BFFF]/20 transition-colors">
                          <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>{c.icon}</span>
                          {c.filename}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-4 w-full max-w-4xl">
              <div className="flex-shrink-0 w-8 h-8 rounded bg-[#133466] flex items-center justify-center border border-[#2D3748]">
                <span className="material-symbols-outlined text-[#ff6600] animate-spin" style={{ fontSize: '18px' }}>sync</span>
              </div>
              <div className="bg-[#1A2338] border border-[#2D3748] rounded-lg p-4 text-[#d7e2ff] max-w-[85%] flex items-center gap-2">
                {[0, 150, 300].map(d => (
                  <span key={d} className="h-2 w-2 bg-[#e3bfb1] rounded-full animate-pulse" style={{ animationDelay: `${d}ms` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 lg:p-6 border-t border-[#5a4136] bg-[#001231] pb-20">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-2 text-[12px] font-semibold text-[#e3bfb1]">
              <span>Session: #QY-8921</span>
              <span className="text-[#4ae176]">Online</span>
            </div>
            <div className="relative flex items-end gap-2 bg-[#0A0F1C] border border-[#2D3748] rounded-lg p-1 focus-within:border-[#ff6600] focus-within:shadow-[0_0_0_1px_#ff6600] transition-all">
              <div className="flex-1">
                <textarea
                  rows={1}
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                  placeholder="Enter query..."
                  className="w-full bg-transparent border-none text-[#d7e2ff] text-[14px] focus:ring-0 resize-none py-2 px-2 max-h-[150px] scrollbar-hide"
                />
              </div>
              <div className="flex items-center gap-1 px-1 pb-1">
                <button className="p-2 text-[#e3bfb1] hover:text-[#d7e2ff] transition-colors" title="Adjust Parameters">
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>tune</span>
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-[#ff6600] text-white px-4 py-2 rounded-lg flex items-center gap-1 text-[12px] font-semibold hover:bg-[#ff6600]/90 transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ASK <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>send</span>
                </button>
              </div>
            </div>
            <div className="mt-1 text-center text-[10px] font-mono text-[#e3bfb1]/50">
              Press Enter to send, Shift+Enter for new line. Verify citations.
            </div>
          </div>
        </div>
        <MobileBottomNav />
      </main>
    </div>
  );
}
