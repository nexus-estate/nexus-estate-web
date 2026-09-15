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
  AuthorizationSubjectDetailWire,
} from './types';
const base = (platform: Platform) =>
  `/administration/authorization/${platform}`;
const normalizeSubjectDetail = (
  wire: AuthorizationSubjectDetailWire,
): AuthorizationSubjectDetail => ({
  ...wire,
  providerId: wire.provider_id,
  providerDisplayName: wire.provider_display_name,
  customerId: wire.customer_id,
  customerEmail: wire.customer_email,
});
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
  rolesAll: async (platform: Platform, filters: ApiFilters = {}) => {
    const { page: _page, ...rest } = filters;
    const limit = rest.limit ?? 100;
    const items: AuthorizationRole[] = [];
    let page = 1;
    let last: RoleListResponse | undefined;

    do {
      last = await administrationAuthorizationApi.roles(platform, {
        ...rest,
        page,
        limit,
      });
      items.push(...last.items);
      page += 1;
    } while (last.meta.hasNextPage || page <= last.meta.totalPages);

    return {
      ...last,
      items,
      meta: {
        ...last.meta,
        page: 1,
        limit,
        total: items.length,
        totalPages: items.length ? 1 : 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  },
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
  subject: async (platform: Platform, id: string) =>
    normalizeSubjectDetail(
      await administrationApiClient.get<AuthorizationSubjectDetailWire>(
        `${base(platform)}/subjects/${id}`,
      ),
    ),
  replaceSubjectRoles: async (
    platform: Platform,
    id: string,
    data: ReplaceSubjectRolesRequest,
  ) =>
    normalizeSubjectDetail(
      await administrationApiClient.put<AuthorizationSubjectDetailWire>(
        `${base(platform)}/subjects/${id}/roles`,
        data,
      ),
    ),
  providerMembers: (providerId: string, filters: ApiFilters = {}) =>
    administrationApiClient.get<ProviderMemberListResponse>(
      `/administration/providers/${providerId}/members${buildSearchParams(filters) ? `?${buildSearchParams(filters)}` : ''}`,
    ),
};
