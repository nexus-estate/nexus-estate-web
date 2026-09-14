import { administrationApiClient } from '../client';
import type {
  AdminAuthorization,
  AuthorizationPermission,
  AuthorizationRole,
  AuditListResponse,
  CreateRoleRequest,
  MatrixResponse,
  PermissionListResponse,
  Platform,
  ReplaceRolePermissionsRequest,
  ReplaceSubjectRolesRequest,
  RoleListResponse,
  SubjectListResponse,
  UpdateRoleRequest,
} from './types';
const base = (platform: Platform) =>
  `/administration/authorization/${platform}`;
export const administrationAuthorizationApi = {
  effective: () =>
    administrationApiClient.get<AdminAuthorization>(
      '/administration/me/authorization',
    ),
  platforms: () =>
    administrationApiClient.get<Platform[]>(
      '/administration/authorization/platforms',
    ),
  audit: (query = '') =>
    administrationApiClient.get<AuditListResponse>(
      `/administration/authorization/audit${query ? `?${query}` : ''}`,
    ),
  roles: (platform: Platform, query = '') =>
    administrationApiClient.get<RoleListResponse>(
      `${base(platform)}/roles${query ? `?${query}` : ''}`,
    ),
  role: (platform: Platform, id: string) =>
    administrationApiClient.get<
      AuthorizationRole & { permissions?: AuthorizationPermission[] }
    >(`${base(platform)}/roles/${id}`),
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
  roleSubjects: (platform: Platform, id: string, query = '') =>
    administrationApiClient.get<SubjectListResponse>(
      `${base(platform)}/roles/${id}/subjects${query ? `?${query}` : ''}`,
    ),
  permissions: (platform: Platform, query = '') =>
    administrationApiClient.get<PermissionListResponse>(
      `${base(platform)}/permissions${query ? `?${query}` : ''}`,
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
  subjects: (platform: Platform, query = '') =>
    administrationApiClient.get<SubjectListResponse>(
      `${base(platform)}/subjects${query ? `?${query}` : ''}`,
    ),
  subject: (platform: Platform, id: string) =>
    administrationApiClient.get<unknown>(`${base(platform)}/subjects/${id}`),
  replaceSubjectRoles: (
    platform: Platform,
    id: string,
    data: ReplaceSubjectRolesRequest,
  ) =>
    administrationApiClient.put<unknown>(
      `${base(platform)}/subjects/${id}/roles`,
      data,
    ),
  providerMembers: (providerId: string) =>
    administrationApiClient.get<SubjectListResponse>(
      `/administration/providers/${providerId}/members`,
    ),
};
