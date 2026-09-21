import {
  getActiveNavigationHref,
  matchesNavigation,
} from './portal-navigation';

const providerItems = [
  { href: '/provider', match: 'exact' as const },
  { href: '/provider/properties', match: 'prefix' as const },
  { href: '/provider/listings', match: 'prefix' as const },
  { href: '/provider/account', match: 'prefix' as const },
  { href: '/provider/authorization', match: 'exact' as const },
];

const adminItems = [
  { href: '/admin', match: 'exact' as const },
  { href: '/admin/provider-requests', match: 'prefix' as const },
  {
    href: '/admin/authorization?platform=MARKETPLACE',
    match: 'prefix' as const,
  },
  {
    href: '/admin/authorization/matrix?platform=MARKETPLACE',
    match: 'exact' as const,
  },
  {
    href: '/admin/authorization/permissions?platform=MARKETPLACE',
    match: 'prefix' as const,
  },
  {
    href: '/admin/authorization/subjects?platform=MARKETPLACE',
    match: 'prefix' as const,
  },
  { href: '/admin/authorization/audit', match: 'exact' as const },
];

describe('portal navigation matching', () => {
  it.each([
    ['/provider', '/provider'],
    ['/provider/properties', '/provider/properties'],
    ['/provider/properties/new', '/provider/properties'],
    ['/provider/listings', '/provider/listings'],
    ['/provider/listings/new', '/provider/listings'],
    ['/provider/account', '/provider/account'],
    ['/provider/account?tab=billing', '/provider/account'],
  ])('selects one Provider target for %s', (pathname, expected) => {
    expect(getActiveNavigationHref(pathname, providerItems)).toBe(expected);
  });

  it.each([
    ['/admin', '/admin'],
    ['/admin/provider-requests', '/admin/provider-requests'],
    ['/admin/provider-requests/request-1', '/admin/provider-requests'],
    ['/admin/authorization', '/admin/authorization?platform=MARKETPLACE'],
    [
      '/admin/authorization?platform=MARKETPLACE',
      '/admin/authorization?platform=MARKETPLACE',
    ],
    [
      '/admin/authorization/roles/role-1?platform=PROVIDER',
      '/admin/authorization?platform=MARKETPLACE',
    ],
    [
      '/admin/authorization/matrix?platform=PROVIDER',
      '/admin/authorization/matrix?platform=MARKETPLACE',
    ],
    [
      '/admin/authorization/permissions/permission-1?platform=PROVIDER',
      '/admin/authorization/permissions?platform=MARKETPLACE',
    ],
    [
      '/admin/authorization/subjects/subject-1?platform=PROVIDER',
      '/admin/authorization/subjects?platform=MARKETPLACE',
    ],
    ['/admin/authorization/audit', '/admin/authorization/audit'],
  ])('selects one Administration target for %s', (pathname, expected) => {
    expect(getActiveNavigationHref(pathname, adminItems)).toBe(expected);
  });

  it('has exactly one active Administration target on every supported route', () => {
    const routes = [
      '/admin',
      '/admin/provider-requests/request-1',
      '/admin/authorization',
      '/admin/authorization/roles/role-1?platform=PROVIDER',
      '/admin/authorization/matrix?platform=PROVIDER',
      '/admin/authorization/permissions/permission-1?platform=PROVIDER',
      '/admin/authorization/subjects/subject-1?platform=PROVIDER',
      '/admin/authorization/audit',
    ];

    routes.forEach((route) => {
      const activeHref = getActiveNavigationHref(route, adminItems);
      expect(activeHref).toBeDefined();
      expect(
        adminItems.filter((item) => item.href === activeHref),
      ).toHaveLength(1);
    });
  });

  it('does not activate an exact parent for a nested route', () => {
    expect(matchesNavigation('/provider/account', providerItems[0])).toBe(
      false,
    );
    expect(getActiveNavigationHref('/provider/account', providerItems)).toBe(
      '/provider/account',
    );
  });
});
