// src/components/shared/MobileBottomNav.tsx
import { Link, useLocation } from 'react-router-dom';

// Reference HTML has 5 items (no Settings), with corrected icons
const navItems = [
  { label: 'Home',        to: '/home',        icon: 'home'        },
  { label: 'Ingest',      to: '/ingest',      icon: 'upload_file' },
  { label: 'Query',       to: '/query',       icon: 'search_check' },
  { label: 'Eval',        to: '/eval',        icon: 'assessment'  },
  { label: 'Collections', to: '/collections', icon: 'folder_open' },
];

export default function MobileBottomNav() {
  const { pathname } = useLocation();

  return (
    <nav
      aria-label="Mobile navigation"
      className="md:hidden fixed bottom-0 left-0 w-full z-50
        flex justify-around items-center py-sm px-gutter
        bg-surface-container-low border-t border-outline-variant rounded-t-xl"
    >
      {navItems.map(item => {
        const isActive = pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
            className={`flex flex-col items-center justify-center
              hover:text-primary transition-all active:scale-90 duration-200
              ${isActive ? 'text-primary font-bold' : 'text-on-surface-variant'}`}
          >
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

            <span className="text-label-caps font-label-caps leading-none mt-0.5">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}