import {
  getActiveNavigationHref,
  matchesNavigation,
} from './portal-navigation';

const providerItems = [
  { href: '/provider', match: 'exact' as const },
  { href: '/provider/account', match: 'prefix' as const },
  { href: '/provider/authorization', match: 'exact' as const },
];

const adminItems = [
  { href: '/admin', match: 'exact' as const },
  { href: '/admin/authorization', match: 'exact' as const },
  { href: '/admin/authorization/roles', match: 'prefix' as const },
];

describe('portal navigation matching', () => {
  it.each([
    ['/provider', '/provider'],
    ['/provider/account', '/provider/account'],
    ['/provider/account?tab=billing', '/provider/account'],
  ])('selects one Provider target for %s', (pathname, expected) => {
    expect(getActiveNavigationHref(pathname, providerItems)).toBe(expected);
  });

  it.each([
    ['/admin', '/admin'],
    ['/admin/authorization', '/admin/authorization'],
    ['/admin/authorization/roles', '/admin/authorization/roles'],
    ['/admin/authorization/roles?id=role-1', '/admin/authorization/roles'],
  ])('selects one Administration target for %s', (pathname, expected) => {
    expect(getActiveNavigationHref(pathname, adminItems)).toBe(expected);
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
