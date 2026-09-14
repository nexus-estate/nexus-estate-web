import { administrationApiClient } from '../client';
import { buildSearchParams, type ApiFilters } from '../core/query';
import type {
  AdministrationAuthorization,
  AuthorizationPermission,
  AuthorizationRole,
  AuditListResponse,
  CreateRoleRequest,
  MatrixResponse,
  PermissionListResponse,
  Platform,
  PlatformMetadataResponse,
  ReplaceRolePermissionsRequest,
  ReplaceSubjectRolesRequest,
  RoleListResponse,
  SubjectListResponse,
  AuthorizationSubjectDetail,
  AuthorizationRoleDetail,
  ProviderMemberListResponse,
  UpdateRoleRequest,
} from './types';
const base = (platform: Platform) =>
  `/administration/authorization/${platform}`;
export const administrationAuthorizationApi = {
  effective: () =>
    administrationApiClient.get<AdministrationAuthorization>(
      '/administration/me/authorization',
    ),
  platforms: () =>
    administrationApiClient.get<PlatformMetadataResponse>(
      '/administration/authorization/platforms',
    ),
  audit: (filters: ApiFilters = {}) =>
    administrationApiClient.get<AuditListResponse>(
      `/administration/authorization/audit${buildSearchParams(filters) ? `?${buildSearchParams(filters)}` : ''}`,
    ),
  roles: (platform: Platform, filters: ApiFilters = {}) =>
    administrationApiClient.get<RoleListResponse>(
      `${base(platform)}/roles${buildSearchParams(filters) ? `?${buildSearchParams(filters)}` : ''}`,
    ),
  role: (platform: Platform, id: string) =>
    administrationApiClient.get<AuthorizationRoleDetail>(
      `${base(platform)}/roles/${id}`,
    ),
  createRole: (platform: Platform, data: CreateRoleRequest) =>
    administrationApiClient.post<AuthorizationRole>(
      `${base(platform)}/roles`,
      data,
    ),
  updateRole: (platform: Platform, id: string, data: UpdateRoleRequest) =>
    administrationApiClient.patch<AuthorizationRole>(
      `${base(platform)}/roles/${id}`,
      data,
    ),
  deleteRole: (platform: Platform, id: string) =>
    administrationApiClient.delete<unknown>(`${base(platform)}/roles/${id}`),
  replaceRolePermissions: (
    platform: Platform,
    id: string,
    data: ReplaceRolePermissionsRequest,
  ) =>
    administrationApiClient.put<AuthorizationRole>(
      `${base(platform)}/roles/${id}/permissions`,
      data,
    ),
  roleSubjects: (platform: Platform, id: string, filters: ApiFilters = {}) =>
    administrationApiClient.get<SubjectListResponse>(
      `${base(platform)}/roles/${id}/subjects${buildSearchParams(filters) ? `?${buildSearchParams(filters)}` : ''}`,
    ),
  permissions: (platform: Platform, filters: ApiFilters = {}) =>
    administrationApiClient.get<PermissionListResponse>(
      `${base(platform)}/permissions${buildSearchParams(filters) ? `?${buildSearchParams(filters)}` : ''}`,
    ),
  permission: (platform: Platform, id: string) =>
    administrationApiClient.get<AuthorizationPermission>(
      `${base(platform)}/permissions/${id}`,
    ),
  permissionRoles: (platform: Platform, id: string) =>
    administrationApiClient.get<{ items: AuthorizationRole[] }>(
      `${base(platform)}/permissions/${id}/roles`,
    ),
  matrix: (platform: Platform) =>
    administrationApiClient.get<MatrixResponse>(`${base(platform)}/matrix`),
  subjects: (platform: Platform, filters: ApiFilters = {}) =>
    administrationApiClient.get<SubjectListResponse>(
      `${base(platform)}/subjects${buildSearchParams(filters) ? `?${buildSearchParams(filters)}` : ''}`,
    ),
  subject: (platform: Platform, id: string) =>
    administrationApiClient.get<AuthorizationSubjectDetail>(
      `${base(platform)}/subjects/${id}`,
    ),
  replaceSubjectRoles: (
    platform: Platform,
    id: string,
    data: ReplaceSubjectRolesRequest,
  ) =>
    administrationApiClient.put<AuthorizationSubjectDetail>(
      `${base(platform)}/subjects/${id}/roles`,
      data,
    ),
  providerMembers: (providerId: string, filters: ApiFilters = {}) =>
    administrationApiClient.get<ProviderMemberListResponse>(
      `/administration/providers/${providerId}/members${buildSearchParams(filters) ? `?${buildSearchParams(filters)}` : ''}`,
    ),
};
