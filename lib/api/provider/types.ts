export interface ProviderAccount {
  id: string;
  [key: string]: unknown;
}
export interface ProviderAuthorization {
  membershipStatus?: string;
  providerStatus?: string;
  verificationStatus?: string;
  permissions?: Array<{ code: string }>;
  permissionCodes?: string[];
  [key: string]: unknown;
}
