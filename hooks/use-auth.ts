'use client';

import { useCallback, useSyncExternalStore } from 'react';
import axios from 'axios';
import { apiClient, setAccessToken } from '@/lib/api-client';
import type { User } from '@/lib/sdk';

const ACCESS_TOKEN_KEY = 'nexus_access_token';
const REFRESH_TOKEN_KEY = 'nexus_refresh_token';
const USER_KEY = 'nexus_user';

type LoginRequest = { email: string; password: string };
type RegisterRequest = LoginRequest;
type TokenPair = { accessToken: string; refreshToken: string };
type AuthenticatedPrincipal = {
  id: string;
  email: string;
  roleId: string;
  role: string;
};

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

function getAuthError(error: unknown, fallback: string): Error {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error : new Error(fallback);
  }

  const payload: unknown = error.response?.data;
  if (typeof payload === 'object' && payload !== null) {
    if ('message' in payload) {
      const message = payload.message;
      if (typeof message === 'string') return new Error(message);
      if (Array.isArray(message)) return new Error(message.join(', '));
    }
    if ('error' in payload && typeof payload.error === 'string') {
      return new Error(payload.error);
    }
  }

  return new Error(fallback);
}

function normalizePrincipal(principal: AuthenticatedPrincipal): User {
  return {
    id: principal.id,
    email: principal.email,
    fullName: principal.email.split('@')[0],
    roleId: principal.roleId,
    role: { id: principal.roleId, name: principal.role },
  };
}

export function useAuth() {
  const user = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const getProfile = useCallback(async () => {
    try {
      const response =
        await apiClient.get<AuthenticatedPrincipal>('/auth/profile');
      const freshUser = normalizePrincipal(response.data);
      localStorage.setItem(USER_KEY, JSON.stringify(freshUser));
      publish(freshUser);
      return freshUser;
    } catch (error: unknown) {
      throw getAuthError(error, 'Không thể tải thông tin tài khoản.');
    }
  }, []);

  const login = useCallback(
    async (data: LoginRequest) => {
      try {
        const response = await apiClient.post<TokenPair>('/auth/login', {
          email: data.email.trim(),
          password: data.password,
        });
        localStorage.setItem(ACCESS_TOKEN_KEY, response.data.accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, response.data.refreshToken);
        setAccessToken(response.data.accessToken);
        await getProfile();
      } catch (error: unknown) {
        throw getAuthError(
          error,
          'Không thể đăng nhập. Vui lòng kiểm tra lại thông tin.',
        );
      }
    },
    [getProfile],
  );

  const register = useCallback(async (data: RegisterRequest) => {
    try {
      await apiClient.post('/auth/register', {
        email: data.email.trim(),
        password: data.password,
      });
    } catch (error: unknown) {
      throw getAuthError(error, 'Không thể tạo tài khoản. Vui lòng thử lại.');
    }
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
  };
}
