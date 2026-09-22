/**
 * Visual check for the administration pages touched by the ErrorState /
 * LoadingState / Pagination refactor. Screenshots land in test-results so
 * humans can eyeball them; the assertions are computed-style based so they run
 * without anyone watching.
 *
 * Run against an already-running server (npm run dev / npm run start):
 *   E2E_PORT=3000 npx playwright test e2e/admin-visual-check.spec.ts
 *
 * The API is fully mocked with RegExp matchers (glob `?` is a one-char
 * wildcard, so it cannot match URL query strings) and every other /api/v1
 * request is aborted, so a locally running backend can never leak 401s into
 * the results. An admin access token is seeded into localStorage so the layout
 * guard lets us through, the locale cookie is pinned to Vietnamese, and dark
 * mode is forced via prefers-color-scheme.
 */
import { test, expect, type Page } from '@playwright/test';

const API = /\/api\/v1\//;
const permission = {
  id: 'perm-1',
  code: 'estate:read',
  name: 'Read estates',
  description: 'Allows reading estates',
  platform: 'MARKETPLACE',
  category: 'Estate',
  resource: 'ESTATE',
  action: 'read',
  riskLevel: 'LOW',
  isAssignable: true,
  isDeprecated: false,
  deprecatedAt: null,
  createdAt: '2026-09-01T00:00:00Z',
  updatedAt: '2026-09-01T00:00:00Z',
};

const roles = {
  items: [
    {
      id: 'role-1',
      code: 'PROVIDER_OWNER',
      name: 'Provider Owner',
      description: null,
      platform: 'MARKETPLACE',
      isSystem: false,
      status: 'ACTIVE',
      version: 3,
      permissionCount: 12,
      assignmentCount: 4,
      allowedActions: {
        updateMetadata: true,
        updateStatus: true,
        updatePermissions: true,
        delete: true,
      },
      isEditable: true,
      isDeletable: true,
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: '2026-09-01T00:00:00Z',
    },
    {
      id: 'role-2',
      code: 'SUPPORT_AGENT',
      name: 'Support Agent',
      description: null,
      platform: 'MARKETPLACE',
      isSystem: false,
      status: 'ACTIVE',
      version: 1,
      permissionCount: 4,
      assignmentCount: 0,
      allowedActions: {
        updateMetadata: true,
        updateStatus: false,
        updatePermissions: true,
        delete: false,
      },
      isEditable: true,
      isDeletable: false,
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: '2026-09-01T00:00:00Z',
    },
  ],
  meta: {
    total: 2,
    page: 1,
    limit: 20,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  },
};

const roleDetail = { ...roles.items[0], permissions: [permission] };
const permissions = { items: [permission] };
const matrix = {
  roles: roles.items,
  permissionGroups: [
    {
      category: 'Estate',
      permissions: [
        {
          id: permission.id,
          code: permission.code,
          name: permission.name,
          riskLevel: 'LOW',
        },
      ],
    },
  ],
  assignments: { 'role-1': [permission.id] },
};

