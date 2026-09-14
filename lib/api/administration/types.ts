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
export interface CreateRoleRequest {
  code: string;
  name: string;
  description?: string | null;
  permissionIds?: string[];
}
export interface UpdateRoleRequest {
  name?: string;
  description?: string | null;
  status?: string;
  expectedVersion: number;
}
export interface ReplaceRolePermissionsRequest {
  permissionIds: string[];
  expectedVersion: number;
}
export interface ReplaceSubjectRolesRequest {
  roleIds: string[];
  expectedVersion?: number;
  reason?: string;
}
export interface RoleListResponse {
  items: AuthorizationRole[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}
export interface PermissionListResponse {
  items: AuthorizationPermission[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}
export interface MatrixResponse {
  roles: AuthorizationRole[];
  permissions: AuthorizationPermission[];
  assignments?: Record<string, string[]>;
  [key: string]: unknown;
}
export interface SubjectSummary {
  id: string;
  displayName?: string;
  email?: string;
  roles?: AuthorizationRole[];
  [key: string]: unknown;
}
export interface SubjectListResponse {
  items: SubjectSummary[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}
export interface AuditListResponse {
  items: Array<{
    id?: string;
    action?: string;
    actor?: string;
    platform?: Platform;
    requestId?: string;
    createdAt?: string;
    beforeState?: unknown;
    afterState?: unknown;
  }>;
  total?: number;
}
