// ─── User Entity ──────────────────────────────────────────────
export enum UserRole {
  ADMIN = 'ADMIN',
  BUYER = 'BUYER',
  BROKER = 'BROKER',
}

export interface UserProfile {
  id: number;
  userId: number;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  bio: string | null;
  dateOfBirth: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  followersCount: number;
  followingCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
  role: UserRole;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  profile: UserProfile;
}

// ─── Auth DTOs ─────────────────────────────────────────────────
export interface SignupRequest {
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
  avatar?: string;
  bio?: string;
}

export interface SigninRequest {
  email: string;
  password: string;
}

export interface SigninResponse {
  user: User;
  accessToken: string;
  expiresIn: string;
}

export interface SignupResponse {
  user: User;
  message: string;
}

// ─── Update Profile DTO ────────────────────────────────────────
export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  country?: string;
}

// ─── Follow Entity ─────────────────────────────────────────────
export interface Follow {
  id: number;
  followerId: number;
  followingId: number;
  createdAt: string;
}