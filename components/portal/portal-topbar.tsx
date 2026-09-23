'use client';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { getPortalRouteMetadata } from './route-metadata';

export function PortalTopbar({
  onMenu,
  context,
  open = false,
  menuButtonRef,
}: {
  onMenu: () => void;
  context?: React.ReactNode;
  /** Mirrors the drawer state so the trigger can expose aria-expanded. */
  open?: boolean;
  menuButtonRef?: React.Ref<HTMLButtonElement>;
}) {
  const pathname = usePathname();
  const t = useTranslations('common');
  const routeKey =
    getPortalRouteMetadata(pathname)?.labelKey ?? 'status.overview';

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-[var(--border)] bg-[var(--surface)]/95 px-4 backdrop-blur sm:px-6">
      <button
        ref={menuButtonRef}
        type="button"
        aria-label={t('navigation.openNavigation')}
        aria-expanded={open}
        aria-controls="portal-sidebar"
        className="btn btn-ghost px-2 lg:hidden"
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
      <div className="min-w-0 truncate text-xs font-medium text-[var(--text-muted)]">
        {t(routeKey)}
      </div>
      {context && (
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {context}
        </div>
      )}
    </header>
  );
}
