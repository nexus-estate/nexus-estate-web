import {
  getPortalBreadcrumbs,
  getPortalRouteMetadata,
  withAuthorizationPlatformQuery,
} from './route-metadata';

describe('portal route metadata', () => {
  it('uses localized semantic labels for nested authorization routes', () => {
    const route = getPortalRouteMetadata('/admin/authorization/roles/role-1');
    const breadcrumbs = getPortalBreadcrumbs(
      '/admin/authorization/roles/role-1',
    );

    expect(route?.labelKey).toBe('navigation.roles');
    expect(breadcrumbs.map(({ labelKey }) => labelKey)).toEqual([
      'navigation.admin',
      'navigation.authorization',
      'navigation.roles',
    ]);
    expect(breadcrumbs.map(({ labelKey }) => labelKey).join('/')).not.toContain(
      'role-1',
    );
  });

  it('preserves the authorization platform context in breadcrumb links', () => {
    const breadcrumbs = withAuthorizationPlatformQuery(
      getPortalBreadcrumbs('/admin/authorization/roles/123'),
      'platform=PROVIDER&unrelated=ignored',
    );

    expect(breadcrumbs.map(({ href }) => href)).toEqual([
      '/admin',
      '/admin/authorization?platform=PROVIDER',
      '/admin/authorization?platform=PROVIDER',
    ]);
  });
});
