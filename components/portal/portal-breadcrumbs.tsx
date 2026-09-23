'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  getPortalBreadcrumbs,
  withAuthorizationPlatformQuery,
} from './route-metadata';

export function PortalBreadcrumbs() {
  const pathname = usePathname();
  const search = useSearchParams();
  const t = useTranslations('common');
  const breadcrumbs = withAuthorizationPlatformQuery(
    getPortalBreadcrumbs(pathname),
    search,
  );

  if (!breadcrumbs.length) return null;

  return (
    <nav aria-label={t('navigation.breadcrumbs')} className="mb-3">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-[var(--text-muted)]">
        {breadcrumbs.map((breadcrumb, index) => {
          const isCurrent = index === breadcrumbs.length - 1;
          return (
            <li
              key={`${breadcrumb.labelKey}-${breadcrumb.href ?? 'current'}`}
              className="flex items-center gap-1.5"
            >
              {isCurrent || !breadcrumb.href ? (
                <span
                  className="text-[var(--text)]"
                  aria-current={isCurrent ? 'page' : undefined}
                >
                  {t(breadcrumb.labelKey)}
                </span>
              ) : (
                <Link
                  href={breadcrumb.href}
                  className="transition-colors hover:text-[var(--primary)]"
                >
                  {t(breadcrumb.labelKey)}
                </Link>
              )}
              {!isCurrent && (
                <span aria-hidden="true" className="text-[var(--text-subtle)]">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
