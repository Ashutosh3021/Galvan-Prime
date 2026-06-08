import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function MobileSignup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [loading, setLoading] = useState(false);
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
    <div className="bg-[#001231] text-[#d7e2ff] min-h-screen flex flex-col font-sans">
      <main className="flex-grow flex items-center justify-center p-6 relative overflow-hidden">
        {/* Subtle Background Decorative Elements */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-1/4 -right-1/4 w-[400px] h-[400px] bg-[#ffb596] rounded-full mix-blend-screen filter blur-[100px]" />
          <div className="absolute bottom-1/4 -left-1/4 w-[500px] h-[500px] bg-[#8bd5ff] rounded-full mix-blend-screen filter blur-[120px]" />
        </div>

        {/* Signup Card */}
        <div className="bg-[#001e48] border border-[#5a4136] rounded-xl p-8 w-full max-w-md shadow-2xl relative z-10">
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="text-[32px] font-bold leading-[40px] tracking-[-0.02em] text-[#d7e2ff] mb-2">Sign Up</h1>
            <p className="text-[14px] text-[#e3bfb1]">Create your GalvanR.A.G. operator credentials</p>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Username Field */}
            <div>
              <label className="block text-[12px] font-bold tracking-[0.05em] text-[#e3bfb1] uppercase mb-1" htmlFor="username">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#e3bfb1]">
                  <span className="material-symbols-outlined text-[18px]">person</span>
                </div>
                <input
                  id="username"
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="operator_name"
                  className="block w-full pl-[36px] pr-4 py-2 bg-[#001231] border border-[#5a4136] rounded text-[#d7e2ff] text-[14px] focus:outline-none focus:ring-1 focus:ring-[#ffb596] focus:border-[#ffb596] placeholder-[#e3bfb1]/50 transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-[12px] font-bold tracking-[0.05em] text-[#e3bfb1] uppercase mb-1" htmlFor="email">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#e3bfb1]">
                  <span className="material-symbols-outlined text-[18px]">alternate_email</span>
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@galvan.ai"
                  className="block w-full pl-[36px] pr-4 py-2 bg-[#001231] border border-[#5a4136] rounded text-[#d7e2ff] text-[14px] focus:outline-none focus:ring-1 focus:ring-[#ffb596] focus:border-[#ffb596] placeholder-[#e3bfb1]/50 transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-[12px] font-bold tracking-[0.05em] text-[#e3bfb1] uppercase mb-1" htmlFor="password">Security Key</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#e3bfb1]">
                  <span className="material-symbols-outlined text-[18px]">lock</span>
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-[36px] pr-4 py-2 bg-[#001231] border border-[#5a4136] rounded text-[#d7e2ff] text-[14px] focus:outline-none focus:ring-1 focus:ring-[#ffb596] focus:border-[#ffb596] placeholder-[#e3bfb1]/50 transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-[12px] font-bold tracking-[0.05em] text-[#e3bfb1] uppercase mb-1" htmlFor="confirmPassword">Confirm Security Key</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#e3bfb1]">
                  <span className="material-symbols-outlined text-[18px]">verified_user</span>
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={handleConfirmChange}
                  placeholder="••••••••"
                  className={`block w-full pl-[36px] pr-4 py-2 bg-[#001231] border ${passwordError ? 'border-[#ffb4ab] ring-1 ring-[#ffb4ab]' : 'border-[#5a4136]'} rounded text-[#d7e2ff] text-[14px] focus:outline-none focus:ring-1 focus:ring-[#ffb596] focus:border-[#ffb596] placeholder-[#e3bfb1]/50 transition-all shadow-inner`}
                />
              </div>
              {passwordError && (
                <p className="text-[#ffb4ab] text-[12px] mt-1">Credentials must match.</p>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2 pt-2">
              <input id="terms" type="checkbox" required className="mt-1 bg-[#001231] border-[#5a4136] rounded text-[#ff6600] focus:ring-[#ff6600]" />
              <label className="text-[12px] text-[#e3bfb1]" htmlFor="terms">
                I agree to the <a href="#" className="text-[#8bd5ff] hover:underline">Neural Protocols</a> and data processing consent.
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-[20px] font-bold text-[#561d00] bg-[#ff6600] hover:bg-[#ffb596] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ffb596] focus:ring-offset-[#001231]"
              >
                {loading ? 'Establishing Link...' : 'Sign Up'}
              </button>
            </div>
          </form>

          {/* Footer Link */}
          <div className="mt-6 text-center border-t border-[#5a4136]/30 pt-4">
            <p className="text-[14px] text-[#e3bfb1]">
              Already have an account?{' '}
              <Link to="/login" className="text-[#ffb596] hover:text-[#ffdbcd] font-semibold transition-colors">Sign In</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
