'use client';

import { useState, useCallback } from 'react';
import { apiClient, setAccessToken } from '@/lib/api-client';
import type {
  User,
  LoginRequest,
  RegisterRequest,
  LoginResponse,
} from '@/lib/sdk';

const TOKEN_KEY = 'nexus_access_token';
const USER_KEY = 'nexus_user';

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  getProfile: () => Promise<void>;
}

function isUser(value: unknown): value is User {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' && typeof candidate.email === 'string'
  );
}

function parseStoredUser(raw: string): User | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (isUser(parsed)) return parsed;
    return null;
  } catch {
    return null;
  }
}

function initializeUser(): User | null {
  if (typeof window === 'undefined') return null;
  const storedUser = localStorage.getItem(USER_KEY);
  const storedToken = localStorage.getItem(TOKEN_KEY);
  if (storedUser && storedToken) {
    const parsed = parseStoredUser(storedUser);
    if (parsed) {
      setAccessToken(storedToken);
      return parsed;
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
  return null;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(initializeUser);
  const isLoading = false;

  const persistAuth = useCallback((payload: LoginResponse): void => {
    localStorage.setItem(TOKEN_KEY, payload.accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(payload.user));
    setAccessToken(payload.accessToken);
    setUser(payload.user);
  }, []);

  const login = useCallback(
    async (data: LoginRequest): Promise<void> => {
      const response = await apiClient.post<LoginResponse>('/auth/login', data);
      persistAuth(response.data);
    },
    [persistAuth],
  );

  const register = useCallback(
    async (data: RegisterRequest): Promise<void> => {
      const response = await apiClient.post<LoginResponse>(
        '/auth/register',
        data,
      );
      persistAuth(response.data);
    },
    [persistAuth],
  );

  const logout = useCallback((): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setAccessToken(null);
    setUser(null);
  }, []);

  const getProfile = useCallback(async (): Promise<void> => {
    try {
      const response = await apiClient.get<User>('/auth/profile');
      const freshUser: User = response.data;

      localStorage.setItem(USER_KEY, JSON.stringify(freshUser));
      setUser(freshUser);
    } catch {
      logout();
    }
  }, [logout]);

  return {
    user,
    isLoading,
    isAuthenticated: user !== null,
    login,
    register,
    logout,
    getProfile,
  };
}
