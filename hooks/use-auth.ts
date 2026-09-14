'use client';
import { useCallback, useSyncExternalStore } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  AuthenticatedPrincipal,
  LoginRequest,
  RegisterRequest,
  User,
} from '@/lib/api/auth/auth.types';
import { getRealmAccessToken, setRealmAccessToken } from '@/lib/api/client';
import { customerAuthenticationApi } from '@/lib/api/customer/authentication.api';
import { customerAuthorizationApi } from '@/lib/api/customer/authorization.api';
const USER_KEY = 'nexus.customer.user';
const REFRESH_KEY = 'nexus.customer.refresh_token';
const listeners = new Set<() => void>();
let currentUser: User | null = null;
let initialized = false;
const isUser = (v: unknown): v is User =>
  typeof v === 'object' &&
  v !== null &&
  typeof (v as User).id === 'string' &&
  typeof (v as User).email === 'string';
function restore() {
  if (typeof window === 'undefined') return null;
  const token = getRealmAccessToken('customer');
  const raw = localStorage.getItem(USER_KEY);
  if (!token || !raw) return null;
  try {
    const value = JSON.parse(raw);
    return isUser(value) ? value : null;
  } catch {
    return null;
  }
}
function snapshot() {
  if (!initialized && typeof window !== 'undefined') {
    currentUser = restore();
    initialized = true;
  }
  return currentUser;
}
const normalize = (p: AuthenticatedPrincipal): User => ({
  ...p,
  fullName: p.fullName || p.email.split('@')[0],
  role: typeof p.role === 'object' ? p.role : undefined,
});
export function useAuth() {
  const user = useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    snapshot,
    () => null,
  );
  const queryClient = useQueryClient();
  const authorization = useQuery({
    queryKey: ['marketplace', 'me', 'authorization'],
    queryFn: customerAuthorizationApi.effective,
    enabled: user !== null,
  });
  const publish = (next: User | null) => {
    currentUser = next;
    listeners.forEach((fn) => fn());
  };
  const getProfile = useCallback(async () => {
    const next = normalize(
      (await customerAuthenticationApi.profile()) as AuthenticatedPrincipal,
    );
    localStorage.setItem(USER_KEY, JSON.stringify(next));
    publish(next);
    return next;
  }, []);
  const login = useCallback(
    async (data: LoginRequest) => {
      const pair = await customerAuthenticationApi.login(data);
      localStorage.setItem('nexus.customer.access_token', pair.accessToken);
      localStorage.setItem(REFRESH_KEY, pair.refreshToken);
      setRealmAccessToken('customer', pair.accessToken);
      await getProfile();
    },
    [getProfile],
  );
  const register = useCallback(async (data: RegisterRequest) => {
    await customerAuthenticationApi.register(data);
  }, []);
  const logout = useCallback(async () => {
    const refresh = localStorage.getItem(REFRESH_KEY);
    if (refresh) {
      try {
        await customerAuthenticationApi.logout(refresh);
      } catch {
        /* session cleanup remains authoritative locally */
      }
    }
    ['nexus.customer.access_token', REFRESH_KEY, USER_KEY].forEach((key) =>
      localStorage.removeItem(key),
    );
    setRealmAccessToken('customer', null);
    publish(null);
    queryClient.removeQueries({ queryKey: ['marketplace'] });
    queryClient.removeQueries({ queryKey: ['provider'] });
  }, [queryClient]);
  return {
    user,
    isLoading: false,
    isAuthenticated: user !== null,
    login,
    register,
    logout,
    getProfile,
    refreshUser: getProfile,
    hasMarketplacePermission: (code: string) =>
      Boolean(
        authorization.data?.permissionCodes?.includes(code) ||
        authorization.data?.permissions?.some(
          (permission) => permission.code === code,
        ),
      ),
  };
}
