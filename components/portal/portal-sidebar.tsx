'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from './language-switcher';
import { NexusBrand } from './nexus-brand';
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
  appearance = 'default',
}: {
  platform: string;
  items: PortalNavItem[];
  open: boolean;
  onClose: () => void;
  identity?: React.ReactNode;
  footer?: React.ReactNode;
  appearance?: 'default' | 'administration';
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
        className={`fixed inset-y-0 left-0 z-40 w-[var(--portal-sidebar-width)] border-r shadow-[var(--shadow-xs)] transition-transform duration-200 lg:translate-x-0 ${appearance === 'administration' ? 'border-white/10 bg-[#102c2b] text-white' : 'border-[var(--border)] bg-[var(--surface)]'} ${open ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label={t('navigation.portal')}
      >
        <div className="flex h-full flex-col overflow-y-auto px-3 py-4">
          <div
            className={`border-b px-3 pb-5 ${appearance === 'administration' ? 'border-white/10' : 'border-[var(--border-muted)]'}`}
          >
            <NexusBrand dark={appearance === 'administration'} />
            <div
              className={`mt-3 text-[10px] font-semibold uppercase tracking-[0.16em] ${appearance === 'administration' ? 'text-[#d6c493]' : 'text-[var(--text-subtle)]'}`}
            >
              {t('navigation.portalLabel', { platform })}
            </div>
            {identity && <div className="mt-4">{identity}</div>}
          </div>

          <nav
            className="mt-4 space-y-1"
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
                    <div
                      className={`px-3 pb-1 pt-5 text-[10px] font-semibold uppercase tracking-[0.14em] ${appearance === 'administration' ? 'text-white/40' : 'text-[var(--text-subtle)]'}`}
                    >
                      {item.section}
                    </div>
                  )}
                  <Link
                    onClick={onClose}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={`relative flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm transition-colors ${appearance === 'administration' ? (active ? 'bg-white/10 font-semibold text-white' : 'text-white/65 hover:bg-white/[0.07] hover:text-white') : active ? 'bg-[var(--surface-selected)] font-semibold text-[var(--primary)]' : 'text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]'}`}
                  >
                    {appearance === 'administration' && (
                      <span
                        aria-hidden="true"
                        className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${active ? 'bg-[#d9bb78] text-[#163735]' : 'bg-white/[0.07] text-white/70'}`}
                      >
                        <span className="text-xs font-bold">
                          {item.label.slice(0, 1)}
                        </span>
                      </span>
                    )}
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

          <div
            className={`mt-auto border-t pt-4 ${appearance === 'administration' ? 'border-white/10' : 'border-[var(--border-muted)]'}`}
          >
            {footer}
            <div
              className={`px-3 text-xs ${appearance === 'administration' ? 'text-white/45' : 'text-[var(--text-muted)]'}`}
            >
              <span className="sr-only">{t('navigation.portal')}</span>
              {t('status.signedInWorkspace')}
            </div>
            <LanguageSwitcher dark={appearance === 'administration'} />
          </div>
        </div>
      </aside>
    </>
  );
}
