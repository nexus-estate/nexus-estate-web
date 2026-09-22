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

test('uses the finalized estate marketplace wire contract', async () => {
  jest.restoreAllMocks();
  const { publicApiClient, providerApiClient } = await import('./client');
  const { estateApi, locationApi } = await import('./estate/estate.api');
  const { listingApi } = await import('./listing/listing.api');
  const { leadApi } = await import('./lead/lead.api');
  const publicGet = jest
    .spyOn(publicApiClient, 'get')
    .mockResolvedValue({} as never);
  const publicPost = jest
    .spyOn(publicApiClient, 'post')
    .mockResolvedValue({} as never);
  const providerGet = jest
    .spyOn(providerApiClient, 'get')
    .mockResolvedValue({} as never);
  const providerPost = jest
    .spyOn(providerApiClient, 'post')
    .mockResolvedValue({} as never);
  const providerEstate = {
    title: 'New estate',
    type: 'APARTMENT' as const,
    purpose: 'SALE' as const,
    price: 250000,
    addressLine: '1 Main Street',
    provinceId: 'province-id',
    wardId: 'ward-id',
  };

  await locationApi.wards('province-id');
  await estateApi.create(providerEstate);
  await estateApi.listMine();
  await estateApi.activate('estate-id');
  await estateApi.archive('estate-id');
  await estateApi.restore('estate-id');
  await listingApi.list({
    q: 'main',
    type: 'APARTMENT',
    purpose: 'SALE',
    provinceId: 'province-id',
    page: 2,
    limit: 10,
    sort: 'newest',
  });
  await listingApi.mine();
  await listingApi.create({ estateId: 'estate-id' });
  await leadApi.create('listing-id', {
    name: 'Jane Doe',
    phone: '0900000000',
    message: 'Please call me',
  });

  expect(publicGet).toHaveBeenNthCalledWith(
    1,
    '/locations/provinces/province-id/wards',
  );
  expect(publicGet).toHaveBeenNthCalledWith(
    2,
    '/listings?q=main&type=APARTMENT&purpose=SALE&provinceId=province-id&page=2&limit=10&sort=newest',
  );
  expect(providerGet).toHaveBeenCalledWith('/estates/mine');
  expect(providerGet).toHaveBeenCalledWith('/listings/mine');
  expect(providerPost).toHaveBeenCalledWith('/estates', providerEstate);
  expect(providerPost).toHaveBeenCalledWith('/estates/estate-id/activate');
  expect(providerPost).toHaveBeenCalledWith('/estates/estate-id/archive');
  expect(providerPost).toHaveBeenCalledWith('/estates/estate-id/restore');
  expect(providerPost).toHaveBeenCalledWith('/listings', {
    estateId: 'estate-id',
  });
  expect(publicPost).toHaveBeenCalledWith('/listings/listing-id/leads', {
    name: 'Jane Doe',
    phone: '0900000000',
    message: 'Please call me',
  });
});
