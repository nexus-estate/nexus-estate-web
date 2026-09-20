import { test, expect } from '@playwright/test';
test('locale preference is persisted and document language follows it', async ({
  page,
}) => {
  await page
    .context()
    .addCookies([
      { name: 'nexus.locale', value: 'vi', domain: 'localhost', path: '/' },
    ]);
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'vi');
  await expect(page.getByText('English').first()).toBeVisible();
});

test('language switcher keeps the UI, cookie, and localStorage in sync', async ({
  page,
  context,
}) => {
  await page.goto('/');
  const switcher = page.getByRole('button', { name: 'Switch language' });

  await switcher.click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'vi');
  await expect
    .poll(
      async () =>
        (await context.cookies()).find(
          (cookie) => cookie.name === 'nexus.locale',
        )?.value,
    )
    .toBe('vi');
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('nexus.locale')))
    .toBe('vi');

  await page.getByRole('button', { name: 'Chuyển ngôn ngữ' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect
    .poll(
      async () =>
        (await context.cookies()).find(
          (cookie) => cookie.name === 'nexus.locale',
        )?.value,
    )
    .toBe('en');
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('nexus.locale')))
    .toBe('en');
});

test('rendering never emits the next-intl ENVIRONMENT_FALLBACK error', async ({
  page,
}) => {
  const runtimeErrors: string[] = [];
  page.on('console', (message) => runtimeErrors.push(message.text()));
  page.on('pageerror', (error) => runtimeErrors.push(error.message));

  await page.goto('/');
  await page
    .context()
    .addCookies([
      { name: 'nexus.locale', value: 'vi', domain: 'localhost', path: '/' },
    ]);
  await page.goto('/');

  expect(
    runtimeErrors.filter((text) => text.includes('ENVIRONMENT_FALLBACK')),
  ).toEqual([]);
});
