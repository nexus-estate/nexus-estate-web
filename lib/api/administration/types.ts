export interface AdminTokenPair {
  accessToken: string;
  refreshToken: string;
}
export type Platform = 'MARKETPLACE' | 'PROVIDER' | 'ADMINISTRATION';
export type SubjectType = 'CUSTOMER' | 'PROVIDER_MEMBERSHIP' | 'ADMINISTRATOR';
export type RoleStatus = 'ACTIVE' | 'DISABLED';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export interface AuthorizationPrincipal {
  id: string;
  code: string;
  name: string;
}
export interface AdministrationAuthorization {
  platform: 'ADMINISTRATION';
  isActive: boolean;
  roles: AuthorizationPrincipal[];
  permissions: Array<AuthorizationPrincipal & { category: string }>;
  authorizationVersion: string;
}
export type AdminAuthorization = AdministrationAuthorization;
export interface PlatformMetadata {
  platform: Platform;
  displayName: string;
  subjectType: SubjectType;
  supportsRoles: boolean;
  supportsAssignments: boolean;
}
export interface PlatformMetadataResponse {
  items: PlatformMetadata[];
}
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
export interface Paginated<T> {
  items: T[];
  meta: PaginationMeta;
}
export interface RoleAllowedActions {
  updateMetadata: boolean;
  updateStatus: boolean;
  updatePermissions: boolean;
  delete: boolean;
}
export interface AuthorizationRole {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  status: RoleStatus;
  version: number;
  permissionCount: number;
  assignmentCount: number;
  allowedActions: RoleAllowedActions;
  isEditable: boolean;
  isDeletable: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface AuthorizationPermission {
  id: string;
  code: string;
  name: string;
  description: string | null;
  platform: Platform;
  category: string;
  resource: string;
  action: string;
  riskLevel: RiskLevel;
  isAssignable: boolean;
  isDeprecated: boolean;
  deprecatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
export interface AuthorizationRoleDetail extends AuthorizationRole {
  permissions: AuthorizationPermission[];
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
  status?: RoleStatus;
  expectedVersion: number;
}
export interface ReplaceRolePermissionsRequest {
  permissionIds: string[];
  expectedVersion: number;
}
export interface ReplaceSubjectRolesRequest {
  roleIds: string[];
  reason?: string;
}
export type RoleListResponse = Paginated<AuthorizationRole>;
export type PermissionListResponse = Paginated<AuthorizationPermission>;

export interface AuthorizationRoleFilters {
  page?: number;
  limit?: number;
  q?: string;
  status?: RoleStatus;
  isSystem?: boolean;
  permissionCode?: string;
  sort?:
    | 'name'
    | 'code'
    | 'createdAt'
    | 'updatedAt'
    | 'assignmentCount'
    | 'permissionCount';
  order?: 'asc' | 'desc';
}

export interface AuthorizationPermissionFilters {
  page?: number;
  limit?: number;
  q?: string;
  category?: string;
  resource?: string;
  action?: string;
  riskLevel?: RiskLevel;
  isAssignable?: boolean;
  includeDeprecated?: boolean;
  sort?:
    | 'name'
    | 'code'
    | 'category'
    | 'resource'
    | 'action'
    | 'createdAt'
    | 'updatedAt';
  order?: 'asc' | 'desc';
}

export interface AuthorizationSubjectFilters {
  page?: number;
  limit?: number;
  q?: string;
  roleId?: string;
  status?: string;
}

export interface AuthorizationAuditFilters {
  page?: number;
  limit?: number;
  platform?: Platform;
  actorAdministratorId?: string;
  action?: string;
  targetType?: string;
  targetId?: string;
  from?: string;
  to?: string;
}

export type ProviderMemberFilters = AuthorizationSubjectFilters;
export interface MatrixResponse {
  roles: AuthorizationRole[];
  permissionGroups: Array<{
    category: string;
    permissions: Array<{
      id: string;
      code: string;
      name: string;
      riskLevel: RiskLevel;
    }>;
  }>;
  assignments: Record<string, string[]>;
}
export interface AuthorizationSubjectSummary {
  id: string;
  subjectType: SubjectType;
  displayName: string;
  secondaryText: string | null;
  status: string;
  roleCount: number;
  roleIds: string[];
}
export interface AuthorizationSubjectDetail extends AuthorizationSubjectSummary {
  roles: Array<{ id: string; code: string; name: string; status: string }>;
  permissions: AuthorizationPermission[];
  providerId?: string;
  providerDisplayName?: string;
  customerId?: string;
  customerEmail?: string;
}
export type AuthorizationSubjectDetailWire = Omit<
  AuthorizationSubjectDetail,
  'providerId' | 'providerDisplayName' | 'customerId' | 'customerEmail'
> & {
  provider_id?: string;
  provider_display_name?: string;
  customer_id?: string;
  customer_email?: string;
};
export type SubjectListResponse = Paginated<AuthorizationSubjectSummary>;
export interface AuthorizationAuditEvent {
  id: string;
  actorAdministratorId: string;
  platform: Platform;
  action: string;
  targetType: string;
  targetId: string | null;
  reason: string | null;
  beforeState: Record<string, unknown> | null;
  afterState: Record<string, unknown> | null;
  requestId: string | null;
  createdAt: string;
}
export type AuditListResponse = Paginated<AuthorizationAuditEvent>;
export interface ProviderMember {
  id: string;
  providerId: string;
  customerId: string;
  status: string;
  joinedAt: string;
  customerEmail: string;
  roleCodes: string[];
}
export type ProviderMemberListResponse = Paginated<ProviderMember>;
