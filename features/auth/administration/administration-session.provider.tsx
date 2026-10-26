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
import { subscribeRealmSessionExpired } from '@/lib/api/core/session-events';
type Session = {
  status: 'restoring' | 'authenticated' | 'anonymous';
  isAuthenticated: boolean;
  authorization: AdminAuthorization | null;
  authorizationReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  refreshAuthorization: () => Promise<void>;
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
  const [authorizationReady, setAuthorizationReady] = useState(false);
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
      setAuthorizationReady(true);
    } catch {
      // Refresh failure may have cleared the session while loading the ACL.
      // Only keep the workspace open if an access token still exists.
      setAuthenticated(Boolean(getRealmAccessToken('administration')));
      setAuthorization(null);
      setAuthorizationReady(false);
    } finally {
      setRestoring(false);
    }
  }, []);
  useEffect(() => {
    // Session restoration synchronizes React state with browser persistence.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void restore();
  }, [restore]);
  useEffect(() => {
    return subscribeRealmSessionExpired('administration', () => {
      localStorage.removeItem(tokenKey);
      localStorage.removeItem(refreshKey);
      setRealmAccessToken('administration', null);
      setAuthorization(null);
      setAuthorizationReady(false);
      setAuthenticated(false);
      queryClient.removeQueries({ queryKey: ['administration'] });
    });
  }, [queryClient]);
  const refreshAuthorization = useCallback(async () => {
    try {
      setAuthorization(await administrationAuthorizationApi.effective());
      setAuthorizationReady(true);
    } catch (error) {
      setAuthorization(null);
      setAuthorizationReady(false);
      throw error;
    }
  }, []);
  const login = useCallback(async (email: string, password: string) => {
    const pair = await administrationAuthenticationApi.login({
      email,
      password,
    });
    localStorage.setItem(tokenKey, pair.accessToken);
    localStorage.setItem(refreshKey, pair.refreshToken);
    setRealmAccessToken('administration', pair.accessToken);
    setAuthenticated(true);
    try {
      setAuthorization(await administrationAuthorizationApi.effective());
      setAuthorizationReady(true);
    } catch {
      setAuthenticated(Boolean(getRealmAccessToken('administration')));
      setAuthorization(null);
      setAuthorizationReady(false);
    }
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
    setAuthorizationReady(false);
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
      authorizationReady,
      login,
      refreshAuthorization,
      logout,
      hasPermission: (code: string) =>
        Boolean(authorization?.permissions.some((p) => p.code === code)),
    }),
    [
      authenticated,
      authorization,
      authorizationReady,
      login,
      logout,
      refreshAuthorization,
      restoring,
    ],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useAdministrationSession() {
  const value = useContext(Context);
  if (!value) throw new Error('AdministrationSessionProvider is missing');
  return value;
}
