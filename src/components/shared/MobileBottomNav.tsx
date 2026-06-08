import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Home',     to: '/',        icon: 'home'        },
  { label: 'Query',    to: '/query',   icon: 'search'      },
  { label: 'Eval',     to: '/eval',    icon: 'analytics'   },
  { label: 'Settings', to: '/settings',icon: 'settings'    },
  { label: 'Status',   to: '/status',  icon: 'query_stats' },
];

export default function MobileBottomNav() {
  const { pathname } = useLocation();
  
  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#001e48] border-t border-[#5a4136] flex justify-around items-center px-4 py-2 z-[9999]">
      {navItems.map(item => {
        const isActive = pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`flex flex-col items-center gap-1 p-2 relative ${isActive ? 'text-[#ff6600]' : 'text-[#e3bfb1]'}`}
          >
            {isActive && <div className="absolute -top-2 w-8 h-1 bg-[#ff6600] rounded-full" />}
            <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0", fontSize: '24px' }}>
              {item.icon}
            </span>
            <span className="text-[10px] font-bold">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
