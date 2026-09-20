export interface PortalBreadcrumb {
  href?: string;
  labelKey: string;
}

interface PortalRouteMetadata {
  path: string;
  labelKey: string;
  match: 'exact' | 'prefix';
  breadcrumbs: readonly PortalBreadcrumb[];
}

const navigation = (labelKey: string, href: string): PortalBreadcrumb => ({
  href,
  labelKey,
});

export const PORTAL_ROUTE_METADATA: readonly PortalRouteMetadata[] = [
  {
    path: '/admin/authorization/permissions',
    labelKey: 'navigation.permissions',
    match: 'prefix',
    breadcrumbs: [
      navigation('navigation.admin', '/admin'),
      navigation('navigation.authorization', '/admin/authorization'),
      navigation('navigation.permissions', '/admin/authorization/permissions'),
    ],
  },
  {
    path: '/admin/authorization/roles',
    labelKey: 'navigation.roles',
    match: 'prefix',
    breadcrumbs: [
      navigation('navigation.admin', '/admin'),
      navigation('navigation.authorization', '/admin/authorization'),
      navigation('navigation.roles', '/admin/authorization'),
    ],
  },
  {
    path: '/admin/authorization/subjects',
    labelKey: 'navigation.subjects',
    match: 'prefix',
    breadcrumbs: [
      navigation('navigation.admin', '/admin'),
      navigation('navigation.authorization', '/admin/authorization'),
      navigation('navigation.subjects', '/admin/authorization/subjects'),
    ],
  },
  {
    path: '/admin/authorization/matrix',
    labelKey: 'navigation.matrix',
    match: 'exact',
    breadcrumbs: [
      navigation('navigation.admin', '/admin'),
      navigation('navigation.authorization', '/admin/authorization'),
      navigation('navigation.matrix', '/admin/authorization/matrix'),
    ],
  },
  {
    path: '/admin/authorization/audit',
    labelKey: 'navigation.audit',
    match: 'exact',
    breadcrumbs: [
      navigation('navigation.admin', '/admin'),
      navigation('navigation.authorization', '/admin/authorization'),
      navigation('navigation.audit', '/admin/authorization/audit'),
    ],
  },
  {
    path: '/admin/authorization',
    labelKey: 'navigation.authorization',
    match: 'exact',
    breadcrumbs: [
      navigation('navigation.admin', '/admin'),
      navigation('navigation.authorization', '/admin/authorization'),
    ],
  },
  {
    path: '/admin/provider-requests',
    labelKey: 'navigation.providerReview',
    match: 'prefix',
    breadcrumbs: [
      navigation('navigation.admin', '/admin'),
      navigation('navigation.providerReview', '/admin/provider-requests'),
    ],
  },
  {
    path: '/admin',
    labelKey: 'navigation.admin',
    match: 'exact',
    breadcrumbs: [navigation('navigation.admin', '/admin')],
  },
  {
    path: '/provider/authorization',
    labelKey: 'navigation.providerAuthorization',
    match: 'exact',
    breadcrumbs: [
      navigation('navigation.provider', '/provider'),
      navigation('navigation.providerAuthorization', '/provider/authorization'),
    ],
  },
  {
    path: '/provider/account',
    labelKey: 'navigation.providerAccount',
    match: 'prefix',
    breadcrumbs: [
      navigation('navigation.provider', '/provider'),
      navigation('navigation.providerAccount', '/provider/account'),
    ],
  },
  {
    path: '/provider',
    labelKey: 'navigation.provider',
    match: 'exact',
    breadcrumbs: [navigation('navigation.provider', '/provider')],
  },
];

export function getPortalRouteMetadata(pathname: string) {
  return PORTAL_ROUTE_METADATA.filter((route) =>
    route.match === 'prefix'
      ? pathname === route.path || pathname.startsWith(`${route.path}/`)
      : pathname === route.path,
  ).sort((a, b) => b.path.length - a.path.length)[0];
}

export function getPortalBreadcrumbs(pathname: string) {
  return getPortalRouteMetadata(pathname)?.breadcrumbs ?? [];
}

export function withAuthorizationPlatformQuery(
  breadcrumbs: readonly PortalBreadcrumb[],
  search: string | URLSearchParams,
) {
  const params = new URLSearchParams(search);
  const platform = params.get('platform');
  if (!platform) return breadcrumbs;

  return breadcrumbs.map((breadcrumb) => {
    if (!breadcrumb.href?.startsWith('/admin/authorization')) return breadcrumb;
    const separator = breadcrumb.href.includes('?') ? '&' : '?';
    return {
      ...breadcrumb,
      href: `${breadcrumb.href}${separator}platform=${encodeURIComponent(platform)}`,
    };
  });
}
