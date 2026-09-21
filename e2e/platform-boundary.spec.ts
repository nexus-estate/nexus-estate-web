import { expect, test } from '@playwright/test';

const platform = process.env.WEB_PLATFORM ?? 'marketplace';

test.describe(`platform boundary: ${platform}`, () => {
  test('keeps the health endpoint available', async ({ request }) => {
    const response = await request.get('/api/healthz');

    expect(response.status()).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: 'ok' });
  });

  test('preserves static assets', async ({ request }) => {
    expect((await request.get('/favicon.ico')).status()).toBe(200);
  });

  if (platform === 'marketplace') {
    test('allows Marketplace routes and blocks foreign portals', async ({
      request,
    }) => {
      expect((await request.get('/')).status()).toBe(200);
      expect((await request.get('/properties')).status()).toBe(200);
      expect((await request.get('/admin')).status()).toBe(404);
      expect((await request.get('/provider')).status()).toBe(404);
    });
  }

  if (platform === 'provider') {
    test('redirects root to the Provider landing and blocks foreign routes', async ({
      request,
    }) => {
      const root = await request.get('/', { maxRedirects: 0 });
      expect(root.status()).toBe(307);
      expect(root.headers().location).toMatch(/\/provider$/);
      expect((await request.get('/provider')).status()).toBe(200);
      expect((await request.get('/admin')).status()).toBe(404);
      expect((await request.get('/dashboard')).status()).toBe(404);
    });

    test('serves the Provider supply workspace routes', async ({ request }) => {
      expect((await request.get('/provider/properties')).status()).toBe(200);
      expect((await request.get('/provider/properties/new')).status()).toBe(
        200,
      );
      expect((await request.get('/provider/listings')).status()).toBe(200);
      expect((await request.get('/provider/listings/new')).status()).toBe(200);
    });
  }

  if (platform === 'admin') {
    test('redirects root to Admin and blocks foreign portals', async ({
      request,
    }) => {
      const root = await request.get('/', { maxRedirects: 0 });
      expect(root.status()).toBe(307);
      expect(root.headers().location).toMatch(/\/admin$/);
      expect((await request.get('/admin/login')).status()).toBe(200);
      expect((await request.get('/provider')).status()).toBe(404);
      expect((await request.get('/dashboard')).status()).toBe(404);
    });
  }
});
