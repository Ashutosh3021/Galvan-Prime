import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

/**
 * Layout
 *
 * Thin wrapper that provides a consistent full-viewport container for all
 * page components.  Both desktop and mobile pages are rendered inside this
 * wrapper via `AppRoutes`, ensuring a single consistent root element.
 */
export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {children}
    </div>
  );
}
