import { expect, test } from '@playwright/test';

test('homepage controls hydrate and work with extension-injected attributes', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));

  // Reproduce the fdprocessedid additions seen in the browser/server log.
  await page.addInitScript(() => {
    const observer = new MutationObserver(() => {
      document
        .querySelectorAll(
          'button[aria-label="Switch language"], button[aria-label="Search properties"]',
        )
        .forEach((button) => button.setAttribute('fdprocessedid', 'extension'));
    });
    observer.observe(document, { childList: true, subtree: true });
    document.addEventListener('DOMContentLoaded', () => observer.disconnect(), {
      once: true,
    });
  });

  await page.goto('/');
  await expect(page.locator('[fdprocessedid="extension"]')).toHaveCount(2);
  await page.getByRole('button', { name: 'Switch language' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'vi');
  await page.getByRole('button', { name: 'Chuyển ngôn ngữ' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.locator('.mp-hero-search input[name="q"]').fill('test');
  await page
    .getByRole('button', { name: 'Search properties', exact: true })
    .click();
  await expect(page).toHaveURL(/\/properties\?.*q=test/);
  expect(
    errors.filter((message) => /hydrat|fdprocessedid/i.test(message)),
  ).toEqual([]);
});
