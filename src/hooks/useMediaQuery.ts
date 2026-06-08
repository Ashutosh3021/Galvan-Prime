import { useState, useEffect } from 'react';

/**
 * useMediaQuery hook
 *
 * Returns `true` when the given media-query string matches the current
 * viewport.  Subscribes to changes so the component re-renders
 * automatically when the viewport crosses the breakpoint.
 *
 * @example
 * const isDesktop = useMediaQuery('(min-width: 1024px)');
 */
export function useMediaQuery(query: string): boolean {
  // Initialise synchronously so there is no flash on first render.
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);

    const handleChange = (event: MediaQueryListEvent): void => {
      setMatches(event.matches);
    };

    // Use addEventListener / removeEventListener (modern API).
    mediaQueryList.addEventListener('change', handleChange);

    // Sync in case the window changed between render and effect.
    setMatches(mediaQueryList.matches);

    return () => {
      mediaQueryList.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
}

/** Convenience wrapper — returns true when viewport ≥ 1024 px */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}
