'use client';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { administrationAuthenticationApi } from '@/lib/api/administration/authentication.api';
import { administrationAuthorizationApi } from '@/lib/api/administration/authorization.api';
import type { AdminAuthorization } from '@/lib/api/administration/types';
import { getRealmAccessToken, setRealmAccessToken } from '@/lib/api/client';
type Session = {
  status: 'restoring' | 'authenticated' | 'anonymous';
  isAuthenticated: boolean;
  authorization: AdminAuthorization | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (code: string) => boolean;
};
const Context = createContext<Session | null>(null);
const tokenKey = 'nexus.administration.access_token';
const refreshKey = 'nexus.administration.refresh_token';
export function AdministrationSessionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [authorization, setAuthorization] = useState<AdminAuthorization | null>(
    null,
  );
  const [authenticated, setAuthenticated] = useState(
    Boolean(getRealmAccessToken('administration')),
  );
  const [restoring, setRestoring] = useState(true);
  const queryClient = useQueryClient();
  const restore = useCallback(async () => {
    if (!getRealmAccessToken('administration')) {
      setRestoring(false);
      return;
    }
    try {
      setAuthorization(await administrationAuthorizationApi.effective());
      setAuthenticated(true);
    } catch {
      setAuthenticated(false);
    } finally {
      setRestoring(false);
    }
  }, []);
  useEffect(() => {
    // Session restoration synchronizes React state with browser persistence.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void restore();
  }, [restore]);
  const login = useCallback(async (email: string, password: string) => {
    const pair = await administrationAuthenticationApi.login({
      email,
      password,
    });
    localStorage.setItem(tokenKey, pair.accessToken);
    localStorage.setItem(refreshKey, pair.refreshToken);
    setRealmAccessToken('administration', pair.accessToken);
    setAuthorization(await administrationAuthorizationApi.effective());
    setAuthenticated(true);
  }, []);
  const logout = useCallback(async () => {
    const token = localStorage.getItem(refreshKey);
    if (token)
      try {
        await administrationAuthenticationApi.logout(token);
      } catch {}
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(refreshKey);
    setRealmAccessToken('administration', null);
    setAuthorization(null);
    setAuthenticated(false);
    queryClient.removeQueries({ queryKey: ['administration'] });
  }, [queryClient]);
  const value = useMemo(
    () => ({
      status: (restoring
        ? 'restoring'
        : authenticated
          ? 'authenticated'
          : 'anonymous') as Session['status'],
      isAuthenticated: authenticated,
      authorization,
      login,
      logout,
      hasPermission: (code: string) =>
        Boolean(authorization?.permissions.some((p) => p.code === code)),
    }),
    [authenticated, authorization, login, logout, restoring],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useAdministrationSession() {
  const value = useContext(Context);
  if (!value) throw new Error('AdministrationSessionProvider is missing');
  return value;
}
