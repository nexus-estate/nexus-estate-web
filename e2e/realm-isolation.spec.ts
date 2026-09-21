import { test, expect } from '@playwright/test';

test('protected portals do not treat anonymous Marketplace visitors as operators', async ({
  page,
}) => {
  await page.goto('/admin/login');
  await expect(page).toHaveURL(/\/admin/);
  const providerResponse = await page.goto('/provider');
  expect(providerResponse?.status()).toBe(404);
});
