import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DesktopTopNav from '../shared/DesktopTopNav';

export default function DesktopLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (email && password) {
      // Simulate login
      navigate('/profile');
    }
  }

  return (
    <div className="bg-[#0e1320] text-[#dee2f5] antialiased min-h-screen flex flex-col relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255, 102, 0, 0.05) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      
      <DesktopTopNav />

      <main className="flex-grow flex items-center justify-center px-4 pt-16 relative z-10">
        <div className="w-full max-w-[440px] relative mx-auto group perspective-1000">
          {/* Decorative Accent */}
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-primary-container/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-secondary-container/10 rounded-full blur-3xl pointer-events-none" />
          
          {/* Auth Card */}
          <div className="bg-surface-container border border-outline-variant p-8 md:p-10 rounded-xl relative z-10 shadow-[0_0_40px_-10px_rgba(255,102,0,0.15)] overflow-hidden transition-transform duration-500 hover:scale-[1.01] hover:-rotate-1">
            {/* Progress Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-1 w-8 bg-primary-container rounded-full" />
                <span className="text-[12px] font-semibold tracking-[0.05em] text-primary">SECURE AUTHENTICATION</span>
              </div>
              <h1 className="text-[32px] font-semibold leading-tight text-on-surface mb-2">Welcome Back</h1>
              <p className="text-[14px] text-on-surface-variant">Access your RAG pipelines and vector datasets.</p>
            </div>

            {/* Sign In Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant ml-1" htmlFor="identity">Email or Username</label>
                <div className="relative group/input">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within/input:text-primary transition-colors text-[20px]">person</span>
                  <input
                    id="identity"
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@galvan.ai"
                    className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface text-[16px] pl-10 pr-4 py-3 rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant" htmlFor="password">Password</label>
                  <a className="text-[12px] font-semibold tracking-[0.05em] text-secondary hover:underline" href="#">Forgot Password?</a>
                </div>
                <div className="relative group/input">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within/input:text-primary transition-colors text-[20px]">lock</span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface text-[16px] pl-10 pr-12 py-3 rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors focus:outline-none"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 px-1">
                <input id="remember" type="checkbox" className="w-4 h-4 rounded border-outline-variant bg-surface-container-lowest text-primary focus:ring-primary focus:ring-offset-surface-container" />
                <label className="text-[14px] text-on-surface-variant cursor-pointer select-none" htmlFor="remember">Remember this device for 30 days</label>
              </div>

              <button
                type="submit"
                className="w-full bg-primary-container text-on-primary font-bold py-4 rounded hover:brightness-110 active:scale-[0.98] transition-all flex justify-center items-center gap-2 group/btn"
              >
                <span className="text-[12px] font-semibold tracking-[0.05em] uppercase">Sign In</span>
                <span className="material-symbols-outlined group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            </form>

            {/* Footer Links */}
            <div className="mt-8 pt-8 border-t border-outline-variant/30 text-center">
              <p className="text-[14px] text-on-surface-variant">
                Don't have an account?{' '}
                <Link to="/signup" className="text-primary font-bold hover:underline ml-1">Sign Up</Link>
              </p>
            </div>
          </div>

          {/* Footer Meta */}
          <div className="mt-8 flex justify-between items-center px-2 opacity-50 relative z-10">
            <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-tighter text-on-surface-variant">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#4ae176] animate-pulse" />
                API ONLINE
              </div>
              <span>v1.0.4-STABLE</span>
            </div>
            <div className="flex gap-4">
              <span className="material-symbols-outlined text-[16px] cursor-help" title="Encrypted Connection">shield</span>
              <span className="material-symbols-outlined text-[16px] cursor-help" title="System Logs">terminal</span>
            </div>
          </div>
        </div>
      </main>

      {/* Side Image Decoration */}
      <div className="fixed right-0 top-0 h-full w-1/4 hidden xl:block pointer-events-none opacity-20">
        <div className="h-full w-full flex items-center justify-end pr-12">
          <div className="grid grid-cols-2 gap-4">
            <div className="h-40 w-40 rounded-xl border border-outline-variant/20 bg-surface-container-high transform rotate-12" />
            <div className="h-40 w-40 rounded-xl border border-outline-variant/20 bg-surface-container transform -rotate-12 mt-12" />
            <div className="h-40 w-40 rounded-xl border border-outline-variant/20 bg-surface-container-low transform rotate-6" />
            <div className="h-40 w-40 rounded-xl border border-outline-variant/20 bg-primary-container/10 transform -rotate-3 mt-6" />
          </div>
        </div>
      </div>
    </div>
  );
}