function paginated(items: unknown[], page = 1, totalPages = 1) {
  return {
    items,
    meta: {
      total: items.length,
      page,
      limit: 20,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

const subjectsPage1 = paginated(
  Array.from({ length: 20 }, (_, index) => ({
    id: `subject-${index + 1}`,
    subjectType: 'CUSTOMER',
    displayName: `Subject ${index + 1}`,
    secondaryText: `subject-${index + 1}@example.com`,
    status: 'ACTIVE',
    roleCount: index === 0 ? 2 : 1,
    roleIds: ['role-1'],
  })),
  1,
  2,
);

const auditPage1 = paginated(
  Array.from({ length: 20 }, (_, index) => ({
    id: `audit-${index + 1}`,
    actorAdministratorId: 'admin-1',
    platform: 'ADMINISTRATION',
    action: 'read',
    targetType: 'role',
    targetId: null,
    reason: null,
    beforeState: null,
    afterState: null,
    requestId: `req-${index + 1}`,
    createdAt: '2026-09-14T10:00:00Z',
  })),
  1,
  2,
);

async function installApiMocks(page: Page) {
  const json = (payload: unknown) => ({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(payload),
  });

  // Registered first = checked last: nothing may reach a real backend.
  await page.route(API, (route) => route.abort());

  await page.route(/\/administration\/me\/authorization$/, (route) =>
    route.fulfill(
      json({
        platform: 'ADMINISTRATION',
        isActive: true,
        roles: [{ id: 'role-1', code: 'SUPER_ADMIN', name: 'Super Admin' }],
        permissions: [
          {
            id: 'p1',
            code: 'authorization:role:write',
            name: 'Role write',
            category: 'Authorization',
          },
          {
            id: 'p2',
            code: 'authorization:role:read',
            name: 'Role read',
            category: 'Authorization',
          },
          {
            id: 'p3',
            code: 'authorization:permission:read',
            name: 'Permission read',
            category: 'Authorization',
          },
          {
            id: 'p4',
            code: 'authorization:assignment:read',
            name: 'Assignment read',
            category: 'Authorization',
          },
          {
            id: 'p5',
            code: 'authorization:audit:read',
            name: 'Audit read',
            category: 'Authorization',
          },
        ],
        authorizationVersion: '1',
      }),
    ),
  );
  await page.route(/\/administration\/authorization\/platforms$/, (route) =>
    route.fulfill(
      json({
        items: [
          {
            platform: 'MARKETPLACE',
            displayName: 'Marketplace',
            subjectType: 'CUSTOMER',
            supportsRoles: true,
            supportsAssignments: true,
          },
        ],
      }),
    ),
  );
  await page.route(
    /\/administration\/authorization\/MARKETPLACE\/roles$/,
    (route) => route.fulfill(json(roles)),
  );
  await page.route(
    /\/administration\/authorization\/MARKETPLACE\/roles\/role-1$/,
    (route) => route.fulfill(json(roleDetail)),
  );
  await page.route(
    /\/administration\/authorization\/MARKETPLACE\/roles\/role-1\/subjects/,
    (route) => route.fulfill(json(paginated([], 1, 1))),
  );
  await page.route(
    /\/administration\/authorization\/MARKETPLACE\/permissions$/,
    (route) => route.fulfill(json(permissions)),
  );
  await page.route(
    /\/administration\/authorization\/MARKETPLACE\/permissions\/perm-1$/,
    (route) => route.fulfill(json(permission)),
  );
  await page.route(
    /\/administration\/authorization\/MARKETPLACE\/permissions\/perm-1\/roles$/,
    (route) => route.fulfill(json({ items: roles.items })),
  );
  await page.route(
    /\/administration\/authorization\/MARKETPLACE\/matrix$/,
    (route) => route.fulfill(json(matrix)),
  );
  await page.route(
    /\/administration\/authorization\/MARKETPLACE\/subjects/,
    (route) => route.fulfill(json(subjectsPage1)),
  );
  await page.route(/\/administration\/authorization\/audit/, (route) =>
    route.fulfill(json(auditPage1)),
  );
  await page.route(/\/administration\/provider-requests\/account-1$/, (route) =>
    route.fulfill(
      json({
        providerAccount: {
          displayName: 'Nexus Realty',
          type: 'AGENCY',
          verificationStatus: 'PENDING',
          createdAt: '2026-09-14T10:00:00Z',
        },
        owner: { email: 'owner@example.com', isEmailVerified: true },
      }),
    ),
  );
}

async function seedSession(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('nexus.administration.access_token', 'visual-check');
    localStorage.setItem('nexus.administration.refresh_token', 'visual-check');
  });
  // Pin the locale to Vietnamese for every origin the suite runs against.
  await page.context().addCookies([
    {
      name: 'nexus.locale',
      value: 'vi',
      url: 'http://localhost:3000',
    },
    {
      name: 'nexus.locale',
      value: 'vi',
      url: 'http://localhost:3001',
    },
    {
      name: 'nexus.locale',
      value: 'vi',
      url: 'http://localhost:3002',
    },
  ]);
}

function isDarkBackground(color: string) {
  // rgb(13, 17, 23) = #0d1117
  return color === 'rgb(13, 17, 23)';
}

test.describe('admin pages, dark mode + Vietnamese', () => {
  test.beforeEach(async ({ page }) => {
    await installApiMocks(page);
    await seedSession(page);
    await page.emulateMedia({ colorScheme: 'dark' });
  });

  test('authorization workspace renders roles table in dark mode', async ({
    page,
  }) => {
    await page.goto('/admin/authorization?platform=MARKETPLACE');
    await expect(page.getByText('Provider Owner')).toBeVisible();

    const body = await page.evaluate(
      () => window.getComputedStyle(document.body).backgroundColor,
    );
    expect(isDarkBackground(body)).toBe(true);
    await page.screenshot({
      path: 'test-results/authorization-dark-vi.png',
      fullPage: true,
    });
  });

  test('subjects page keeps Vietnamese copy and shows pagination', async ({
    page,
  }) => {
    await page.goto('/admin/authorization/subjects?platform=MARKETPLACE');
    await expect(page.getByText('Subject 1', { exact: true })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Đối tượng phân quyền' }),
    ).toBeVisible();
    await expect(
      page.getByRole('navigation', { name: 'Trang 1 / 2' }),
    ).toBeVisible();

    await page.screenshot({
      path: 'test-results/subjects-dark-vi.png',
      fullPage: true,
    });
  });

  test('audit page renders rows and pagination on the dark surface', async ({
    page,
  }) => {
    await page.goto('/admin/authorization/audit');
    await expect(page.getByText('req-1', { exact: true })).toBeVisible();
    await expect(
      page.getByRole('navigation', { name: 'Trang 1 / 2' }),
    ).toBeVisible();

    const panel = page.locator('.panel').first();
    const panelBackground = await panel.evaluate(
      (node) => window.getComputedStyle(node).backgroundColor,
    );
    // Dark surface token --surface: #151b23
    expect(panelBackground).toBe('rgb(21, 27, 35)');
    await page.screenshot({
      path: 'test-results/audit-dark-vi.png',
      fullPage: true,
    });
  });

  test('matrix page shows the role select and permission groups', async ({
    page,
  }) => {
    await page.goto('/admin/authorization/matrix?platform=MARKETPLACE');
    await expect(page.locator('#matrix-role')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Ma trận permission' }),
    ).toBeVisible();
    await page.screenshot({
      path: 'test-results/matrix-dark-vi.png',
      fullPage: true,
    });
  });

  test('role detail page renders metadata panels', async ({ page }) => {
    await page.goto('/admin/authorization/roles/role-1?platform=MARKETPLACE');
    await expect(page.getByText('Provider Owner').first()).toBeVisible();
    await expect(page.getByText('Sửa thông tin')).toBeVisible();
    await page.screenshot({
      path: 'test-results/role-detail-dark-vi.png',
      fullPage: true,
    });
  });

  test('permission detail page renders the definition list', async ({
    page,
  }) => {
    await page.goto(
      '/admin/authorization/permissions/perm-1?platform=MARKETPLACE',
    );
    await expect(page.getByText('estate:read')).toBeVisible();
    await page.screenshot({
      path: 'test-results/permission-detail-dark-vi.png',
      fullPage: true,
    });
  });
});
