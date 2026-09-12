export interface UserRole {
  id: string;
  name: string;
  description?: string | null;
}

export interface UserProfile {
  id?: string;
  userId?: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  dateOfBirth?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  followersCount?: number;
  followingCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  email: string;
  username?: string | null;
  fullName?: string;
  roleId?: string;
  role?: UserRole;
  isActive?: boolean;
  isEmailVerified?: boolean;
  lastLogin?: string | null;
  createdAt?: string;
  updatedAt?: string;
  profile?: UserProfile | null;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName?: string;
  username?: string;
  phoneNumber?: string;
  avatar?: string;
  bio?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken?: string;
}

export interface AuthenticatedPrincipal {
  id: string;
  email: string;
  username?: string | null;
  fullName?: string;
  roleId?: string;
  role?: UserRole | string;
  profile?: UserProfile | null;
}
