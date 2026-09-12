'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { authApi } from '@/lib/api/auth/auth.api';
import type {
  AuthenticatedPrincipal,
  LoginRequest,
  RegisterRequest,
  User,
} from '@/lib/api/auth/auth.types';
import { setAccessToken } from '@/lib/api/client';

const ACCESS_TOKEN_KEY = 'nexus_access_token';
const REFRESH_TOKEN_KEY = 'nexus_refresh_token';
const USER_KEY = 'nexus_user';

type AuthListener = () => void;
const listeners = new Set<AuthListener>();
let currentUser: User | null = null;
let initialized = false;

function isUser(value: unknown): value is User {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' && typeof candidate.email === 'string'
  );
}

function readSession(): User | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (!raw || !token) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (isUser(parsed)) {
      setAccessToken(token);
      return parsed;
    }
  } catch {
    // A malformed session is cleared below.
  }
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  return null;
}

function initializeSession() {
  if (!initialized && typeof window !== 'undefined') {
    currentUser = readSession();
    initialized = true;
  }
  return currentUser;
}

function publish(user: User | null) {
  currentUser = user;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: AuthListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return initializeSession();
}

function getServerSnapshot() {
  return null;
}

function normalizePrincipal(principal: AuthenticatedPrincipal): User {
  const role = principal.role;
  return {
    id: principal.id,
    email: principal.email,
    fullName: principal.fullName || principal.email.split('@')[0],
    username: principal.username,
    roleId: principal.roleId,
    role:
      typeof role === 'object'
        ? role
        : role && principal.roleId
          ? { id: principal.roleId, name: role }
          : undefined,
    profile: principal.profile,
  };
}

export function useAuth() {
  const user = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const getProfile = useCallback(async () => {
    const response = await authApi.getProfile();
    const freshUser = normalizePrincipal(response);
    localStorage.setItem(USER_KEY, JSON.stringify(freshUser));
    publish(freshUser);
  }, []);

  const login = useCallback(
    async (data: LoginRequest) => {
      const response = await authApi.login(data);
      localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
      if (response.refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
      }
      setAccessToken(response.accessToken);
      await getProfile();
    },
    [getProfile],
  );

  const register = useCallback(async (data: RegisterRequest) => {
    await authApi.register(data);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setAccessToken(null);
    publish(null);
  }, []);

  return {
    user,
    isLoading: false,
    isAuthenticated: user !== null,
    login,
    register,
    logout,
    getProfile,
    refreshUser: getProfile,
  };
}
