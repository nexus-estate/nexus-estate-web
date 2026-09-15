export type NavigationMatch = 'exact' | 'prefix';

export interface NavigationTarget {
  href: string;
  match?: NavigationMatch;
}

export function routePath(href: string) {
  const path = href.split('?')[0] || '/';
  return path.length > 1 ? path.replace(/\/$/, '') : path;
}

export function matchesNavigation(pathname: string, target: NavigationTarget) {
  const path = routePath(target.href);
  const current = routePath(pathname);
  return target.match === 'prefix'
    ? current === path || current.startsWith(`${path}/`)
    : current === path;
}

export function getActiveNavigationHref(
  pathname: string,
  targets: readonly NavigationTarget[],
) {
  return targets
    .filter((target) => matchesNavigation(pathname, target))
    .sort((a, b) => routePath(b.href).length - routePath(a.href).length)[0]
    ?.href;
}
