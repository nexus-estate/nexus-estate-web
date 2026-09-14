import type {
  AuthorizationAuditEvent,
  MatrixResponse,
  PlatformMetadataResponse,
  RoleAllowedActions,
  SubjectListResponse,
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
