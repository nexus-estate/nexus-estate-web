import { test, expect } from '@playwright/test';
test('Marketplace remains consumer-facing for anonymous visitors', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Nexus Estate/i);
  await expect(
    page.getByRole('link', { name: /Marketplace|Nhà đất/i }).first(),
  ).toBeVisible();
  await expect(page.getByText(/Admin|Administration/i)).toHaveCount(0);
});
