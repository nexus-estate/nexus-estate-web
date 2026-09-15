import type {
  AuthorizationPermission,
  AuthorizationPrincipal,
} from '../customer/types';
export type ProviderType = 'INDIVIDUAL' | 'BROKER' | 'AGENCY';
export type ProviderStatus = 'ACTIVE' | 'SUSPENDED';
export type ProviderVerificationStatus =
  'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
export type ProviderMembershipStatus = 'ACTIVE' | 'SUSPENDED' | 'REMOVED';
export interface ProviderAccount {
  id: string;
  type: ProviderType;
  displayName: string;
  status: 'ACTIVE' | 'SUSPENDED';
  verificationStatus: 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}
export interface ProviderRegistrationResponse {
  customerId?: string;
  providerAccount: ProviderAccount;
}
export interface ProviderRegistrationReview {
  id: string;
  owner: {
    id: string;
    email: string;
    isEmailVerified: boolean;
    lastLogin: string | null;
    createdAt: string;
    updatedAt: string;
  };
  providerAccount: ProviderAccount;
}
export interface RegisterProviderFromCustomerRequest {
  type: ProviderType;
  displayName: string;
}
export type CreateProviderAccountRequest = RegisterProviderFromCustomerRequest;
export interface UpdateProviderAccountRequest {
  displayName?: string;
}
export interface ProviderAuthorization {
  platform: 'PROVIDER';
  providerId: string | null;
  membershipId: string | null;
  roles: AuthorizationPrincipal[];
  permissions: AuthorizationPermission[];
  providerStatus: ProviderStatus | null;
  verificationStatus: ProviderVerificationStatus | null;
  membershipStatus: ProviderMembershipStatus | null;
  providerDisplayName?: string;
  authorizationVersion: string;
}
