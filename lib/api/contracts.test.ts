import type {
  AuthorizationAuditEvent,
  MatrixResponse,
  PlatformMetadataResponse,
  RoleAllowedActions,
  SubjectListResponse,
  AuthorizationSubjectDetailWire,
  RoleListResponse,
} from './administration/types';
import type { RegisterCustomerRequest } from './customer/types';
import type { ProviderType } from './provider/types';

test('PR31 response contracts remain exact at the frontend boundary', () => {
  const registration = {
    email: 'customer@example.com',
    password: 'password123',
  } satisfies RegisterCustomerRequest;
  const providerType: ProviderType = 'AGENCY';
  const platforms = {
    items: [
      {
        platform: 'MARKETPLACE',
        displayName: 'Marketplace',
        subjectType: 'CUSTOMER',
        supportsRoles: true,
        supportsAssignments: true,
      },
    ],
  } satisfies PlatformMetadataResponse;
  const actions = {
    updateMetadata: true,
    updateStatus: false,
    updatePermissions: true,
    delete: false,
  } satisfies RoleAllowedActions;
  const matrix = {
    roles: [],
    permissionGroups: [],
    assignments: {},
  } satisfies MatrixResponse;
  const subjects = {
    items: [],
    meta: {
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  } satisfies SubjectListResponse;
  const audit = {
    id: 'audit',
    actorAdministratorId: 'admin',
    platform: 'ADMINISTRATION',
    action: 'read',
    targetType: 'role',
    targetId: null,
    reason: null,
    beforeState: null,
    afterState: null,
    requestId: 'req',
    createdAt: new Date().toISOString(),
  } satisfies AuthorizationAuditEvent;
  expect(registration).toEqual({
    email: 'customer@example.com',
    password: 'password123',
  });
  expect(providerType).toBe('AGENCY');
  expect(platforms.items).toHaveLength(1);
  expect(actions.updatePermissions).toBe(true);
  expect(matrix.permissionGroups).toEqual([]);
  expect(subjects.meta.page).toBe(1);
  expect(audit.actorAdministratorId).toBe('admin');
});

test('normalizes provider subject wire fields at the administration API boundary', async () => {
  const { administrationAuthorizationApi } =
    await import('./administration/authorization.api');
  const wire: AuthorizationSubjectDetailWire = {
    id: 'membership-1',
    subjectType: 'PROVIDER_MEMBERSHIP',
    displayName: 'Nexus Realty',
    secondaryText: 'owner@example.com',
    status: 'ACTIVE',
    roleCount: 1,
    roleIds: ['role-1'],
    roles: [],
    permissions: [],
    provider_id: 'provider-1',
    provider_display_name: 'Nexus Realty',
    customer_id: 'customer-1',
    customer_email: 'owner@example.com',
  };
  jest
    .spyOn((await import('./client')).administrationApiClient, 'get')
    .mockResolvedValueOnce(wire);
  await expect(
    administrationAuthorizationApi.subject('PROVIDER', 'membership-1'),
  ).resolves.toMatchObject({
    providerId: 'provider-1',
    providerDisplayName: 'Nexus Realty',
    customerId: 'customer-1',
    customerEmail: 'owner@example.com',
  });
});

test('normalizes provider subject mutation responses at the same boundary', async () => {
  const { administrationAuthorizationApi } =
    await import('./administration/authorization.api');
  const wire: AuthorizationSubjectDetailWire = {
    id: 'membership-1',
    subjectType: 'PROVIDER_MEMBERSHIP',
    displayName: 'Nexus Realty',
    secondaryText: 'owner@example.com',
    status: 'ACTIVE',
    roleCount: 1,
    roleIds: ['role-1'],
    roles: [],
    permissions: [],
    provider_id: 'provider-1',
    provider_display_name: 'Nexus Realty',
    customer_id: 'customer-1',
    customer_email: 'owner@example.com',
  };
  jest
    .spyOn((await import('./client')).administrationApiClient, 'put')
    .mockResolvedValueOnce(wire);

  await expect(
    administrationAuthorizationApi.replaceSubjectRoles(
      'PROVIDER',
      'membership-1',
      {
        roleIds: ['role-1'],
      },
    ),
  ).resolves.toMatchObject({
    providerId: 'provider-1',
    providerDisplayName: 'Nexus Realty',
    customerId: 'customer-1',
    customerEmail: 'owner@example.com',
  });
});

test('loads all pages when building a complete role catalogue', async () => {
  jest.restoreAllMocks();
  const { administrationAuthorizationApi } =
    await import('./administration/authorization.api');
  const firstPage: RoleListResponse = {
    items: [],
    meta: {
      total: 101,
      page: 1,
      limit: 100,
      totalPages: 2,
      hasNextPage: true,
      hasPreviousPage: false,
    },
  };
  const secondPage: RoleListResponse = {
    items: [],
    meta: {
      total: 101,
      page: 2,
      limit: 100,
      totalPages: 2,
      hasNextPage: false,
      hasPreviousPage: true,
    },
  };
  const get = jest
    .spyOn((await import('./client')).administrationApiClient, 'get')
    .mockResolvedValueOnce(firstPage)
    .mockResolvedValueOnce(secondPage);

  await expect(
    administrationAuthorizationApi.rolesAll('PROVIDER', {
      status: 'ACTIVE',
      limit: 100,
    }),
  ).resolves.toMatchObject({
    items: [],
    meta: { total: 0, totalPages: 0, hasNextPage: false },
  });
  expect(get).toHaveBeenNthCalledWith(
    1,
    '/administration/authorization/PROVIDER/roles?status=ACTIVE&limit=100&page=1',
  );
  expect(get).toHaveBeenNthCalledWith(
    2,
    '/administration/authorization/PROVIDER/roles?status=ACTIVE&limit=100&page=2',
  );
});
