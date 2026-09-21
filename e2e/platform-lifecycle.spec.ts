import { expect, test, type Page } from '@playwright/test';

const apiUrl =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:50001/api/v1';
const customerPassword = 'lifecycle-customer-password';
const adminEmail = 'superadmin@nexus-estate.local';
const adminPassword = 'NexusEstate#SuperAdmin2026!';
const marketplaceBaseURL = `http://localhost:${process.env.E2E_PORT ?? '3000'}`;
const providerBaseURL = `http://localhost:${process.env.E2E_PROVIDER_PORT ?? '3001'}`;
const adminBaseURL = `http://localhost:${process.env.E2E_ADMIN_PORT ?? '3002'}`;

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
  const testInfo = test.info();
  const runId = process.env.GITHUB_RUN_ID ?? `local-${process.pid}`;
  const runKey = `${runId}-${testInfo.retry}`;
  const customerEmail = `lifecycle-customer-${runKey}@nexus.test`;
  const providerName = `Lifecycle Provider ${runKey}`;
  const customerContext = await browser.newContext({
    baseURL: marketplaceBaseURL,
  });
  const providerContext = await browser.newContext({
    baseURL: providerBaseURL,
  });
  const adminContext = await browser.newContext({ baseURL: adminBaseURL });
  const customerPage = await customerContext.newPage();
  const providerPage = await providerContext.newPage();
  const adminPage = await adminContext.newPage();
  const providerRequests: Record<string, string>[] = [];
  const customerRequests: Record<string, string>[] = [];
  const adminRequests: Record<string, string>[] = [];

  customerPage.on('request', (request) => {
    if (request.url().includes('/api/v1/customers/'))
      customerRequests.push(request.headers());
  });
  providerPage.on('request', (request) => {
    if (request.url().includes('/api/v1/providers/'))
      providerRequests.push(request.headers());
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

    // Each browser context has its own storage. Authenticate the Customer
    // context separately; the Provider context below intentionally owns a
    // different Customer session for the cross-platform checks.
    await customerPage.goto('/signin');
    await customerPage.locator('input[type="email"]').fill(customerEmail);
    await customerPage.locator('input[type="password"]').fill(customerPassword);
    await customerPage
      .getByRole('button', { name: /Đăng nhập|Sign in/ })
      .click();
    await expect(customerPage).toHaveURL(/\/$/);

    await providerPage.goto('/provider');
    await expect(providerPage).toHaveURL(/\/signin\?/);
    expect(new URL(providerPage.url()).searchParams.get('next')).toBe(
      '/provider',
    );
    await providerPage.locator('input[type="email"]').fill(customerEmail);
    await providerPage.locator('input[type="password"]').fill(customerPassword);
    await providerPage
      .getByRole('button', { name: /Đăng nhập|Sign in/ })
      .click();
    await expect(providerPage).toHaveURL(/\/provider$/);
    await expect(
      providerPage.getByRole('heading', {
        name: /Start your Provider workspace|Bắt đầu workspace Provider/,
      }),
    ).toBeVisible();

    expect([401, 403]).toContain(
      await apiStatus(
        providerPage,
        '/administration/me/authorization',
        'nexus.customer.access_token',
      ),
    );

    await providerPage
      .getByRole('link', {
        name: /Start Provider onboarding|Bắt đầu onboarding Provider/,
      })
      .click();
    await providerPage.locator('input').fill(providerName);
    await providerPage
      .getByRole('button', { name: /Submit for review|Gửi xét duyệt/ })
      .click();
    await expect(
      providerPage
        .locator('span.border')
        .filter({ hasText: /^Pending review$|^Đang chờ duyệt$/ }),
    ).toBeVisible();
    await expect(
      providerPage.getByText(
        /Provider review is in progress\.|Hồ sơ Provider đang được xét duyệt\./,
      ),
    ).toBeVisible();

    await adminPage.goto('/admin/provider-requests');
    await adminPage.locator('input[type="email"]').fill(adminEmail);
    await adminPage.locator('input[type="password"]').fill(adminPassword);
    await adminPage.getByRole('button', { name: /Sign in|Đăng nhập/ }).click();
    await expect(adminPage).toHaveURL(/\/admin\/provider-requests(?:\?|$)/);
    await expect(
      adminPage.getByText(providerName, { exact: true }),
    ).toBeVisible();
    await adminPage
      .getByRole('button', { name: /Approve|Phê duyệt/ })
      .first()
      .click();
    await expect(
      adminPage.getByText(/No pending requests\.|Không có yêu cầu đang chờ\./),
    ).toBeVisible();

    await providerPage.reload();
    await providerPage.goto('/provider');
    await expect(
      providerPage.getByText(
        /Supply access is active\.|Quyền Supply đang hoạt động\./,
      ),
    ).toBeVisible();
    await expect(
      providerPage.getByText(/Active|Đang hoạt động/, { exact: true }).first(),
    ).toBeVisible();
    await expect(
      providerPage.getByText(/Verified|Đã xác minh/, { exact: true }).first(),
    ).toBeVisible();
    await expect(
      providerPage.getByText('Owner', { exact: true }),
    ).toBeVisible();
    await providerPage.goto('/provider/authorization');
    await expect(
      providerPage.getByRole('heading', {
        name: /Effective permissions|Quyền hiệu lực/,
      }),
    ).toBeVisible();
    await expect(providerPage.locator('code').first()).toBeVisible();

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
    await expect(
      customerPage.getByRole('main').getByText(customerEmail, { exact: true }),
    ).toBeVisible();
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
    await providerPage.goto('/provider');
    await providerPage
      .getByRole('button', { name: /Sign out|Đăng xuất/ })
      .click();
    await expect
      .poll(() => token(providerPage, 'nexus.customer.access_token'))
      .toBeNull();
    expect(
      await token(adminPage, 'nexus.administration.access_token'),
    ).toBeTruthy();

    // Restore the Customer session to verify the inverse logout and expiry cases.
    await providerPage.goto('/signin');
    await providerPage.locator('input[type="email"]').fill(customerEmail);
    await providerPage.locator('input[type="password"]').fill(customerPassword);
    await providerPage
      .getByRole('button', { name: /Đăng nhập|Sign in/ })
      .click();
    await expect(providerPage).toHaveURL(/\/provider$/);
    await providerPage.goto('/provider');

    await adminPage
      .getByRole('button', { name: /Sign out|Đăng xuất/ })
      .first()
      .click();
    await expect(adminPage).toHaveURL(/\/admin\/login/);
    expect(
      await token(providerPage, 'nexus.customer.access_token'),
    ).toBeTruthy();

    // Expiring one realm's refresh session must not touch the other realm.
    await adminPage.locator('input[type="email"]').fill(adminEmail);
    await adminPage.locator('input[type="password"]').fill(adminPassword);
    await adminPage.getByRole('button', { name: /Sign in|Đăng nhập/ }).click();
    await expect(adminPage).toHaveURL(/\/admin\/provider-requests(?:\?|$)/);
    await providerPage.evaluate(() => {
      localStorage.setItem(
        'nexus.customer.access_token',
        'expired-customer-access',
      );
      localStorage.setItem(
        'nexus.customer.refresh_token',
        'expired-customer-refresh',
      );
    });
    await providerPage.reload();
    await providerPage.goto('/provider');
    await expect
      .poll(() => token(providerPage, 'nexus.customer.access_token'))
      .toBeNull();
    expect(
      await token(adminPage, 'nexus.administration.access_token'),
    ).toBeTruthy();

    await providerPage.goto('/signin');
    await providerPage.locator('input[type="email"]').fill(customerEmail);
    await providerPage.locator('input[type="password"]').fill(customerPassword);
    await providerPage
      .getByRole('button', { name: /Đăng nhập|Sign in/ })
      .click();
    await expect(providerPage).toHaveURL(/\/provider$/);
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
      await token(providerPage, 'nexus.customer.access_token'),
    ).toBeTruthy();
  } finally {
    await customerContext.close();
    await providerContext.close();
    await adminContext.close();
  }
});
