// src/components/mobile/MobileSignup.tsx
import { Link } from 'react-router-dom';
import { useSignupForm } from '../../hooks/useSignupForm';

export default function MobileSignup() {
  const { state, setField, handleConfirmChange, handleSubmit } = useSignupForm();
  const { username, email, password, confirmPassword, agreedToTerms, passwordError, isSubmitting, error } = state;

  return (
    <div className="bg-[#001231] text-[#d7e2ff] min-h-screen flex flex-col font-sans">
      <main
        id="main-content"
        className="flex-grow flex items-center justify-center p-6 relative overflow-hidden"
      >
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none opacity-20" aria-hidden="true">
          <div className="absolute top-1/4 -right-1/4 w-[400px] h-[400px] bg-[#ffb596] rounded-full mix-blend-screen filter blur-[100px]" />
          <div className="absolute bottom-1/4 -left-1/4 w-[500px] h-[500px] bg-[#8bd5ff] rounded-full mix-blend-screen filter blur-[120px]" />
        </div>

        {/* Card */}
        <div className="bg-[#001e48] border border-[#5a4136] rounded-xl p-8 w-full max-w-md shadow-card relative z-10 animate-scale-in">
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="text-[32px] font-bold leading-[40px] tracking-[-0.02em] text-[#d7e2ff] mb-2">
              Sign Up
            </h1>
            <p className="text-[14px] text-[#e3bfb1]">
              Create your GalvanR.A.G. operator credentials
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
            {/* Username */}
            <div>
              <label
                className="block text-[12px] font-bold tracking-[0.05em] text-[#e3bfb1] uppercase mb-1"
                htmlFor="ms-username"
              >
                Username
              </label>
              <div className="relative group/input">
                <span
                  className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#e3bfb1] group-focus-within/input:text-[#ffb596] transition-colors text-[18px]"
                  aria-hidden="true"
                >
                  person
                </span>
                <input
                  id="ms-username"
                  type="text"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={e => setField('username', e.target.value)}
                  placeholder="operator_name"
                  className="block w-full pl-9 pr-4 py-2.5 bg-[#001231] border border-[#5a4136] rounded-lg text-[#d7e2ff] text-[14px]
                    focus:outline-none focus:ring-1 focus:ring-[#ffb596] focus:border-[#ffb596]
                    placeholder-[#e3bfb1]/50 transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                className="block text-[12px] font-bold tracking-[0.05em] text-[#e3bfb1] uppercase mb-1"
                htmlFor="ms-email"
              >
                Email
              </label>
              <div className="relative group/input">
                <span
                  className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#e3bfb1] group-focus-within/input:text-[#ffb596] transition-colors text-[18px]"
                  aria-hidden="true"
                >
                  alternate_email
                </span>
                <input
                  id="ms-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={e => setField('email', e.target.value)}
                  placeholder="name@galvan.ai"
                  className="block w-full pl-9 pr-4 py-2.5 bg-[#001231] border border-[#5a4136] rounded-lg text-[#d7e2ff] text-[14px]
                    focus:outline-none focus:ring-1 focus:ring-[#ffb596] focus:border-[#ffb596]
                    placeholder-[#e3bfb1]/50 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                className="block text-[12px] font-bold tracking-[0.05em] text-[#e3bfb1] uppercase mb-1"
                htmlFor="ms-password"
              >
                Security Key
              </label>
              <div className="relative group/input">
                <span
                  className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#e3bfb1] group-focus-within/input:text-[#ffb596] transition-colors text-[18px]"
                  aria-hidden="true"
                >
                  lock
                </span>
                <input
                  id="ms-password"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={e => setField('password', e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-4 py-2.5 bg-[#001231] border border-[#5a4136] rounded-lg text-[#d7e2ff] text-[14px]
                    focus:outline-none focus:ring-1 focus:ring-[#ffb596] focus:border-[#ffb596]
                    placeholder-[#e3bfb1]/50 transition-all"
                />
              </div>
            </div>

            {/* Confirm password */}
            <div>
              <label
                className="block text-[12px] font-bold tracking-[0.05em] text-[#e3bfb1] uppercase mb-1"
                htmlFor="ms-confirm"
              >
                Confirm Security Key
              </label>
              <div className="relative group/input">
                <span
                  className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#e3bfb1] group-focus-within/input:text-[#ffb596] transition-colors text-[18px]"
                  aria-hidden="true"
                >
                  verified_user
                </span>
                <input
                  id="ms-confirm"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={handleConfirmChange}
                  placeholder="••••••••"
                  aria-describedby={passwordError ? 'ms-password-error' : undefined}
                  aria-invalid={passwordError}
                  className={`block w-full pl-9 pr-4 py-2.5 bg-[#001231] border rounded-lg text-[#d7e2ff] text-[14px]
                    focus:outline-none placeholder-[#e3bfb1]/50 transition-all
                    ${passwordError
                      ? 'border-[#ffb4ab] ring-1 ring-[#ffb4ab]'
                      : 'border-[#5a4136] focus:ring-1 focus:ring-[#ffb596] focus:border-[#ffb596]'
                    }`}
                />
              </div>
              {passwordError && (
                <p id="ms-password-error" role="alert" className="text-[#ffb4ab] text-[12px] mt-1 animate-fade-in">
                  Credentials must match.
                </p>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2 pt-2">
              <input
                id="ms-terms"
                type="checkbox"
                required
                checked={agreedToTerms}
                onChange={e => setField('agreedToTerms', e.target.checked)}
                className="mt-1 bg-[#001231] border-[#5a4136] rounded text-[#ff6600] focus:ring-[#ff6600]"
              />
              <label className="text-[12px] text-[#e3bfb1]" htmlFor="ms-terms">
                I agree to the{' '}
                <a href="#" className="text-[#8bd5ff] hover:underline">
                  Neural Protocols
                </a>{' '}
                and data processing consent.
              </label>
            </div>

            {/* Submit */}
            <div className="pt-3">
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
                    Establishing Link…
                  </>
                ) : (
                  'Sign Up'
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center border-t border-[#5a4136]/30 pt-4">
            <p className="text-[14px] text-[#e3bfb1]">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-[#ffb596] hover:text-[#ffdbcd] font-semibold transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
