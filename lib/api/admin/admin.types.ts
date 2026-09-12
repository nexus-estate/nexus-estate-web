import type { User } from '../auth/auth.types';

export interface AdminOverview {
  totalUsers: number;
  totalBrokers: number;
  totalListings: number;
}

export type AdminUser = User;
