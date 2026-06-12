import { Link, useLocation } from 'react-router-dom';
import { Icon } from '../ui/Icon';

const navItems = [
  { label: 'Home',        to: '/home',        icon: 'home'         },
  { label: 'Ingest',      to: '/ingest',      icon: 'upload_file'  },
  { label: 'Query',       to: '/query',       icon: 'search_check' },
  { label: 'Eval',        to: '/eval',        icon: 'assessment'   },
  { label: 'Collections', to: '/collections', icon: 'folder_open'  },
];

export default function MobileBottomNav() {
  const { pathname } = useLocation();

  return (
    <nav
      aria-label="Mobile navigation"
      className="md:hidden fixed bottom-0 left-0 w-full z-50
        flex items-stretch
        bg-surface-container-low border-t border-outline-variant"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {navItems.map(item => {
        const isActive = pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
            className={`
              flex-1 flex flex-col items-center justify-center py-2 gap-0.5
              transition-colors active:scale-90 duration-200
              ${isActive ? 'text-primary-container' : 'text-on-surface-variant hover:text-primary-container hover:bg-white/5'}
            `}
          >
            <Icon name={item.icon} size={22} filled={isActive} />
            <span className="text-[10px] font-bold leading-none tracking-wide">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
