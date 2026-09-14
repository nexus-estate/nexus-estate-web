export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}
export interface CustomerProfile {
  id: string;
  email: string;
  isEmailVerified: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}
export interface EffectiveAuthorization {
  permissions?: Array<{ code: string; [key: string]: unknown }>;
  permissionCodes?: string[];
  [key: string]: unknown;
}
