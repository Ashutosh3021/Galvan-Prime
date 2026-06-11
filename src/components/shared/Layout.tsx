// src/components/shared/Layout.tsx
import type { ReactNode } from 'react';
import DesktopTopNav from './DesktopTopNav';
import MobileBottomNav from './MobileBottomNav';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background">
      {/* Desktop top nav — hidden on mobile */}
      <DesktopTopNav />

      {/* Page content — pb-[72px] on mobile so content clears the fixed bottom nav */}
      <div className="flex-1 flex flex-col pb-[72px] md:pb-0">
        {children}
      </div>

      {/* Mobile bottom nav — hidden on desktop */}
      <MobileBottomNav />
    </div>
  );
}