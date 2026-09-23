'use client';

import { useCallback, useSyncExternalStore } from 'react';

/**
 * Subscribe to a CSS media query from React.
 *
 * Uses `useSyncExternalStore` rather than effect + setState: the value is read
 * during render (so there is no extra paint), tearing is handled by React, and
 * the server snapshot keeps "wide" layout chrome visible until hydration.
 */
export function useMediaQuery(query: string, serverFallback = true): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onStoreChange);
      return () => list.removeEventListener('change', onStoreChange);
    },
    [query],
  );

  const getSnapshot = useCallback(
    () => window.matchMedia(query).matches,
    [query],
  );

  const getServerSnapshot = useCallback(() => serverFallback, [serverFallback]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
