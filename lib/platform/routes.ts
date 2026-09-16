import type { WebPlatform } from './config';

export type PlatformRequestDecision =
  | { type: 'allow' }
  | { type: 'not-found' }
  | { type: 'redirect'; destination: '/admin' | '/provider' };

type RouteClass =
  'shared' | 'marketplace' | 'provider' | 'admin' | 'customer-auth' | 'unknown';

const CUSTOMER_ROUTES = ['/', '/properties', '/profile', '/dashboard'] as const;

const isPath = (pathname: string, route: string) =>
  pathname === route || pathname.startsWith(`${route}/`);

function isStaticAsset(pathname: string) {
  return (
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname.startsWith('/_next/') ||
    /\.(?:avif|css|gif|ico|jpeg|jpg|js|json|map|png|svg|webp|woff2?)$/i.test(
      pathname,
    )
  );
}

function classifyRoute(pathname: string): RouteClass {
  if (isStaticAsset(pathname) || pathname === '/api/healthz') return 'shared';
  if (isPath(pathname, '/admin')) return 'admin';
  if (isPath(pathname, '/provider')) return 'provider';
  if (isPath(pathname, '/signin') || isPath(pathname, '/signup'))
    return 'customer-auth';
  if (CUSTOMER_ROUTES.some((route) => isPath(pathname, route)))
    return 'marketplace';
  return 'unknown';
}

/**
 * The route ownership map is deliberately based on the current App Router
 * tree. Provider is /provider/* in this revision; /dashboard/* is Customer.
 */
export const ROUTE_OWNERSHIP = {
  marketplace: [...CUSTOMER_ROUTES],
  provider: ['/provider'],
  admin: ['/admin'],
  customerAuth: ['/signin', '/signup'],
  shared: [
    '/_next/*',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
    '/api/healthz',
  ],
} as const;

export function getRouteClass(pathname: string): RouteClass {
  return classifyRoute(pathname);
}

export function getPlatformRequestDecision(
  platform: WebPlatform,
  pathname: string,
): PlatformRequestDecision {
  if (pathname === '/') {
    if (platform === 'provider')
      return { type: 'redirect', destination: '/provider' };
    if (platform === 'admin')
      return { type: 'redirect', destination: '/admin' };
    return { type: 'allow' };
  }

  const routeClass = classifyRoute(pathname);
  if (routeClass === 'shared') return { type: 'allow' };
  if (routeClass === 'unknown') return { type: 'not-found' };

  const allowed =
    (platform === 'marketplace' &&
      (routeClass === 'marketplace' || routeClass === 'customer-auth')) ||
    (platform === 'provider' &&
      (routeClass === 'provider' || routeClass === 'customer-auth')) ||
    (platform === 'admin' && routeClass === 'admin');

  return allowed ? { type: 'allow' } : { type: 'not-found' };
}
