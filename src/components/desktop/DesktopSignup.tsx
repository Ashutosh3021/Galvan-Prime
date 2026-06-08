import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DesktopTopNav from '../shared/DesktopTopNav';

export default function DesktopSignup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const navigate = useNavigate();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setPasswordError(true);
      return;
    }
    setPasswordError(false);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      navigate('/profile');
    }, 2000);
  }

  function handleConfirmChange(e: React.ChangeEvent<HTMLInputElement>) {
    setConfirmPassword(e.target.value);
    if (e.target.value === password) {
      setPasswordError(false);
    }
  }

  return (
    <div className="font-sans text-[16px] min-h-screen flex flex-col bg-[#0A0F1C] text-[#dee2f5]">
      <DesktopTopNav />
      
      <main className="flex-grow flex items-center justify-center pt-24 pb-12 px-8 relative overflow-hidden">
        {/* Atmospheric Background Element */}
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-primary-container/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-secondary-container/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="bg-[#1A2338] border border-[#252F4A] w-full max-w-md rounded-xl p-8 relative z-10 transition-transform duration-300 hover:-translate-y-0.5 hover:border-[#ff6600]/20">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-primary-container rounded-lg flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(255,102,0,0.3)]">
              <span className="material-symbols-outlined text-[#360f00] icon-fill">rocket_launch</span>
            </div>
            <h1 className="text-[32px] font-semibold text-on-surface text-center mb-2">Initialize Instance</h1>
            <p className="text-[14px] text-on-surface-variant text-center">Create your GalvanR.A.G. operator credentials.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-widest" htmlFor="username">Username</label>
              <div className="relative group/input">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within/input:text-primary transition-colors text-[20px]">person</span>
                <input
                  id="username"
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="operator_name"
                  className="w-full bg-[#0e1320] border border-outline-variant rounded-lg py-2.5 pl-10 pr-4 text-on-surface focus:border-primary-container outline-none transition-all focus:ring-1 focus:ring-primary-container"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-widest" htmlFor="email">Email Address</label>
              <div className="relative group/input">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within/input:text-primary transition-colors text-[20px]">alternate_email</span>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@galvan.ai"
                  className="w-full bg-[#0e1320] border border-outline-variant rounded-lg py-2.5 pl-10 pr-4 text-on-surface focus:border-primary-container outline-none transition-all focus:ring-1 focus:ring-primary-container"
                />
              </div>
            </div>

            {/* Password Row */}
            <div className="grid grid-cols-1 gap-5">
              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-widest" htmlFor="password">Security Key</label>
                <div className="relative group/input">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within/input:text-primary transition-colors text-[20px]">lock</span>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#0e1320] border border-outline-variant rounded-lg py-2.5 pl-10 pr-4 text-on-surface focus:border-primary-container outline-none transition-all focus:ring-1 focus:ring-primary-container"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-widest" htmlFor="confirmPassword">Confirm Security Key</label>
                <div className="relative group/input">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within/input:text-primary transition-colors text-[20px]">verified_user</span>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={handleConfirmChange}
                    placeholder="••••••••"
                    className={`w-full bg-[#0e1320] border ${passwordError ? 'border-error ring-1 ring-error' : 'border-outline-variant'} rounded-lg py-2.5 pl-10 pr-4 text-on-surface focus:border-primary-container outline-none transition-all ${!passwordError && 'focus:ring-1 focus:ring-primary-container'}`}
                  />
                </div>
                {passwordError && (
                  <p className="text-[#ffb4ab] text-[14px] mt-1">Credentials must match for secure handshake.</p>
                )}
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3 py-2">
              <input id="terms" type="checkbox" required className="mt-1 w-4 h-4 bg-[#0e1320] border-outline-variant rounded text-primary-container focus:ring-offset-[#0e1320] focus:ring-primary-container" />
              <label className="text-[14px] text-on-surface-variant" htmlFor="terms">
                I agree to the <a href="#" className="text-secondary hover:underline">Neural Protocols</a> and data processing consent.
              </label>
            </div>

            {/* Primary Action */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-container text-[#360f00] py-3.5 rounded-lg text-[20px] font-bold transition-all hover:brightness-110 active:scale-[0.98] shadow-[0_4px_12px_rgba(255,102,0,0.25)] flex justify-center items-center"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <svg className="animate-spin h-5 w-5 text-[#360f00]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Establishing Link...
                </div>
              ) : (
                'Sign Up'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-outline-variant text-center">
            <p className="text-[14px] text-on-surface-variant">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-bold hover:underline ml-1">Sign In</Link>
            </p>
          </div>
        </div>
      </main>

      {/* Visual Footer Accent */}
      <footer className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-30" />
    </div>
  );
}
