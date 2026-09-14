'use client';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

export function PortalTopbar({
  onMenu,
  context,
}: {
  onMenu: () => void;
  context?: React.ReactNode;
}) {
  const pathname = usePathname();
  const t = useTranslations('common');
  const crumbs = pathname.split('/').filter(Boolean).join(' / ');

  return (
    <header className="sticky top-0 z-20 flex min-h-14 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)]/96 px-4 shadow-[var(--shadow-xs)] backdrop-blur sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <button
          aria-label="Open navigation"
          className="mr-1 rounded-[var(--radius-md)] p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--text)] lg:hidden"
          onClick={onMenu}
        >
          ☰
        </button>
        <div className="truncate text-xs font-medium text-[var(--text-muted)]">
          {crumbs || t('status.overview')}
        </div>
      </div>
      {context && <div className="ml-4 shrink-0">{context}</div>}
    </header>
  );
}
