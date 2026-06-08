// src/components/shared/DesktopTopNav.tsx
import { useState, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';

const links = [
  { to: '/',         label: 'Home'     },
  { to: '/ingest',   label: 'Ingest'   },
  { to: '/query',    label: 'Query'    },
  { to: '/eval',     label: 'Eval'     },
  { to: '/settings', label: 'Settings' },
  { to: '/api-docs', label: 'Docs'     },
];

export default function DesktopTopNav() {
  const { pathname } = useLocation();
  const [searchValue, setSearchValue] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Ctrl+K / Cmd+K focuses search
  const handleGlobalKeyDown = useCallback((e: React.KeyboardEvent<HTMLElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      searchRef.current?.focus();
    }
  }, []);

  return (
    <nav
      aria-label="Primary navigation"
      className="bg-surface-container-lowest border-b border-outline-variant sticky top-0 z-50 backdrop-blur-sm"
      onKeyDown={handleGlobalKeyDown}
    >
      <div className="flex justify-between items-center w-full px-gutter max-w-[1440px] mx-auto h-16">
        {/* Brand */}
        <Link
          to="/"
          aria-label="GalvanR.A.G. — Go to home"
          className="flex items-center gap-2 rounded-md focus-visible:ring-2 focus-visible:ring-primary-container"
        >
          <span
            className="material-symbols-outlined text-primary-container icon-fill"
            aria-hidden="true"
          >
            psychology
          </span>
          <span className="text-title-md font-bold text-primary tracking-tighter">
            GalvanR.A.G.
          </span>
        </Link>

        {/* Nav links */}
        <div
          className="hidden md:flex items-center gap-1 h-full"
          role="list"
        >
          {links.map(({ to, label }) => {
            const isActive = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                role="listitem"
                aria-current={isActive ? 'page' : undefined}
                className={`h-full flex items-center text-[12px] font-semibold tracking-[0.05em] px-3 relative rounded-sm transition-colors
                  focus-visible:outline-2 focus-visible:outline-primary-container focus-visible:outline-offset-[-2px]
                  ${isActive
                    ? 'text-primary font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:rounded-full'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/40'
                  }`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* Trailing actions */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div
            className="hidden md:flex items-center bg-surface-container px-3 py-1.5 rounded-full border border-surface-container-high
              focus-within:border-primary-container/60 focus-within:ring-1 focus-within:ring-primary-container/30 transition-all"
            role="search"
          >
            <span
              className="material-symbols-outlined text-on-surface-variant mr-2"
              style={{ fontSize: '18px' }}
              aria-hidden="true"
            >
              search
            </span>
            <input
              ref={searchRef}
              type="search"
              placeholder="Search docs…"
              aria-label="Search documentation"
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              className="bg-transparent border-none text-[14px] text-on-surface focus:outline-none w-32 placeholder:text-on-surface-variant"
            />
            <kbd
              className="hidden lg:inline-flex items-center gap-0.5 text-[10px] font-mono text-on-surface-variant/50 ml-2"
              aria-label="Keyboard shortcut: Control K"
            >
              <span>⌃K</span>
            </kbd>
          </div>

          {/* Status pill */}
          <Link
            to="/status"
            aria-label="System status"
            className="text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant hover:text-primary
              transition-colors flex items-center gap-1.5 border border-outline-variant px-3 py-1.5 rounded-full
              hover:bg-surface-variant/50 hover:border-primary/30"
          >
            <span
              className="w-2 h-2 rounded-full bg-secondary-container inline-block animate-pulse"
              aria-hidden="true"
            />
            Status
          </Link>

          {/* Profile link */}
          <Link
            to="/profile"
            aria-label="View your profile"
            className="w-8 h-8 rounded-full bg-surface-container border border-outline-variant flex items-center justify-center
              hover:border-primary-container/50 hover:bg-surface-variant/50 transition-all"
          >
            <span
              className="material-symbols-outlined text-on-surface-variant"
              style={{ fontSize: '18px' }}
              aria-hidden="true"
            >
              person
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
