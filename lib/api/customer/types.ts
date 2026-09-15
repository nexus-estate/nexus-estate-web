export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}
export interface RegisterCustomerRequest {
  email: string;
  password: string;
}
export interface LoginCustomerRequest {
  email: string;
  password: string;
}
export interface CustomerAccount {
  id: string;
  email: string;
  isEmailVerified: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
  roleId?: string | null;
  role?: {
    id: string;
    name: string;
    description: string | null;
    isSystem: boolean;
  };
}
export interface AuthorizationPrincipal {
  id: string;
  code: string;
  name: string;
}
export interface AuthorizationPermission {
  id: string;
  code: string;
  name: string;
  category: string;
}
export interface EffectiveMarketplaceAuthorization {
  platform: 'MARKETPLACE';
  roles: AuthorizationPrincipal[];
  permissions: AuthorizationPermission[];
  authorizationVersion: string;
}
/** @deprecated Use CustomerAccount. */ export type CustomerProfile =
  CustomerAccount;
/** @deprecated Use EffectiveMarketplaceAuthorization. */ export type EffectiveAuthorization =
  EffectiveMarketplaceAuthorization;
