import { administrationApiClient } from '../client';
import type {
  AdminAuthorization,
  AuthorizationPermission,
  AuthorizationRole,
  Platform,
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
    administrationApiClient.get<unknown>(
      `/administration/authorization/audit${query ? `?${query}` : ''}`,
    ),
  roles: (platform: Platform, query = '') =>
    administrationApiClient.get<{ items: AuthorizationRole[]; total?: number }>(
      `${base(platform)}/roles${query ? `?${query}` : ''}`,
    ),
  role: (platform: Platform, id: string) =>
    administrationApiClient.get<
      AuthorizationRole & { permissions?: AuthorizationPermission[] }
    >(`${base(platform)}/roles/${id}`),
  createRole: (platform: Platform, data: Record<string, unknown>) =>
    administrationApiClient.post<AuthorizationRole>(
      `${base(platform)}/roles`,
      data,
    ),
  updateRole: (platform: Platform, id: string, data: Record<string, unknown>) =>
    administrationApiClient.patch<AuthorizationRole>(
      `${base(platform)}/roles/${id}`,
      data,
    ),
  deleteRole: (platform: Platform, id: string) =>
    administrationApiClient.delete<unknown>(`${base(platform)}/roles/${id}`),
  replaceRolePermissions: (
    platform: Platform,
    id: string,
    data: Record<string, unknown>,
  ) =>
    administrationApiClient.put<AuthorizationRole>(
      `${base(platform)}/roles/${id}/permissions`,
      data,
    ),
  permissions: (platform: Platform, query = '') =>
    administrationApiClient.get<{ items: AuthorizationPermission[] }>(
      `${base(platform)}/permissions${query ? `?${query}` : ''}`,
    ),
  matrix: (platform: Platform) =>
    administrationApiClient.get<unknown>(`${base(platform)}/matrix`),
  subjects: (platform: Platform, query = '') =>
    administrationApiClient.get<unknown>(
      `${base(platform)}/subjects${query ? `?${query}` : ''}`,
    ),
  subject: (platform: Platform, id: string) =>
    administrationApiClient.get<unknown>(`${base(platform)}/subjects/${id}`),
  replaceSubjectRoles: (
    platform: Platform,
    id: string,
    data: Record<string, unknown>,
  ) =>
    administrationApiClient.put<unknown>(
      `${base(platform)}/subjects/${id}/roles`,
      data,
    ),
};
