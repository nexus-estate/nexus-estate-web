/** Read-only browser QA against a running Marketplace and its real public API.
 * Run: node scripts/verify-marketplace.mjs
 * Optional: MARKETPLACE_PREVIEW_URL, MARKETPLACE_API_URL, MARKETPLACE_QA_OUTPUT.
 * Does not create accounts, estates, listings, or leads; no API response fixtures.
 */
/* eslint-disable no-console -- This command-line QA script prints verification results. */
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';

const base = process.env.MARKETPLACE_PREVIEW_URL ?? 'http://localhost:3000';
const api = process.env.MARKETPLACE_API_URL ?? 'http://localhost:3001/api/v1';
const output = resolve(
  process.env.MARKETPLACE_QA_OUTPUT ?? 'test-results/marketplace-redesign',
);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const report = {
  capturedAt: new Date().toISOString(),
  viewports: [],
  checks: [],
  pageErrors: [],
};
try {
  const context = await browser.newContext();
  await context.addCookies([
    {
      name: 'nexus.locale',
      value: 'vi',
      domain: new URL(base).hostname,
      path: '/',
    },
  ]);
  let page = await context.newPage();
  page.on('pageerror', (error) => report.pageErrors.push(error.message));
  const listingResponse = await context.request.get(`${api}/listings`);
  assert.equal(
    listingResponse.ok(),
    true,
    'Public listings API must be available',
  );
  const listing = (await listingResponse.json()).data.items[0];
  assert.ok(
    listing,
    'A real published listing is required to verify the detail route',
  );
  const detailRoute = `/properties/${listing.id}`;
  report.listingId = listing.id;
  const promotedResponse = await context.request.get(
    `${api}/listings/promoted`,
  );
  assert.equal(
    promotedResponse.ok(),
    true,
    'Public promoted API must be available',
  );
  const promotedListings = (await promotedResponse.json()).data;
  report.promotedListingIds = promotedListings.map((item) => item.id);
  async function settle() {
    await page.waitForLoadState('networkidle');
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(
        [...document.images].map(async (image) => {
          if (image.loading === 'lazy') image.loading = 'eager';
          try {
            await image.decode();
          } catch {
            /* Broken media must retain its real error state. */
          }
        }),
      );
    });
    // Allow responsive image decode/compositing to paint before full-page capture.
    await page.waitForTimeout(250);
    // Hide Next's development badge only, never application UI.
    await page.addStyleTag({
      content: 'nextjs-portal { display: none !important; }',
    });
  }
  for (const [width, height] of [
    [1440, 900],
    [1280, 800],
    [768, 1024],
    [390, 844],
  ]) {
    for (const [name, route, selector] of [
      ['home', '/', '.mp-property-card'],
      ['browse', '/properties', '.mp-property-card'],
      ['detail', detailRoute, '.mp-property-summary'],
    ]) {
      await page.close();
      page = await context.newPage();
      await page.setViewportSize({ width, height });
      page.on('pageerror', (error) => report.pageErrors.push(error.message));
      await page.goto(base + route);
      await page.locator(selector).first().waitFor();
      await settle();
      if (name === 'home') {
        const promotionLinks = await page
          .locator('.mp-promotions .mp-property-card')
          .evaluateAll((cards) =>
            cards.map((card) => card.getAttribute('href')),
          );
        assert.deepEqual(
          promotionLinks,
          promotedListings.map((item) => `/properties/${item.id}`),
          'Homepage must render every listing from the promoted endpoint in order',
        );
        assert.equal(
          await page.locator('.mp-promotions .mp-promotion-badge').count(),
          promotedListings.length,
          'Each promoted listing must have its promotion badge',
        );
      }
      const measurements = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        viewportWidth: innerWidth,
        headerHeight: document
          .querySelector('.mp-header')
          .getBoundingClientRect().height,
        heroHeight: document.querySelector('.mp-hero')?.getBoundingClientRect()
          .height,
        galleryHeight: document
          .querySelector('.mp-gallery')
          ?.getBoundingClientRect().height,
        cards: document.querySelectorAll('.mp-property-card').length,
        failedImages: [...document.images].filter(
          (image) => !image.naturalWidth,
        ).length,
      }));
      await page.screenshot({
        path: `${output}/${name}-${width}.png`,
        fullPage: true,
      });
      report.viewports.push({ name, width, height, ...measurements });
      assert.ok(
        measurements.scrollWidth <= width,
        `${name} must not overflow at ${width}px`,
      );
      console.info(`${name} ${width}×${height}: no overflow`);
    }
  }
  await page.getByRole('button', { name: 'Mở menu', exact: true }).click();
  await page
    .locator('#marketplace-mobile-nav')
    .getByRole('link', { name: 'Thuê', exact: true })
    .click();
  await page.waitForURL('**/properties?purpose=RENT');
  assert.equal(
    await page.locator('.mp-filter-bar select').first().inputValue(),
    'RENT',
  );
  report.checks.push('Mobile navigation and sale/rental URL state');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(base);
  await page
    .locator('.mp-search-tabs label')
    .filter({ hasText: 'Thuê' })
    .click();
  await page.locator('.mp-hero-search button[type="submit"]').click();
  await page.waitForURL('**/properties?purpose=RENT&q=');
  await settle();
  assert.equal(
    await page.locator('.mp-filter-bar select').first().inputValue(),
    'RENT',
  );
  await page
    .locator('.mp-desktop-nav')
    .getByRole('link', { name: 'Mua', exact: true })
    .click();
  await page.waitForURL('**/properties?purpose=SALE');
  assert.equal(
    await page.locator('.mp-filter-bar select').first().inputValue(),
    'SALE',
  );
  report.checks.push(
    'Hero search, rental filter, and client navigation from rent to buy',
  );
  await page.locator('.mp-filter-reset').click();
  await page
    .locator('#property-province')
    .selectOption(listing.estate.provinceId);
  await page.waitForFunction(
    (id) =>
      [...document.querySelectorAll('.mp-filter-bar select option')].some(
        (option) => option.value === id,
      ),
    listing.estate.wardId,
  );
  await page
    .locator('.mp-filter-bar select')
    .last()
    .selectOption(listing.estate.wardId);
  await settle();
  assert.ok((await page.locator('.mp-property-card').count()) > 0);
  await page.locator('#property-province').selectOption('');
  assert.equal(
    await page.locator('.mp-filter-bar select').last().inputValue(),
    '',
  );
  assert.equal(
    await page.locator('.mp-filter-bar select').last().isDisabled(),
    true,
  );
  report.checks.push('Real province/ward filters and dependent ward reset');
  await page
    .locator('.mp-filter-bar input[type="search"]')
    .fill('no-property-matches-this-query-qa');
  await page.locator('.mp-empty').waitFor();
  assert.equal(await page.locator('.mp-property-card').count(), 0);
  await page.locator('.mp-filter-reset').click();
  await page.locator('.mp-property-card').first().waitFor();
  await page.locator('.mp-results-heading select').selectOption('price_asc');
  const prices = await page
    .locator('.mp-property-grid .mp-property-price')
    .allTextContents();
  const numericPrices = prices.map((price) =>
    Number(price.replace(/[^0-9]/g, '')),
  );
  assert.deepEqual(
    numericPrices,
    [...numericPrices].sort((a, b) => a - b),
  );
  report.checks.push('Search empty state, filter reset, and price sorting');
  await page.goto(base + detailRoute);
  await page.locator('.mp-gallery-view').waitFor();
  await settle();
  const mediaResponse = await context.request.get(
    `${api}/estates/${listing.estate.id}/media`,
  );
  const media = (await mediaResponse.json()).data
    .filter(
      (item) => item.type === 'image' && item.estateId === listing.estate.id,
    )
    .sort((a, b) => a.sortOrder - b.sortOrder);
  assert.ok(media.length > 0);
  assert.ok(
    (await page.locator('.mp-gallery-main img').getAttribute('src')).includes(
      media[0].id,
    ),
  );
  await page.locator('.mp-gallery-view').click();
  const dialog = page.getByRole('dialog');
  await dialog.waitFor();
  await dialog.press('ArrowLeft');
  assert.ok(
    (await dialog.textContent()).includes(`${media.length} / ${media.length}`),
  );
  await dialog.press('ArrowRight');
  assert.ok((await dialog.textContent()).includes(`1 / ${media.length}`));
  await page.screenshot({ path: `${output}/gallery-lightbox.png` });
  await dialog.press('Escape');
  await dialog.waitFor({ state: 'detached' });
  assert.equal(
    await page
      .locator('.mp-gallery-view')
      .evaluate((element) => element === document.activeElement),
    true,
  );
  report.checks.push(
    'Real media order, lightbox, arrow keys, wraparound, Escape, and restored focus',
  );
  await page.locator('.mp-section-nav a[href="#property-location"]').click();
  assert.ok(page.url().endsWith('#property-location'));
  await page.getByRole('button', { name: /Liên hệ người đăng/ }).click();
  assert.equal(await page.locator('#property-enquiry').isVisible(), true);
  assert.equal(
    await page
      .locator('#property-enquiry input[type="tel"]')
      .getAttribute('required'),
    '',
  );
  // Opening and validating the form is read-only; do not send a real lead.
  report.checks.push(
    'Section anchors and enquiry form expansion with required contact fields',
  );
  const providerLink = page.locator('.mp-desktop-nav a').last();
  assert.equal(
    new URL(await providerLink.getAttribute('href')).port,
    new URL(process.env.NEXT_PUBLIC_PROVIDER_URL ?? 'http://localhost:3003')
      .port,
  );
  report.checks.push('Provider navigation retains the separate platform URL');
  assert.deepEqual(report.pageErrors, []);
  console.info(
    `Passed ${report.checks.length} interaction checks; no uncaught page errors.`,
  );
} finally {
  await writeFile(
    `${output}/verification.json`,
    JSON.stringify(report, null, 2),
  );
  await browser.close();
}
