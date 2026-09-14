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
    <header className="sticky top-0 z-20 flex min-h-14 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)]/95 px-4 backdrop-blur sm:px-6">
      <button
        aria-label="Open navigation"
        className="mr-3 rounded p-2 text-[var(--text-muted)] hover:bg-[var(--surface-subtle)] lg:hidden"
        onClick={onMenu}
      >
        ☰
      </button>
      <div className="text-xs text-[var(--text-muted)]">
        {crumbs || t('status.overview')}
      </div>
      {context}
    </header>
  );
}
