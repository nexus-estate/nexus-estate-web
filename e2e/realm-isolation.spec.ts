import { test, expect } from '@playwright/test';
test('protected portals do not treat anonymous Marketplace visitors as operators', async ({
  page,
}) => {
  await page.goto('/admin/login');
  await expect(page).toHaveURL(/\/admin/);
  await page.goto('/provider');
  await expect(page).toHaveURL(/\/provider/);
  await expect(page.getByText(/Administration|Admin Panel/i)).toHaveCount(0);
});
