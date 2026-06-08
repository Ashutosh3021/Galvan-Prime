// src/components/shared/MobileBottomNav.tsx
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Home',     to: '/',         icon: 'home'        },
  { label: 'Query',    to: '/query',    icon: 'search'      },
  { label: 'Eval',     to: '/eval',     icon: 'analytics'   },
  { label: 'Settings', to: '/settings', icon: 'settings'    },
  { label: 'Status',   to: '/status',   icon: 'query_stats' },
];

export default function MobileBottomNav() {
  const { pathname } = useLocation();

  return (
    <nav
      aria-label="Mobile navigation"
      className="md:hidden fixed bottom-0 left-0 w-full bg-[#001e48]/95 backdrop-blur-md border-t border-[#5a4136]
        flex justify-around items-stretch px-2 z-[9999]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}
    >
      {navItems.map(item => {
        const isActive = pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
            className={`flex flex-col items-center justify-center gap-0.5 py-2 px-3 relative flex-1
              min-h-[56px] rounded-md transition-colors
              ${isActive
                ? 'text-[#ff6600]'
                : 'text-[#e3bfb1] hover:text-[#dee2f5] hover:bg-white/5'
              }`}
          >
            {/* Active indicator bar */}
            {isActive && (
              <span
                className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#ff6600] rounded-full"
                aria-hidden="true"
              />
            )}

            <span
              className="material-symbols-outlined transition-all"
              style={{
                fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                fontSize: '24px',
              }}
              aria-hidden="true"
            >
              {item.icon}
            </span>

            <span
              className={`text-[10px] font-bold leading-none transition-colors ${
                isActive ? 'text-[#ff6600]' : ''
              }`}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
