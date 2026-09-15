import { expect, test, type Page } from '@playwright/test';

test.skip(
  process.env.E2E_INTEGRATION !== 'true',
  'Runs only in the isolated PostgreSQL + API integration job.',
);

const apiUrl =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:50001/api/v1';
const customerEmail = 'lifecycle-customer@nexus.test';
const customerPassword = 'lifecycle-customer-password';
const adminEmail = 'superadmin@nexus-estate.local';
const adminPassword = 'NexusEstate#SuperAdmin2026!';

async function apiStatus(page: Page, path: string, tokenKey: string) {
  return page.evaluate(
    async ({ apiUrl: url, path: endpoint, tokenKey: key }) => {
      const token = localStorage.getItem(key);
      const response = await fetch(`${url}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.status;
    },
    { apiUrl, path, tokenKey },
  );
}

async function token(page: Page, key: string) {
  return page.evaluate((storageKey) => localStorage.getItem(storageKey), key);
}

test('proves the Customer → Provider → Administration lifecycle and isolation', async ({
  browser,
}) => {
  test.setTimeout(60_000);
  const customerContext = await browser.newContext();
  const adminContext = await browser.newContext();
  const customerPage = await customerContext.newPage();
  const adminPage = await adminContext.newPage();
  const providerRequests: Record<string, string>[] = [];
  const customerRequests: Record<string, string>[] = [];
  const adminRequests: Record<string, string>[] = [];

  customerPage.on('request', (request) => {
    if (request.url().includes('/api/v1/providers/'))
      providerRequests.push(request.headers());
    if (request.url().includes('/api/v1/customers/'))
      customerRequests.push(request.headers());
  });
  adminPage.on('request', (request) => {
    if (request.url().includes('/api/v1/administration/'))
      adminRequests.push(request.headers());
  });

  try {
    await customerPage.goto('/signup');
    await customerPage.locator('input[type="email"]').fill(customerEmail);
    await customerPage
      .locator('input[type="password"]')
      .nth(0)
      .fill(customerPassword);
    await customerPage
      .locator('input[type="password"]')
      .nth(1)
      .fill(customerPassword);
    await customerPage.locator('input[type="checkbox"]').check();
    await customerPage
      .getByRole('button', { name: /Tạo tài khoản|Create account/ })
      .click();
    await expect(
      customerPage.getByRole('heading', {
        name: /Chào mừng bạn đến|Welcome to/,
      }),
    ).toBeVisible();

    await customerPage.goto('/signin');
    await customerPage.locator('input[type="email"]').fill(customerEmail);
    await customerPage.locator('input[type="password"]').fill(customerPassword);
    await customerPage.getByRole('button', { name: /Đăng nhập/ }).click();
    await expect(customerPage).toHaveURL(/\/$/);
    await customerPage.goto('/provider');
    await expect(
      customerPage.getByRole('heading', {
        name: /Start your Provider workspace|Bắt đầu workspace Provider/,
      }),
    ).toBeVisible();

    expect([401, 403]).toContain(
      await apiStatus(
        customerPage,
        '/administration/me/authorization',
        'nexus.customer.access_token',
      ),
    );

    await customerPage
      .getByRole('link', {
        name: /Start Provider onboarding|Bắt đầu onboarding Provider/,
      })
      .click();
    await customerPage.locator('input').fill('Lifecycle Provider');
    await customerPage
      .getByRole('button', { name: /Submit for review|Gửi xét duyệt/ })
      .click();
    await expect(
      customerPage.getByText(/Pending review|Đang chờ duyệt/),
    ).toBeVisible();
    await expect(
      customerPage.getByText(
        /Provider review is in progress\.|Hồ sơ Provider đang được xét duyệt\./,
      ),
    ).toBeVisible();

    await adminPage.goto('/admin/provider-requests');
    await adminPage.locator('input[type="email"]').fill(adminEmail);
    await adminPage.locator('input[type="password"]').fill(adminPassword);
    await adminPage.getByRole('button', { name: /Sign in|Đăng nhập/ }).click();
    await expect(adminPage).toHaveURL(/\/admin\/provider-requests(?:\?|$)/);
    await expect(adminPage.getByText('Lifecycle Provider')).toBeVisible();
    await adminPage
      .getByRole('button', { name: /Approve|Phê duyệt/ })
      .first()
      .click();
    await expect(
      adminPage.getByText(/No pending requests\.|Không có yêu cầu đang chờ\./),
    ).toBeVisible();

    await customerPage.reload();
    await customerPage.goto('/provider');
    await expect(
      customerPage.getByText(
        /Supply access is active\.|Quyền Supply đang hoạt động\./,
      ),
    ).toBeVisible();
    await expect(
      customerPage.getByText(/Active|Đang hoạt động/, { exact: true }).first(),
    ).toBeVisible();
    await expect(
      customerPage.getByText(/Verified|Đã xác minh/, { exact: true }).first(),
    ).toBeVisible();
    await expect(
      customerPage.getByText('Owner', { exact: true }),
    ).toBeVisible();
    await customerPage.goto('/provider/authorization');
    await expect(
      customerPage.getByRole('heading', {
        name: /Effective permissions|Quyền hiệu lực/,
      }),
    ).toBeVisible();
    await expect(customerPage.locator('code').first()).toBeVisible();

    const providerHeader = providerRequests.find(
      (headers) =>
        headers.authorization?.startsWith('Bearer ') &&
        Boolean(headers['x-provider-id']),
    );
    expect(providerHeader).toBeDefined();
    expect(providerHeader?.['x-provider-id']).toBeTruthy();
    expect(providerHeader?.authorization).toContain('Bearer ');
    expect(providerHeader?.['x-lang']).toBeTruthy();

    await customerPage.goto('/profile');
    await expect(customerPage.getByText(customerEmail)).toBeVisible();
    const marketplaceHeader = customerRequests.find((headers) =>
      headers.authorization?.startsWith('Bearer '),
    );
    expect(marketplaceHeader).toBeDefined();
    expect(marketplaceHeader?.['x-provider-id']).toBeUndefined();

    const administrationHeader = adminRequests.find((headers) =>
      headers.authorization?.startsWith('Bearer '),
    );
    expect(administrationHeader).toBeDefined();
    expect(administrationHeader?.['x-provider-id']).toBeUndefined();
    expect([401, 403]).toContain(
      await apiStatus(
        adminPage,
        '/customers/auth/profile',
        'nexus.administration.access_token',
      ),
    );

    // Each realm owns its logout state.
    await customerPage.goto('/provider');
    await customerPage
      .getByRole('button', { name: /Sign out|Đăng xuất/ })
      .click();
    await expect
      .poll(() => token(customerPage, 'nexus.customer.access_token'))
      .toBeNull();
    expect(
      await token(adminPage, 'nexus.administration.access_token'),
    ).toBeTruthy();

    // Restore the Customer session to verify the inverse logout and expiry cases.
    await customerPage.goto('/signin');
    await customerPage.locator('input[type="email"]').fill(customerEmail);
    await customerPage.locator('input[type="password"]').fill(customerPassword);
    await customerPage.getByRole('button', { name: /Đăng nhập/ }).click();
    await expect(customerPage).toHaveURL(/\/$/);
    await customerPage.goto('/provider');

    await adminPage
      .getByRole('button', { name: /Sign out|Đăng xuất/ })
      .first()
      .click();
    await expect(adminPage).toHaveURL(/\/admin\/login/);
    expect(
      await token(customerPage, 'nexus.customer.access_token'),
    ).toBeTruthy();

    // Expiring one realm's refresh session must not touch the other realm.
    await adminPage.locator('input[type="email"]').fill(adminEmail);
    await adminPage.locator('input[type="password"]').fill(adminPassword);
    await adminPage.getByRole('button', { name: /Sign in|Đăng nhập/ }).click();
    await expect(adminPage).toHaveURL(/\/admin\/provider-requests(?:\?|$)/);
    await customerPage.evaluate(() => {
      localStorage.setItem(
        'nexus.customer.access_token',
        'expired-customer-access',
      );
      localStorage.setItem(
        'nexus.customer.refresh_token',
        'expired-customer-refresh',
      );
    });
    await customerPage.reload();
    await customerPage.goto('/profile');
    await expect
      .poll(() => token(customerPage, 'nexus.customer.access_token'))
      .toBeNull();
    expect(
      await token(adminPage, 'nexus.administration.access_token'),
    ).toBeTruthy();

    await customerPage.goto('/signin');
    await customerPage.locator('input[type="email"]').fill(customerEmail);
    await customerPage.locator('input[type="password"]').fill(customerPassword);
    await customerPage.getByRole('button', { name: /Đăng nhập/ }).click();
    await expect(customerPage).toHaveURL(/\/$/);
    await adminPage.evaluate(() => {
      localStorage.setItem(
        'nexus.administration.access_token',
        'expired-admin-access',
      );
      localStorage.setItem(
        'nexus.administration.refresh_token',
        'expired-admin-refresh',
      );
    });
    await adminPage.reload();
    await expect(adminPage).toHaveURL(/\/admin\/login/);
    expect(
      await token(customerPage, 'nexus.customer.access_token'),
    ).toBeTruthy();
  } finally {
    await customerContext.close();
    await adminContext.close();
  }
});
