import type { ProviderAccount } from '../provider/types';
export interface ProviderRegistrationOwner {
  id: string;
  email: string;
  isEmailVerified: boolean;
  role: string;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}
export interface ProviderRegistrationReview {
  id: string;
  owner: ProviderRegistrationOwner;
  providerAccount: ProviderAccount;
}
