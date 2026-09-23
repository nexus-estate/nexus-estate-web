'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from './language-switcher';
import {
  getActiveNavigationHref,
  type NavigationMatch,
} from './portal-navigation';

export interface PortalNavItem {
  label: string;
  href: string;
  requiredPermission?: string;
  section?: string;
  match?: NavigationMatch;
}

export function PortalSidebar({
  platform,
  items,
  open,
  onClose,
  identity,
  footer,
  isDesktop = true,
  asideRef,
}: {
  platform: string;
  items: PortalNavItem[];
  open: boolean;
  onClose: () => void;
  identity?: React.ReactNode;
  footer?: React.ReactNode;
  /** Drawn permanently on wide viewports; a dismissible drawer below `lg`. */
  isDesktop?: boolean;
  asideRef?: React.Ref<HTMLElement>;
}) {
  const pathname = usePathname();
  const t = useTranslations('common');
  const activeHref = getActiveNavigationHref(pathname, items);

  return (
    <>
      <button
        type="button"
        aria-label={t('navigation.closeNavigation')}
        aria-hidden={!open}
        tabIndex={open ? 0 : -1}
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-[var(--overlay)] transition-opacity lg:hidden ${open ? 'block' : 'hidden'}`}
      />
      <aside
        id="portal-sidebar"
        ref={asideRef}
        // Off-canvas on mobile: keep it out of the tab order and the
        // accessibility tree instead of merely translating it off screen.
        inert={!isDesktop && !open ? true : undefined}
        className={`fixed inset-y-0 left-0 z-40 flex w-[var(--portal-sidebar-width)] flex-col border-r border-[var(--border)] bg-[var(--surface-subtle)] transition-transform duration-200 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label={t('navigation.portal')}
      >
        <div className="flex h-16 shrink-0 items-center border-b border-[var(--border)] px-4">
          <Link href="/" className="flex min-w-0 items-center gap-2">
            <span
              className="grid h-8 w-8 shrink-0 place-items-center rounded-[var(--radius-sm)] bg-[var(--primary)] text-[var(--text-on-accent)]"
              aria-hidden="true"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                <path
                  d="M4 20V9.5L12 4l8 5.5V20M9 20v-6h6v6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-[var(--text)]">
                Nexus Estate
              </span>
              <span className="block truncate text-[11px] text-[var(--text-subtle)]">
                {t('navigation.portalLabel', { platform })}
              </span>
            </span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <nav
            className="space-y-0.5"
            aria-label={t('navigation.platformNavigation', { platform })}
          >
            {items.map((item, index) => {
              const active = activeHref === item.href;
              const showSection =
                item.section &&
                (index === 0 || items[index - 1]?.section !== item.section);

              return (
                <div key={item.href}>
                  {showSection && (
                    <div className="label-caps px-2 pb-1 pt-4 first:pt-0">
                      {item.section}
                    </div>
                  )}
                  <Link
                    onClick={onClose}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={`block rounded-[var(--radius-sm)] px-2.5 py-2 text-sm transition-colors ${
                      active
                        ? 'bg-[var(--surface-selected)] font-semibold text-[var(--primary)]'
                        : 'text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]'
                    }`}
                  >
                    {item.label}
                  </Link>
                </div>
              );
            })}
          </nav>
        </div>

        <div className="shrink-0 space-y-3 border-t border-[var(--border)] px-3 py-4">
          {identity}
          {footer}
          <LanguageSwitcher />
        </div>
      </aside>
    </>
  );
}
