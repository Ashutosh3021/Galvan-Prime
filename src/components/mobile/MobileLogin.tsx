import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function MobileLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (email && password) {
      // Simulate login
      navigate('/profile');
    }
  }

  return (
    <div className="bg-[#001231] text-[#d7e2ff] min-h-screen flex flex-col font-sans">
      <main className="flex-grow flex items-center justify-center p-6 relative overflow-hidden">
        {/* Subtle Background Decorative Elements */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#ffb596] rounded-full mix-blend-screen filter blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#8bd5ff] rounded-full mix-blend-screen filter blur-[120px]" />
        </div>

        {/* Login Card */}
        <div className="bg-[#001e48] border border-[#5a4136] rounded-xl p-8 w-full max-w-md shadow-2xl relative z-10">
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="text-[32px] font-bold leading-[40px] tracking-[-0.02em] text-[#d7e2ff] mb-2">Sign In</h1>
            <p className="text-[14px] text-[#e3bfb1]">Access your GalvanR.A.G. workspace</p>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label className="block text-[12px] font-bold tracking-[0.05em] text-[#e3bfb1] uppercase mb-1" htmlFor="email">Email or Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#e3bfb1]">
                  <span className="material-symbols-outlined text-[18px]">mail</span>
                </div>
                <input
                  id="email"
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@galvan.rag"
                  className="block w-full pl-[36px] pr-4 py-2 bg-[#001231] border border-[#5a4136] rounded text-[#d7e2ff] text-[14px] focus:outline-none focus:ring-1 focus:ring-[#ffb596] focus:border-[#ffb596] placeholder-[#e3bfb1]/50 transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[12px] font-bold tracking-[0.05em] text-[#e3bfb1] uppercase" htmlFor="password">Password</label>
                <a className="text-[14px] text-[#8bd5ff] hover:text-[#ffb596] transition-colors text-xs" href="#">Forgot Password?</a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#e3bfb1]">
                  <span className="material-symbols-outlined text-[18px]">lock</span>
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-[36px] pr-4 py-2 bg-[#001231] border border-[#5a4136] rounded text-[#d7e2ff] text-[14px] focus:outline-none focus:ring-1 focus:ring-[#ffb596] focus:border-[#ffb596] placeholder-[#e3bfb1]/50 transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-xl shadow-sm text-[20px] font-bold text-[#561d00] bg-[#ff6600] hover:bg-[#ffb596] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ffb596] focus:ring-offset-[#001231]"
              >
                Sign In
              </button>
            </div>
          </form>

          {/* Footer Link */}
          <div className="mt-6 text-center border-t border-[#5a4136]/30 pt-4">
            <p className="text-[14px] text-[#e3bfb1]">
              Don't have an account?{' '}
              <Link to="/signup" className="text-[#ffb596] hover:text-[#ffdbcd] font-semibold transition-colors">Sign Up</Link>
            </p>
          </div>

          {/* Technical Flair / Environment Indicator */}
          <div className="mt-8 flex justify-center items-center gap-2 opacity-50">
            <span className="inline-flex h-2 w-2 rounded-full bg-[#4ae176]" />
            <span className="font-mono text-[13px] text-[#e3bfb1]">System: ONLINE • v2.4.1</span>
          </div>
        </div>
      </main>
    </div>
  );
}
