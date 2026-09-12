import type { User } from '../auth/auth.types';

export type { User } from '../auth/auth.types';

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

export interface ChangePasswordResponse {
  message: string;
}

export type UserResponse = User;
