// src/components/shared/DesktopTopNav.tsx
import { Link, useLocation } from 'react-router-dom';

const links = [
  { to: '/home',        label: 'Home'        },
  { to: '/ingest',      label: 'Ingest'      },
  { to: '/query',       label: 'Query'       },
  { to: '/eval',        label: 'Eval'        },
  { to: '/collections', label: 'Collections' },
  { to: '/settings',    label: 'Settings'    },
];

export default function DesktopTopNav() {
  const { pathname } = useLocation();

  return (
    <nav
      aria-label="Primary navigation"
      className="bg-surface-container-lowest border-b border-outline-variant sticky top-0 z-50"
    >
      <div className="flex justify-between items-center w-full px-gutter max-w-[1440px] mx-auto h-16">

        {/* Brand — text only, no icon, matches reference */}
        <Link
          to="/home"
          aria-label="GalvanR.A.G. — Go to home"
          className="text-title-md font-black text-primary tracking-tighter rounded focus-visible:ring-2 focus-visible:ring-primary-container"
        >
          GalvanR.A.G.
        </Link>

        {/* Nav links */}
        <div
          className="hidden md:flex items-center space-x-1 h-full"
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
                className={`h-full flex items-center text-label-caps font-label-caps px-3 py-2 rounded transition-all
                  focus-visible:outline-2 focus-visible:outline-primary-container focus-visible:outline-offset-[-2px]
                  ${isActive
                    ? 'text-primary font-bold border-b-2 border-primary scale-95 duration-100 ease-in-out'
                    : 'text-on-surface-variant hover:text-primary hover:bg-surface-variant/50 transition-colors'
                  }`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* Trailing actions — icons + avatar + status button */}
        <div className="flex items-center gap-6">
          {/* Icon actions */}
          <div className="flex items-center gap-4">
            <span
              className="material-symbols-outlined cursor-pointer active:scale-95 text-on-surface-variant hover:text-primary transition-colors duration-200"
              aria-label="Notifications"
              role="button"
              tabIndex={0}
            >
              notifications
            </span>
            <span
              className="material-symbols-outlined cursor-pointer active:scale-95 text-on-surface-variant hover:text-primary transition-colors duration-200"
              aria-label="Help"
              role="button"
              tabIndex={0}
            >
              help
            </span>
          </div>

          {/* User avatar */}
          <div className="h-8 w-8 rounded-full bg-surface-container-high overflow-hidden border border-outline-variant">
            <div className="w-full h-full bg-surface-container-highest flex items-center justify-center">
              <span
                className="material-symbols-outlined text-on-surface-variant"
                style={{ fontSize: '18px' }}
                aria-hidden="true"
              >
                person
              </span>
            </div>
          </div>

          {/* Status button */}
          <button
            className="bg-primary-container text-on-primary px-4 py-2 rounded text-label-caps font-label-caps hover:brightness-110 transition-all"
            aria-label="System status"
          >
            Status
          </button>
        </div>
      </div>
    </nav>
  );
}