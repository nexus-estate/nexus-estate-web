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
  useEffect(() => {
    const clear = () => setProviderIdState(null);
    window.addEventListener('nexus:provider-context-cleared', clear);
    return () =>
      window.removeEventListener('nexus:provider-context-cleared', clear);
  }, []);
  const setProviderId = useCallback(
    (id: string | null) => {
      if (id) localStorage.setItem('nexus.provider.active_id', id);
      else localStorage.removeItem('nexus.provider.active_id');
      setProviderIdState(id);
      void queryClient.invalidateQueries({ queryKey: ['provider'] });
    },
    [queryClient],
  );
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
