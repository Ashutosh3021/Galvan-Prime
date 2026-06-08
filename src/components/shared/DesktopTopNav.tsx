import { Link, useLocation } from 'react-router-dom';

export default function DesktopTopNav() {
  const { pathname } = useLocation();

  const links = [
    { to: '/',        label: 'Home'     },
    { to: '/ingest',  label: 'Ingest'   },
    { to: '/query',   label: 'Query'    },
    { to: '/eval',    label: 'Eval'     },
    { to: '/settings',label: 'Settings' },
    { to: '/api-docs',label: 'Docs'     },
  ];

  return (
    <nav className="bg-surface-container-lowest border-b border-outline-variant sticky top-0 z-50">
      <div className="flex justify-between items-center w-full px-gutter max-w-[1440px] mx-auto h-16">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary-container icon-fill">psychology</span>
          <span className="text-title-md font-bold text-primary tracking-tighter">GalvanR.A.G.</span>
        </div>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-8 h-full">
          {links.map(({ to, label }) => {
            const isActive = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`h-full flex items-center text-[12px] font-semibold tracking-[0.05em] px-2 transition-all ${
                  isActive
                    ? 'text-primary border-b-2 border-primary font-bold'
                    : 'text-on-surface-variant hover:text-primary hover:bg-surface-variant/50'
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* Trailing */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center bg-surface-container px-3 py-1.5 rounded-full border border-surface-container-high">
            <span className="material-symbols-outlined text-on-surface-variant mr-2" style={{ fontSize: '18px' }}>search</span>
            <input
              type="text"
              placeholder="Search docs..."
              className="bg-transparent border-none text-[14px] text-on-surface focus:outline-none w-32 placeholder:text-on-surface-variant"
            />
          </div>
          <Link
            to="/status"
            className="text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 border border-outline-variant px-3 py-1.5 rounded-full hover:bg-surface-variant/50"
          >
            <span className="w-2 h-2 rounded-full bg-secondary-container inline-block" />
            Status
          </Link>
        </div>
      </div>
    </nav>
  );
}
