import { expect, test, type Page } from '@playwright/test';

test.skip(
  (process.env.WEB_PLATFORM ?? 'marketplace') !== 'provider',
  'Provider auth return flow runs against the Provider runtime.',
);

const customer = {
  email: 'return-path@example.com',
  password: 'return-path-password',
};

async function mockCustomerLogin(page: Page) {
  await page.route('**/api/v1/**', async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith('/customers/auth/login')) {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          accessToken: 'customer-access-token',
          refreshToken: 'customer-refresh-token',
        }),
      });
      return;
    }
    if (url.pathname.endsWith('/customers/auth/profile')) {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'customer-1',
          email: customer.email,
          isEmailVerified: true,
          lastLogin: null,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        }),
      });
      return;
    }
    await route.fulfill({ contentType: 'application/json', body: '{}' });
  });
}

async function signIn(page: Page) {
  await page.locator('input[type="email"]').fill(customer.email);
  await page.locator('input[type="password"]').fill(customer.password);
  await page.getByRole('button', { name: /Đăng nhập|Sign in/ }).click();
}

test('anonymous Provider entry returns to the Provider overview after login', async ({
  page,
}) => {
  await mockCustomerLogin(page);
  await page.goto('/provider');

  await expect(page).toHaveURL(/\/signin\?/);
  expect(new URL(page.url()).searchParams.get('next')).toBe('/provider');

  await signIn(page);
  await expect(page).toHaveURL(/\/provider$/);
});

test('anonymous nested Provider entry preserves pathname and query', async ({
  page,
}) => {
  await mockCustomerLogin(page);
  await page.goto('/provider/account?tab=billing');

  await expect(page).toHaveURL(/\/signin\?/);
  expect(new URL(page.url()).searchParams.get('next')).toBe(
    '/provider/account?tab=billing',
  );

  await signIn(page);
  await expect(page).toHaveURL(/\/provider\/account\?tab=billing$/);
});
