import { Link } from 'react-router-dom';
import { useLoginForm } from '../../hooks/useLoginForm';

export default function DesktopLogin() {
  const { state, setField, toggleShowPassword, handleSubmit } = useLoginForm();
  const { email, password, rememberMe, showPassword, isSubmitting, error } = state;

  return (
    <div className="bg-[#0e1320] text-[#dee2f5] antialiased min-h-screen flex flex-col relative overflow-hidden">
      {/* Dot-grid background */}
      <div
        className="absolute inset-0 z-0 opacity-40 pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage:
            'radial-gradient(circle at 2px 2px, rgba(255,102,0,0.05) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      <main
        id="main-content"
        className="flex-grow flex items-center justify-center px-4 pt-12 pb-16 relative z-10"
      >
        <div className="w-full max-w-[440px] mx-auto animate-scale-in">
          {/* Decorative blobs */}
          <div
            className="absolute -top-12 -left-12 w-32 h-32 bg-primary-container/10 rounded-full blur-3xl pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-12 -right-12 w-32 h-32 bg-secondary-container/10 rounded-full blur-3xl pointer-events-none"
            aria-hidden="true"
          />

          {/* Auth card */}
          <div className="bg-surface-container border border-outline-variant p-8 md:p-10 rounded-xl shadow-card overflow-hidden">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-1 w-8 bg-primary-container rounded-full" aria-hidden="true" />
                <span className="text-[12px] font-semibold tracking-[0.05em] text-primary">
                  SECURE AUTHENTICATION
                </span>
              </div>
              <h1 className="text-[32px] font-semibold leading-tight text-on-surface mb-2">
                Welcome Back
              </h1>
              <p className="text-[14px] text-on-surface-variant">
                Access your RAG pipelines and vector datasets.
              </p>
            </div>

            {/* Error banner */}
            {error && (
              <div
                role="alert"
                className="mb-6 flex items-center gap-2 bg-error/10 border border-error/30 text-error text-[14px] px-4 py-3 rounded-lg animate-fade-in"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }} aria-hidden="true">
                  error
                </span>
                {error}
              </div>
            )}

            {/* Form */}
            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              {/* Email */}
              <div className="space-y-2">
                <label
                  className="text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant"
                  htmlFor="login-email"
                >
                  Email or Username
                </label>
                <div className="relative group/input">
                  <span
                    className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within/input:text-primary transition-colors text-[20px]"
                    aria-hidden="true"
                  >
                    person
                  </span>
                  <input
                    id="login-email"
                    type="text"
                    required
                    autoComplete="username"
                    value={email}
                    onChange={e => setField('email', e.target.value)}
                    placeholder="name@galvan.ai"
                    className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface text-[16px]
                      pl-10 pr-4 py-3 rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label
                    className="text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant"
                    htmlFor="login-password"
                  >
                    Password
                  </label>
                  <a
                    className="text-[12px] font-semibold tracking-[0.05em] text-secondary hover:underline"
                    href="#"
                    aria-label="Forgot your password? Reset it here"
                  >
                    Forgot Password?
                  </a>
                </div>
                <div className="relative group/input">
                  <span
                    className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within/input:text-primary transition-colors text-[20px]"
                    aria-hidden="true"
                  >
                    lock
                  </span>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={e => setField('password', e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface text-[16px]
                      pl-10 pr-12 py-3 rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={toggleShowPassword}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors p-1 rounded"
                  >
                    <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center gap-3">
                <input
                  id="login-remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setField('rememberMe', e.target.checked)}
                  className="w-4 h-4 rounded border-outline-variant bg-surface-container-lowest text-primary
                    focus:ring-primary focus:ring-offset-surface-container"
                />
                <label
                  className="text-[14px] text-on-surface-variant cursor-pointer select-none"
                  htmlFor="login-remember"
                >
                  Remember this device for 30 days
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
                className="w-full bg-primary-container text-on-primary font-bold py-4 rounded
                  hover:brightness-110 active:scale-[0.98] transition-all
                  flex justify-center items-center gap-2 group/btn
                  disabled:opacity-60 disabled:cursor-not-allowed
                  shadow-glow-orange-sm hover:shadow-glow-orange"
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
                    <span className="text-[12px] font-semibold tracking-[0.05em] uppercase">
                      Signing in…
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[12px] font-semibold tracking-[0.05em] uppercase">
                      Sign In
                    </span>
                    <span
                      className="material-symbols-outlined group-hover/btn:translate-x-1 transition-transform"
                      aria-hidden="true"
                    >
                      arrow_forward
                    </span>
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 pt-8 border-t border-outline-variant/30 text-center">
              <p className="text-[14px] text-on-surface-variant">
                Don&apos;t have an account?{' '}
                <Link to="/signup" className="text-primary font-bold hover:underline ml-1">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>

          {/* Footer meta */}
          <div className="mt-6 flex justify-between items-center px-2 opacity-50">
            <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-tighter text-on-surface-variant">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#4ae176] animate-pulse" aria-hidden="true" />
                API ONLINE
              </div>
              <span>v1.0.4-STABLE</span>
            </div>
            <div className="flex gap-4">
              <span
                className="material-symbols-outlined text-[16px] cursor-help"
                title="Encrypted Connection"
                aria-label="Encrypted connection"
              >
                shield
              </span>
              <span
                className="material-symbols-outlined text-[16px] cursor-help"
                title="System Logs"
                aria-label="System logs available"
              >
                terminal
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
