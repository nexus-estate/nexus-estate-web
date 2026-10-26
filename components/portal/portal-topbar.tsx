'use client';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { getPortalRouteMetadata } from './route-metadata';

export function PortalTopbar({
  onMenu,
  context,
  appearance = 'default',
}: {
  onMenu: () => void;
  context?: React.ReactNode;
  appearance?: 'default' | 'administration';
}) {
  const pathname = usePathname();
  const t = useTranslations('common');
  const routeKey =
    getPortalRouteMetadata(pathname)?.labelKey ?? 'status.overview';

  return (
    <header
      className={`sticky top-0 z-20 flex min-h-16 items-center justify-between border-b px-4 backdrop-blur sm:px-6 ${appearance === 'administration' ? 'border-[var(--border)] bg-white/90 shadow-[0_1px_0_rgb(16_44_43_/_0.04)]' : 'border-[var(--border)] bg-[var(--surface)]/96 shadow-[var(--shadow-xs)]'}`}
    >
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          aria-label={t('navigation.openNavigation')}
          className="mr-1 rounded-[var(--radius-md)] p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--text)] lg:hidden"
          onClick={onMenu}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
            <path
              d="M4 6h16M4 12h16M4 18h16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <div className="truncate text-xs font-medium text-[var(--text-muted)]">
          {t(routeKey)}
        </div>
      </div>
      {context && <div className="ml-4 shrink-0">{context}</div>}
    </header>
  );
}
