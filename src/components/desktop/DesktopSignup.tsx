// src/components/desktop/DesktopSignup.tsx
import { Link } from 'react-router-dom';
import { useSignupForm } from '../../hooks/useSignupForm';

export default function DesktopSignup() {
  const { state, setField, handleConfirmChange, handleSubmit } = useSignupForm();
  const { username, email, password, confirmPassword, agreedToTerms, passwordError, isSubmitting, error } = state;

  return (
    <div className="font-sans min-h-screen flex flex-col bg-[#0A0F1C] text-[#dee2f5]">

      <main
        id="main-content"
        className="flex-grow flex items-center justify-center pt-20 pb-12 px-8 relative overflow-hidden"
      >
        {/* Atmospheric blobs */}
        <div
          className="absolute top-1/4 -right-20 w-96 h-96 bg-primary-container/5 blur-[120px] rounded-full pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-1/4 -left-20 w-96 h-96 bg-secondary-container/5 blur-[120px] rounded-full pointer-events-none"
          aria-hidden="true"
        />

        <div className="bg-[#1A2338] border border-[#252F4A] w-full max-w-md rounded-xl p-8 relative z-10 animate-scale-in shadow-card">
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div
              className="w-12 h-12 bg-primary-container rounded-lg flex items-center justify-center mb-4 shadow-glow-orange-sm"
              aria-hidden="true"
            >
              <span className="material-symbols-outlined text-[#360f00] icon-fill">rocket_launch</span>
            </div>
            <h1 className="text-[32px] font-semibold text-on-surface text-center mb-2">
              Initialize Instance
            </h1>
            <p className="text-[14px] text-on-surface-variant text-center">
              Create your GalvanR.A.G. operator credentials.
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

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            {/* Username */}
            <div className="space-y-1.5">
              <label
                className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-widest"
                htmlFor="ds-username"
              >
                Username
              </label>
              <div className="relative group/input">
                <span
                  className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within/input:text-primary transition-colors text-[20px]"
                  aria-hidden="true"
                >
                  person
                </span>
                <input
                  id="ds-username"
                  type="text"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={e => setField('username', e.target.value)}
                  placeholder="operator_name"
                  className="w-full bg-[#0e1320] border border-outline-variant rounded-lg py-2.5 pl-10 pr-4 text-on-surface
                    focus:border-primary-container outline-none transition-all focus:ring-1 focus:ring-primary-container"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label
                className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-widest"
                htmlFor="ds-email"
              >
                Email Address
              </label>
              <div className="relative group/input">
                <span
                  className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within/input:text-primary transition-colors text-[20px]"
                  aria-hidden="true"
                >
                  alternate_email
                </span>
                <input
                  id="ds-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={e => setField('email', e.target.value)}
                  placeholder="name@galvan.ai"
                  className="w-full bg-[#0e1320] border border-outline-variant rounded-lg py-2.5 pl-10 pr-4 text-on-surface
                    focus:border-primary-container outline-none transition-all focus:ring-1 focus:ring-primary-container"
                />
              </div>
            </div>

            {/* Password pair */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label
                  className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-widest"
                  htmlFor="ds-password"
                >
                  Security Key
                </label>
                <div className="relative group/input">
                  <span
                    className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within/input:text-primary transition-colors text-[20px]"
                    aria-hidden="true"
                  >
                    lock
                  </span>
                  <input
                    id="ds-password"
                    type="password"
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={e => setField('password', e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#0e1320] border border-outline-variant rounded-lg py-2.5 pl-10 pr-4 text-on-surface
                      focus:border-primary-container outline-none transition-all focus:ring-1 focus:ring-primary-container"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-widest"
                  htmlFor="ds-confirm"
                >
                  Confirm Security Key
                </label>
                <div className="relative group/input">
                  <span
                    className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within/input:text-primary transition-colors text-[20px]"
                    aria-hidden="true"
                  >
                    verified_user
                  </span>
                  <input
                    id="ds-confirm"
                    type="password"
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={handleConfirmChange}
                    placeholder="••••••••"
                    aria-describedby={passwordError ? 'ds-password-error' : undefined}
                    aria-invalid={passwordError}
                    className={`w-full bg-[#0e1320] border rounded-lg py-2.5 pl-10 pr-4 text-on-surface
                      outline-none transition-all
                      ${passwordError
                        ? 'border-error ring-1 ring-error'
                        : 'border-outline-variant focus:border-primary-container focus:ring-1 focus:ring-primary-container'
                      }`}
                  />
                </div>
                {passwordError && (
                  <p id="ds-password-error" role="alert" className="text-[#ffb4ab] text-[14px] mt-1 animate-fade-in">
                    Credentials must match for secure handshake.
                  </p>
                )}
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3 py-2">
              <input
                id="ds-terms"
                type="checkbox"
                required
                checked={agreedToTerms}
                onChange={e => setField('agreedToTerms', e.target.checked)}
                className="mt-1 w-4 h-4 bg-[#0e1320] border-outline-variant rounded text-primary-container
                  focus:ring-offset-[#0e1320] focus:ring-primary-container"
              />
              <label className="text-[14px] text-on-surface-variant" htmlFor="ds-terms">
                I agree to the{' '}
                <a href="#" className="text-secondary hover:underline">
                  Neural Protocols
                </a>{' '}
                and data processing consent.
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className="w-full bg-primary-container text-[#360f00] py-3.5 rounded-lg text-[20px] font-bold
                transition-all hover:brightness-110 active:scale-[0.98]
                shadow-glow-orange-sm hover:shadow-glow-orange
                disabled:opacity-60 disabled:cursor-not-allowed
                flex justify-center items-center"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-3">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Establishing Link…
                </div>
              ) : (
                'Sign Up'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-outline-variant text-center">
            <p className="text-[14px] text-on-surface-variant">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-bold hover:underline ml-1">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Visual footer accent */}
      <footer className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-30" aria-hidden="true" />
    </div>
  );
}
