export interface AdminTokenPair {
  accessToken: string;
  refreshToken: string;
}
export type Platform = 'MARKETPLACE' | 'PROVIDER' | 'ADMINISTRATION';
export interface AdminAuthorization {
  permissions?: Array<{ code: string }>;
  permissionCodes?: string[];
  [key: string]: unknown;
}
export interface AuthorizationRole {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  status?: string;
  isSystem?: boolean;
  permissionCount?: number;
  assignmentCount?: number;
  allowedActions?: string[];
  isDeletable?: boolean;
  version: number;
  updatedAt?: string;
}
export interface AuthorizationPermission {
  id: string;
  code: string;
  name?: string;
  category?: string;
  resource?: string;
  action?: string;
  riskLevel?: string;
  isAssignable?: boolean;
  isDeprecated?: boolean;
  description?: string;
}
