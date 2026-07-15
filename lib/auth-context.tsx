'use client';

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from 'react';
import { api } from './api';
import type { User, SignupRequest } from './types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signin: (email: string, password: string) => Promise<void>;
  signup: (data: SignupRequest) => Promise<void>;
  signout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function initializeUser(): User | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('nexus_user');
  const token = localStorage.getItem('nexus_access_token');
  if (stored && token) {
    try {
      return JSON.parse(stored) as User;
    } catch {
      localStorage.removeItem('nexus_user');
      localStorage.removeItem('nexus_access_token');
    }
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(initializeUser);
  const isLoading = false;

  const signin = useCallback(async (email: string, password: string) => {
    const data = await api.signin({ email, password });
    localStorage.setItem('nexus_access_token', data.accessToken);
    localStorage.setItem('nexus_user', JSON.stringify(data.user));
    setUser(data.user);
  }, []);

  const signup = useCallback(async (data: SignupRequest) => {
    await api.signup(data);
  }, []);

  const signout = useCallback(() => {
    localStorage.removeItem('nexus_access_token');
    localStorage.removeItem('nexus_user');
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!user) return;
    try {
      const fresh = await api.getUser(user.id);
      localStorage.setItem('nexus_user', JSON.stringify(fresh));
      setUser(fresh);
    } catch {
      // If token expired or user deleted, sign out
      signout();
    }
  }, [user, signout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        signin,
        signup,
        signout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
