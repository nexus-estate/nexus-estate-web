import { expect, test, type Page } from '@playwright/test';

test.skip(
  process.env.E2E_MULTI_PLATFORM !== 'true',
  'Cross-platform navigation runs with all three local runtimes.',
);

const marketplaceUrl = 'http://localhost:3000';
const providerUrl = 'http://localhost:3001';

async function mockCustomerSession(page: Page) {
  await page.route('**/api/v1/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/customers/auth/profile')) {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'customer-navigation-test',
          email: 'navigation@example.com',
          isEmailVerified: true,
        }),
      });
      return;
    }
    if (path.endsWith('/customers/me/authorization')) {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ permissions: [] }),
      });
      return;
    }
    if (path.endsWith('/providers/me')) {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ code: 'PROVIDER_ACCOUNT_NOT_FOUND' }),
      });
      return;
    }
    if (path.endsWith('/providers/me/authorization')) {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ providerDisplayName: 'Navigation Provider' }),
      });
      return;
    }
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({}),
    });
  });
  await page.addInitScript(() => {
    localStorage.setItem(
      'nexus.customer.access_token',
      'navigation-access-token',
    );
    localStorage.setItem(
      'nexus.customer.refresh_token',
      'navigation-refresh-token',
    );
    localStorage.setItem(
      'nexus.customer.user',
      JSON.stringify({
        id: 'customer-navigation-test',
        email: 'navigation@example.com',
        isEmailVerified: true,
      }),
    );
  });
}

test('Marketplace Provider links target the Provider runtime', async ({
  browser,
}) => {
  const context = await browser.newContext({ baseURL: marketplaceUrl });
  const page = await context.newPage();
  try {
    await page.goto('/');
    await expect(
      page
        .getByRole('link', { name: /Provider portal|Cổng Provider/i })
        .first(),
    ).toHaveAttribute('href', `${providerUrl}/provider`);
    await expect(
      page.getByRole('link', { name: /Become a Provider|Trở thành Provider/i }),
    ).toHaveAttribute('href', `${providerUrl}/provider/onboarding`);

    await mockCustomerSession(page);
    await page.goto('/dashboard');
    await expect(
      page.getByRole('link', {
        name: /Become a Provider|Trở thành Provider/i,
      }),
    ).toHaveAttribute('href', `${providerUrl}/provider/onboarding`);
  } finally {
    await context.close();
  }
});

test('Provider links back to the Marketplace runtime', async ({ browser }) => {
  const context = await browser.newContext({ baseURL: providerUrl });
  const page = await context.newPage();
  try {
    await mockCustomerSession(page);
    await page.goto('/provider');
    await expect(
      page.getByRole('link', { name: /Back to Marketplace|Về Marketplace/ }),
    ).toHaveAttribute('href', `${marketplaceUrl}/`);
  } finally {
    await context.close();
  }
});

test('Provider auth return path survives signin to signup', async ({
  browser,
}) => {
  const context = await browser.newContext({ baseURL: providerUrl });
  const page = await context.newPage();
  try {
    await page.goto('/signin?next=%2Fprovider%2Fonboarding');
    await expect(
      page.getByRole('link', { name: /Create an account|Tạo tài khoản/ }),
    ).toHaveAttribute('href', '/signup?next=%2Fprovider%2Fonboarding');

    await mockCustomerSession(page);
    await page.goto('/signup?next=%2Fprovider%2Fonboarding');
    await page
      .locator('input[type="email"]')
      .fill('new-navigation@example.com');
    await page
      .locator('input[type="password"]')
      .nth(0)
      .fill('navigation-password');
    await page
      .locator('input[type="password"]')
      .nth(1)
      .fill('navigation-password');
    await page.locator('input[type="checkbox"]').check();
    await page
      .getByRole('button', { name: /Create account|Tạo tài khoản/i })
      .click();
    await expect(page).toHaveURL(/\/signin\?next=%2Fprovider%2Fonboarding$/, {
      timeout: 5_000,
    });
  } finally {
    await context.close();
  }
});
