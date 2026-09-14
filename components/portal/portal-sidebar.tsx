'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from './language-switcher';

export interface PortalNavItem {
  label: string;
  href: string;
  requiredPermission?: string;
  section?: string;
}

export function PortalSidebar({
  platform,
  items,
  open,
  onClose,
  identity,
  footer,
}: {
  platform: string;
  items: PortalNavItem[];
  open: boolean;
  onClose: () => void;
  identity?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const pathname = usePathname();
  const t = useTranslations('common');

  return (
    <>
      <button
        type="button"
        aria-label="Close navigation"
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-[var(--overlay)] transition-opacity lg:hidden ${open ? 'block' : 'hidden'}`}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-[var(--portal-sidebar-width)] border-r border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-xs)] transition-transform duration-200 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex h-full flex-col px-3 py-4">
          <div className="border-b border-[var(--border-muted)] px-3 pb-5">
            <div className="text-base font-semibold tracking-tight text-[var(--text)]">
              Nexus Estate
            </div>
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-subtle)]">
              {platform} portal
            </div>
            {identity && <div className="mt-4">{identity}</div>}
          </div>

          <nav
            className="mt-4 space-y-0.5"
            aria-label={`${platform} navigation`}
          >
            {items.map((item, index) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              const showSection =
                item.section &&
                (index === 0 || items[index - 1]?.section !== item.section);

              return (
                <div key={item.href}>
                  {showSection && (
                    <div className="px-3 pb-1 pt-4 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-subtle)]">
                      {item.section}
                    </div>
                  )}
                  <Link
                    onClick={onClose}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={`relative block rounded-[var(--radius-md)] px-3 py-2 text-sm transition-colors ${active ? 'bg-[var(--surface-selected)] font-semibold text-[var(--primary)]' : 'text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]'}`}
                  >
                    {active && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-[var(--primary)]"
                      />
                    )}
                    {item.label}
                  </Link>
                </div>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-[var(--border-muted)] pt-4">
            {footer}
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
