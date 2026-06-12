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
      className="hidden md:block bg-surface-container-lowest border-b border-outline-variant sticky top-0 z-50"
    >
      <div className="flex items-center justify-between w-full px-gutter max-w-[1440px] mx-auto h-16">

        {/* Brand */}
        <Link
          to="/home"
          aria-label="GalvanR.A.G. — Go to home"
          className="text-title-md font-black text-primary-container tracking-tighter shrink-0"
        >
          GalvanR.A.G.
        </Link>

        {/* Nav links */}
        <div className="flex items-center space-x-1 h-full" role="list">
          {links.map(({ to, label }) => {
            const isActive = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                role="listitem"
                aria-current={isActive ? 'page' : undefined}
                className={`
                  h-full flex items-center px-3 py-2 text-label-caps font-label-caps relative transition-all
                  ${isActive
                    ? 'text-primary-container font-bold border-b-2 border-primary-container'
                    : 'text-on-surface-variant hover:text-primary-container hover:bg-surface-variant/50 rounded'
                  }
                `}
              >
                {label}
              </Link>
            );
          })}
        </div>

        <div className="w-[160px]" aria-hidden="true" />
      </div>
    </nav>
  );
}
