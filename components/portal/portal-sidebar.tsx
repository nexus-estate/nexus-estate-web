'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from './language-switcher';
export interface PortalNavItem {
  label: string;
  href: string;
  requiredPermission?: string;
}
export function PortalSidebar({
  platform,
  items,
  open,
  onClose,
  identity,
}: {
  platform: string;
  items: PortalNavItem[];
  open: boolean;
  onClose: () => void;
  identity?: React.ReactNode;
}) {
  const pathname = usePathname();
  const t = useTranslations('common');
  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-black/30 lg:hidden ${open ? 'block' : 'hidden'}`}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-[var(--border)] bg-[var(--surface)] transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex h-full flex-col p-4">
          <div className="border-b border-[var(--border)] px-3 pb-5">
            <div className="text-lg font-semibold text-[var(--text)]">
              Nexus Estate
            </div>
            <div className="mt-1 text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
              {platform} portal
            </div>
            {identity}
          </div>
          <nav className="mt-5 space-y-1">
            {items.map((item) => (
              <Link
                key={item.href}
                onClick={onClose}
                href={item.href}
                className={`block rounded-md px-3 py-2 text-sm ${pathname === item.href || pathname.startsWith(`${item.href}/`) ? 'bg-[var(--primary-soft)] font-medium text-[var(--primary)]' : 'text-[var(--text-muted)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text)]'}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto border-t border-[var(--border)] pt-4">
            <div className="px-3 text-xs text-[var(--text-muted)]">
              <span className="sr-only">Portal</span>
              {t('status.signedInWorkspace')}
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </aside>
    </>
  );
}
