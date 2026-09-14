export interface ProviderAccount {
  id: string;
  type: 'INDIVIDUAL' | 'BROKER' | 'AGENCY';
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
export interface CreateProviderAccountRequest {
  type: ProviderAccount['type'];
  displayName: string;
}
export interface UpdateProviderAccountRequest {
  displayName: string;
}
export interface ProviderAuthorization {
  membershipStatus?: string;
  providerStatus?: string;
  verificationStatus?: string;
  permissions?: Array<{ code: string }>;
  permissionCodes?: string[];
  [key: string]: unknown;
}
