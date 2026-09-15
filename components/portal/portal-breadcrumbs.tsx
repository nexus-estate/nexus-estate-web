'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { getPortalBreadcrumbs } from './route-metadata';

export function PortalBreadcrumbs() {
  const pathname = usePathname();
  const t = useTranslations('common');
  const breadcrumbs = getPortalBreadcrumbs(pathname);

  if (!breadcrumbs.length) return null;

  return (
    <nav aria-label={t('navigation.breadcrumbs')} className="mb-4">
      <ol className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
        {breadcrumbs.map((breadcrumb, index) => {
          const isCurrent = index === breadcrumbs.length - 1;
          return (
            <li key={`${breadcrumb.labelKey}-${breadcrumb.href ?? 'current'}`}>
              {isCurrent || !breadcrumb.href ? (
                <span aria-current={isCurrent ? 'page' : undefined}>
                  {t(breadcrumb.labelKey)}
                </span>
              ) : (
                <Link
                  href={breadcrumb.href}
                  className="transition-colors hover:text-[var(--text)] hover:underline"
                >
                  {t(breadcrumb.labelKey)}
                </Link>
              )}
              {!isCurrent && (
                <span
                  aria-hidden="true"
                  className="ml-2 text-[var(--text-subtle)]"
                >
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
