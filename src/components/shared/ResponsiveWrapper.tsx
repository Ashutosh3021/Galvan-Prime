import type { ReactElement } from 'react';
import { useIsDesktop } from '../../hooks/useMediaQuery';

interface ResponsiveWrapperProps {
  /** Component rendered for viewports ≥ 1024 px */
  desktop: ReactElement;
  /** Component rendered for viewports < 1024 px */
  mobile: ReactElement;
}

/**
 * ResponsiveWrapper
 *
 * Conditionally renders either the `desktop` or `mobile` prop based on the
 * current viewport width.  Uses the `useIsDesktop` hook so it stays reactive
 * and re-renders whenever the viewport crosses the 1024 px breakpoint.
 *
 * Usage:
 * ```tsx
 * <ResponsiveWrapper
 *   desktop={<DesktopHome />}
 *   mobile={<MobileHome />}
 * />
 * ```
 */
export default function ResponsiveWrapper({ desktop, mobile }: ResponsiveWrapperProps) {
  const isDesktop = useIsDesktop();
  return isDesktop ? desktop : mobile;
}
