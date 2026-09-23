import { test, expect } from '@playwright/test';

/**
 * Design-system contract.
 *
 * The original UI drifted because every page re-invented its buttons, inputs
 * and colours. These assertions pin the shared tokens (geometry, borders,
 * theming) so a page cannot quietly reintroduce a one-off control.
 */

const CONTROL_HEIGHTS = { sm: 28, md: 32, lg: 40 } as const;
const RADIUS_SM = '6px';

type ControlMetrics = {
  height: number;
  radius: string;
  size: keyof typeof CONTROL_HEIGHTS;
};

async function collectButtonMetrics(page: import('@playwright/test').Page) {
  return page.$$eval('.btn:visible', (nodes) =>
    nodes.map((node) => {
      const element = node as HTMLElement;
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      const classes = element.classList;
      return {
        height: Math.round(rect.height),
        radius: style.borderTopLeftRadius,
        size: classes.contains('btn-sm')
          ? 'sm'
          : classes.contains('btn-lg')
            ? 'lg'
            : 'md',
      };
    }),
  ) as Promise<ControlMetrics[]>;
}

test.describe('control geometry', () => {
  test('marketplace buttons share one radius and the size scale', async ({
    page,
  }) => {
    await page.goto('/');
    const metrics = await collectButtonMetrics(page);
    expect(metrics.length).toBeGreaterThan(0);

    for (const metric of metrics) {
      expect(metric.radius).toBe(RADIUS_SM);
      expect(metric.height).toBe(CONTROL_HEIGHTS[metric.size]);
    }
  });

  test('icon-only buttons stay square at their size step', async ({ page }) => {
    await page.goto('/');
    const iconButtons = await page.$$eval('.btn-icon:visible', (nodes) =>
      nodes.map((node) => {
        const rect = (node as HTMLElement).getBoundingClientRect();
        return {
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        };
      }),
    );

    expect(iconButtons.length).toBeGreaterThan(0);
    for (const button of iconButtons) {
      expect(button.width).toBe(button.height);
    }
  });

  // An input and a button sharing a row must be the same height. The
  // newsletter form used to mix a 36px input with a stretched 36px button, and
  // filter rows paired 40px fields with 32px buttons.
  for (const path of ['/', '/properties']) {
    test(`control rows pair matching heights on ${path}`, async ({ page }) => {
      await page.goto(path);
      const rows = await page.evaluate(() => {
        const controls = Array.from(
          document.querySelectorAll<HTMLElement>('input.field, select.field'),
        );
        const pairs: Array<{ input: number; button: number }> = [];

        for (const control of controls) {
          const button =
            control.parentElement?.querySelector<HTMLElement>('.btn');
          if (!button) continue;

          const controlBox = control.getBoundingClientRect();
          const buttonBox = button.getBoundingClientRect();
          // Only compare controls that actually share a visual row.
          if (
            controlBox.height === 0 ||
            Math.abs(controlBox.top - buttonBox.top) > 4
          ) {
            continue;
          }
          pairs.push({
            input: Math.round(controlBox.height),
            button: Math.round(buttonBox.height),
          });
        }

        return pairs;
      });

      expect(rows.length).toBeGreaterThan(0);
      for (const row of rows) {
        expect(row.button).toBe(row.input);
      }
    });
  }

  test('auth fields share one radius and height', async ({ page }) => {
    await page.goto('/signin');
    const fields = await page.$$eval('input.field:visible', (nodes) =>
      nodes.map((node) => {
        const style = window.getComputedStyle(node as HTMLElement);
        return {
          height: Math.round(
            (node as HTMLElement).getBoundingClientRect().height,
          ),
          radius: style.borderTopLeftRadius,
          borderWidth: style.borderTopWidth,
        };
      }),
    );

    expect(fields.length).toBeGreaterThan(0);
    for (const field of fields) {
      expect(field.radius).toBe(RADIUS_SM);
      expect(field.height).toBe(CONTROL_HEIGHTS.lg);
      expect(field.borderWidth).toBe('1px');
    }
  });
});

test.describe('keyboard access', () => {
  test('the skip link is the first tab stop and reaches the main landmark', async ({
    page,
  }) => {
    await page.goto('/');
    const skipLink = page.locator('a.skip-link');
    await expect(skipLink).toBeAttached();

    // Parked off-screen until it receives focus.
    expect((await skipLink.boundingBox())?.y ?? 0).toBeLessThan(0);

    await page.keyboard.press('Tab');
    await expect(skipLink).toBeFocused();
    // It animates into view, so poll instead of reading the first frame.
    await expect
      .poll(async () => (await skipLink.boundingBox())?.y ?? -1)
      .toBeGreaterThanOrEqual(0);

    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#main-content$/);
  });

  test('keyboard focus draws a visible ring', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const outline = await page
      .locator('a.skip-link')
      .evaluate((node) => window.getComputedStyle(node).outlineWidth);
    expect(outline).toBe('2px');
  });
});

test.describe('theming', () => {
  test('dark mode comes from tokens, not a second stylesheet', async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    const lightBackground = await page.evaluate(
      () => window.getComputedStyle(document.body).backgroundColor,
    );
    expect(lightBackground).toBe('rgb(246, 248, 250)');

    await page.emulateMedia({ colorScheme: 'dark' });
    await expect
      .poll(() =>
        page.evaluate(
          () => window.getComputedStyle(document.body).backgroundColor,
        ),
      )
      .toBe('rgb(13, 17, 23)');

    const panel = await page
      .locator('.panel')
      .first()
      .evaluate((node) => window.getComputedStyle(node).backgroundColor);
    expect(panel).toBe('rgb(21, 27, 35)');
  });
});

test.describe('not-found handling', () => {
  test('an unknown listing returns a real 404 status', async ({ page }) => {
    const response = await page.goto('/properties/this-listing-does-not-exist');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
