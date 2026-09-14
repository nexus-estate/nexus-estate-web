import { test, expect } from '@playwright/test';
test('locale preference is persisted and document language follows it', async ({
  page,
}) => {
  await page
    .context()
    .addCookies([
      { name: 'nexus.locale', value: 'vi', url: 'http://localhost:3000' },
    ]);
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'vi');
  await expect(page.getByText('English').first()).toBeVisible();
});
