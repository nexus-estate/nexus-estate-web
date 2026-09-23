import { administrationApiClient, publicApiClient } from '../client';
import { administrationAuthenticationApi } from './authentication.api';
import { administrationAuthorizationApi } from './authorization.api';
import { providerReviewApi } from './provider-review.api';

jest.mock('../client', () => {
  const stub = {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  };
  return {
    administrationApiClient: stub,
    publicApiClient: { post: jest.fn() },
  };
});

const admin = administrationApiClient as jest.Mocked<
  typeof administrationApiClient
>;
const pub = publicApiClient as jest.Mocked<typeof publicApiClient>;

beforeEach(() => {
  jest.clearAllMocks();
  (admin.get as jest.Mock).mockResolvedValue({});
  (admin.post as jest.Mock).mockResolvedValue({});
  (admin.patch as jest.Mock).mockResolvedValue({});
  (admin.put as jest.Mock).mockResolvedValue({});
  (admin.delete as jest.Mock).mockResolvedValue({});
  (pub.post as jest.Mock).mockResolvedValue({});
});

describe('administrationAuthenticationApi', () => {
  test('login posts credentials to the public auth endpoint', async () => {
    const credentials = { email: 'admin@example.com', password: 'secret' };
    await administrationAuthenticationApi.login(credentials);
    expect(pub.post).toHaveBeenCalledWith(
      '/administration/auth/login',
      credentials,
    );
  });

  test('refresh wraps the token in a payload object', async () => {
    await administrationAuthenticationApi.refresh('token-1');
    expect(pub.post).toHaveBeenCalledWith('/administration/auth/refresh', {
      refreshToken: 'token-1',
    });
  });

  test('logout uses the authenticated client', async () => {
    await administrationAuthenticationApi.logout('token-2');
    expect(admin.post).toHaveBeenCalledWith('/administration/auth/logout', {
      refreshToken: 'token-2',
    });
  });
});

describe('providerReviewApi', () => {
  test('lists pending provider registrations', async () => {
    await providerReviewApi.pending();
    expect(admin.get).toHaveBeenCalledWith(
      '/administration/provider-registrations',
    );
  });

  test('loads a single registration by account id', async () => {
    await providerReviewApi.detail('account-1');
    expect(admin.get).toHaveBeenCalledWith(
      '/administration/provider-registrations/account-1',
    );
  });

  test('approves a registration via POST', async () => {
    await providerReviewApi.approve('account-1');
    expect(admin.post).toHaveBeenCalledWith(
      '/administration/provider-registrations/account-1/approve',
    );
  });
});

describe('administrationAuthorizationApi', () => {
  test('effective and platforms hit their dedicated endpoints', async () => {
    await administrationAuthorizationApi.effective();
    await administrationAuthorizationApi.platforms();
    expect(admin.get).toHaveBeenCalledWith('/administration/me/authorization');
    expect(admin.get).toHaveBeenCalledWith(
      '/administration/authorization/platforms',
    );
  });

  test('audit omits the separator when no filters are given', async () => {
    await administrationAuthorizationApi.audit();
    expect(admin.get).toHaveBeenCalledWith(
      '/administration/authorization/audit',
    );
  });

  test('audit forwards filters as a query string', async () => {
    await administrationAuthorizationApi.audit({ platform: 'PROVIDER' });
    expect(admin.get).toHaveBeenCalledWith(
      '/administration/authorization/audit?platform=PROVIDER',
    );
  });

  test('role CRUD uses the platform-scoped base path', async () => {
    await administrationAuthorizationApi.roles('PROVIDER', {
      status: 'ACTIVE',
    });
    await administrationAuthorizationApi.role('PROVIDER', 'role-1');
    await administrationAuthorizationApi.createRole('PROVIDER', {
      name: 'Editor',
      description: '',
      permissionIds: [],
    } as never);
    await administrationAuthorizationApi.updateRole('PROVIDER', 'role-1', {
      name: 'Editor 2',
    } as never);
    await administrationAuthorizationApi.deleteRole('PROVIDER', 'role-1');
    await administrationAuthorizationApi.replaceRolePermissions(
      'PROVIDER',
      'role-1',
      {
        permissionIds: ['p1'],
      } as never,
    );

    expect(admin.get).toHaveBeenCalledWith(
      '/administration/authorization/PROVIDER/roles?status=ACTIVE',
    );
    expect(admin.get).toHaveBeenCalledWith(
      '/administration/authorization/PROVIDER/roles/role-1',
    );
    expect(admin.post).toHaveBeenCalledWith(
      '/administration/authorization/PROVIDER/roles',
      { name: 'Editor', description: '', permissionIds: [] },
    );
    expect(admin.patch).toHaveBeenCalledWith(
      '/administration/authorization/PROVIDER/roles/role-1',
      { name: 'Editor 2' },
    );
    expect(admin.delete).toHaveBeenCalledWith(
      '/administration/authorization/PROVIDER/roles/role-1',
    );
    expect(admin.put).toHaveBeenCalledWith(
      '/administration/authorization/PROVIDER/roles/role-1/permissions',
      { permissionIds: ['p1'] },
    );
  });

  test('roleSubjects and permissions forward filters', async () => {
    await administrationAuthorizationApi.roleSubjects(
      'ADMINISTRATION',
      'role-1',
      {
        q: 'nexus',
        page: 2,
      },
    );
    await administrationAuthorizationApi.permissions('ADMINISTRATION', {
      resource: 'ESTATE',
    });

    expect(admin.get).toHaveBeenCalledWith(
      '/administration/authorization/ADMINISTRATION/roles/role-1/subjects?q=nexus&page=2',
    );
    expect(admin.get).toHaveBeenCalledWith(
      '/administration/authorization/ADMINISTRATION/permissions?resource=ESTATE',
    );
  });

  test('permission detail, roles and matrix resolve their static paths', async () => {
    await administrationAuthorizationApi.permission('PROVIDER', 'perm-1');
    await administrationAuthorizationApi.permissionRoles('PROVIDER', 'perm-1');
    await administrationAuthorizationApi.matrix('PROVIDER');

    expect(admin.get).toHaveBeenCalledWith(
      '/administration/authorization/PROVIDER/permissions/perm-1',
    );
    expect(admin.get).toHaveBeenCalledWith(
      '/administration/authorization/PROVIDER/permissions/perm-1/roles',
    );
    expect(admin.get).toHaveBeenCalledWith(
      '/administration/authorization/PROVIDER/matrix',
    );
  });

  test('subjects list forwards filters and keeps the bare path without them', async () => {
    await administrationAuthorizationApi.subjects('PROVIDER');
    expect(admin.get).toHaveBeenCalledWith(
      '/administration/authorization/PROVIDER/subjects',
    );

    await administrationAuthorizationApi.subjects('PROVIDER', {
      q: 'x',
      page: 3,
    });
    expect(admin.get).toHaveBeenCalledWith(
      '/administration/authorization/PROVIDER/subjects?q=x&page=3',
    );
  });

  test('providerMembers builds the nested member path with filters', async () => {
    await administrationAuthorizationApi.providerMembers('provider-1', {
      status: 'ACTIVE',
    });
    expect(admin.get).toHaveBeenCalledWith(
      '/administration/providers/provider-1/members?status=ACTIVE',
    );
  });
});
