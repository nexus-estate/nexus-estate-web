import { getPlatformRequestDecision, getRouteClass } from './routes';

describe('platform route boundary', () => {
  it.each([
    ['marketplace', '/', 'allow'],
    ['marketplace', '/properties', 'allow'],
    ['marketplace', '/properties/123', 'allow'],
    ['marketplace', '/admin', 'not-found'],
    ['marketplace', '/dashboard', 'allow'],
    ['marketplace', '/provider', 'not-found'],
    ['provider', '/', 'redirect'],
    ['provider', '/provider', 'allow'],
    ['provider', '/provider/account', 'allow'],
    ['provider', '/admin', 'not-found'],
    ['provider', '/dashboard', 'not-found'],
    ['provider', '/properties', 'not-found'],
    ['admin', '/', 'redirect'],
    ['admin', '/admin', 'allow'],
    ['admin', '/admin/authorization/roles', 'allow'],
    ['admin', '/dashboard', 'not-found'],
    ['admin', '/provider', 'not-found'],
    ['admin', '/signin', 'not-found'],
  ] as const)('%s %s => %s', (platform, pathname, type) => {
    expect(getPlatformRequestDecision(platform, pathname).type).toBe(type);
  });

  it.each([
    '/_next/static/chunk.js',
    '/_next/image?url=%2Fhero-villa.webp',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
    '/images/properties/villa-dalat.webp',
    '/api/healthz',
  ])('allows shared asset or health path %s for every platform', (pathname) => {
    for (const platform of ['marketplace', 'provider', 'admin'] as const) {
      expect(getPlatformRequestDecision(platform, pathname)).toEqual({
        type: 'allow',
      });
    }
  });

  it('classifies the audited route tree', () => {
    expect(getRouteClass('/dashboard/listings/new')).toBe('marketplace');
    expect(getRouteClass('/provider/onboarding')).toBe('provider');
    expect(getRouteClass('/admin/providers/requests')).toBe('admin');
    expect(getRouteClass('/signin')).toBe('customer-auth');
  });
});
