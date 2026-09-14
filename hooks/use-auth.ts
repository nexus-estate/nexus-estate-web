'use client';
import { useCallback, useSyncExternalStore } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getRealmAccessToken, setRealmAccessToken } from '@/lib/api/client';
import { customerAuthenticationApi } from '@/lib/api/customer/authentication.api';
import { customerAuthorizationApi } from '@/lib/api/customer/authorization.api';
import type {
  CustomerAccount,
  LoginCustomerRequest,
  RegisterCustomerRequest,
} from '@/lib/api/customer/types';
const USER_KEY = 'nexus.customer.user';
const REFRESH_KEY = 'nexus.customer.refresh_token';
const listeners = new Set<() => void>();
let currentUser: CustomerAccount | null = null;
let initialized = false;
const isUser = (v: unknown): v is CustomerAccount =>
  typeof v === 'object' &&
  v !== null &&
  typeof (v as CustomerAccount).id === 'string' &&
  typeof (v as CustomerAccount).email === 'string';
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
const normalize = (p: CustomerAccount): CustomerAccount => p;
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
  const publish = (next: CustomerAccount | null) => {
    currentUser = next;
    listeners.forEach((fn) => fn());
  };
  const getProfile = useCallback(async () => {
    const next = normalize(await customerAuthenticationApi.profile());
    localStorage.setItem(USER_KEY, JSON.stringify(next));
    publish(next);
    return next;
  }, []);
  const login = useCallback(
    async (data: LoginCustomerRequest) => {
      const pair = await customerAuthenticationApi.login(data);
      localStorage.setItem('nexus.customer.access_token', pair.accessToken);
      localStorage.setItem(REFRESH_KEY, pair.refreshToken);
      setRealmAccessToken('customer', pair.accessToken);
      await getProfile();
    },
    [getProfile],
  );
  const register = useCallback(async (data: RegisterCustomerRequest) => {
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
    status:
      user === null && !initialized
        ? ('restoring' as const)
        : user
          ? ('authenticated' as const)
          : ('anonymous' as const),
    isLoading: user === null && !initialized,
    isAuthenticated: user !== null,
    login,
    register,
    logout,
    getProfile,
    refreshUser: getProfile,
    hasMarketplacePermission: (code: string) =>
      Boolean(
        authorization.data?.permissions?.some(
          (permission) => permission.code === code,
        ),
      ),
  };
}
