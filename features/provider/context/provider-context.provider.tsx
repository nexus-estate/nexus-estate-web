'use client';
import {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { providerKeys } from '../query-keys';

const Context = createContext<{
  providerId: string | null;
  setProviderId: (id: string | null) => void;
} | null>(null);
export function ProviderContextProvider({ children }: { children: ReactNode }) {
  const [providerId, setProviderIdState] = useState<string | null>(() =>
    typeof window === 'undefined'
      ? null
      : localStorage.getItem('nexus.provider.active_id'),
  );
  const queryClient = useQueryClient();
  const setProviderId = useCallback(
    (id: string | null) => {
      // Same context: no destructive cache work.
      if (id === providerId) return;
      // Switching contexts: cancel in-flight private queries first so no
      // response written with the old X-Provider-Id header lands under the
      // new provider's key, then drop the private cache instead of
      // invalidating it (invalidating would refetch old keys with the new
      // header and poison the cache). The new key fetches fresh on mount.
      const previousId = providerId;
      if (previousId !== null || id !== null) {
        void queryClient.cancelQueries({
          queryKey: providerKeys.root,
        });
        queryClient.removeQueries({
          queryKey: providerKeys.root,
        });
      }
      if (id) localStorage.setItem('nexus.provider.active_id', id);
      else localStorage.removeItem('nexus.provider.active_id');
      setProviderIdState(id);
    },
    [providerId, queryClient],
  );
  useEffect(() => {
    const clear = () => setProviderId(null);
    window.addEventListener('nexus:provider-context-cleared', clear);
    return () =>
      window.removeEventListener('nexus:provider-context-cleared', clear);
  }, [setProviderId]);
  return (
    <Context.Provider value={{ providerId, setProviderId }}>
      {children}
    </Context.Provider>
  );
}
export function useProviderContext() {
  const value = useContext(Context);
  if (!value) throw new Error('ProviderContextProvider is missing');
  return value;
}
