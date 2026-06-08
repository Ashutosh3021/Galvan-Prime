// src/components/mobile/MobileLogin.tsx
import { Link } from 'react-router-dom';
import { useLoginForm } from '../../hooks/useLoginForm';

export default function MobileLogin() {
  const { state, setField, toggleShowPassword, handleSubmit } = useLoginForm();
  const { email, password, showPassword, isSubmitting, error } = state;

  return (
    <div className="bg-[#001231] text-[#d7e2ff] min-h-screen flex flex-col font-sans">
      <main
        id="main-content"
        className="flex-grow flex items-center justify-center p-6 relative overflow-hidden"
      >
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none opacity-20" aria-hidden="true">
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#ffb596] rounded-full mix-blend-screen filter blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#8bd5ff] rounded-full mix-blend-screen filter blur-[120px]" />
        </div>

        {/* Card */}
        <div className="bg-[#001e48] border border-[#5a4136] rounded-xl p-8 w-full max-w-md shadow-card relative z-10 animate-scale-in">
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="text-[32px] font-bold leading-[40px] tracking-[-0.02em] text-[#d7e2ff] mb-2">
              Sign In
            </h1>
            <p className="text-[14px] text-[#e3bfb1]">
              Access your GalvanR.A.G. workspace
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="mb-4 flex items-center gap-2 bg-[#ffb4ab]/10 border border-[#ffb4ab]/30 text-[#ffb4ab] text-[14px] px-4 py-3 rounded-lg animate-fade-in"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }} aria-hidden="true">
                error
              </span>
              {error}
            </div>
          )}

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div>
              <label
                className="block text-[12px] font-bold tracking-[0.05em] text-[#e3bfb1] uppercase mb-1"
                htmlFor="m-email"
              >
                Email or Username
              </label>
              <div className="relative group/input">
                <span
                  className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#e3bfb1] group-focus-within/input:text-[#ffb596] transition-colors text-[18px]"
                  aria-hidden="true"
                >
                  mail
                </span>
                <input
                  id="m-email"
                  type="text"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={e => setField('email', e.target.value)}
                  placeholder="admin@galvan.rag"
                  className="block w-full pl-9 pr-4 py-2.5 bg-[#001231] border border-[#5a4136] rounded-lg text-[#d7e2ff] text-[14px]
                    focus:outline-none focus:ring-1 focus:ring-[#ffb596] focus:border-[#ffb596]
                    placeholder-[#e3bfb1]/50 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label
                  className="block text-[12px] font-bold tracking-[0.05em] text-[#e3bfb1] uppercase"
                  htmlFor="m-password"
                >
                  Password
                </label>
                <a
                  className="text-[12px] text-[#8bd5ff] hover:text-[#ffb596] transition-colors"
                  href="#"
                  aria-label="Forgot your password? Reset it here"
                >
                  Forgot?
                </a>
              </div>
              <div className="relative group/input">
                <span
                  className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#e3bfb1] group-focus-within/input:text-[#ffb596] transition-colors text-[18px]"
                  aria-hidden="true"
                >
                  lock
                </span>
                <input
                  id="m-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setField('password', e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-10 py-2.5 bg-[#001231] border border-[#5a4136] rounded-lg text-[#d7e2ff] text-[14px]
                    focus:outline-none focus:ring-1 focus:ring-[#ffb596] focus:border-[#ffb596]
                    placeholder-[#e3bfb1]/50 transition-all"
                />
                <button
                  type="button"
                  onClick={toggleShowPassword}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#e3bfb1] hover:text-[#ffb596] transition-colors p-0.5 rounded"
                >
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl
                  text-[18px] font-bold text-[#561d00] bg-[#ff6600]
                  hover:brightness-110 hover:shadow-glow-orange transition-all
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ffb596] focus:ring-offset-[#001231]
                  active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in…
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center border-t border-[#5a4136]/30 pt-4">
            <p className="text-[14px] text-[#e3bfb1]">
              Don&apos;t have an account?{' '}
              <Link
                to="/signup"
                className="text-[#ffb596] hover:text-[#ffdbcd] font-semibold transition-colors"
              >
                Sign Up
              </Link>
            </p>
          </div>

          {/* Status flair */}
          <div className="mt-6 flex justify-center items-center gap-2 opacity-50">
            <span className="inline-flex h-2 w-2 rounded-full bg-[#4ae176]" aria-hidden="true" />
            <span className="font-mono text-[13px] text-[#e3bfb1]">
              System: ONLINE • v2.4.1
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
