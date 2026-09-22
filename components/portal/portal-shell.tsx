'use client';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useTranslations } from 'next-intl';
import { PortalBreadcrumbs } from './portal-breadcrumbs';
import { PortalSidebar, type PortalNavItem } from './portal-sidebar';
import { PortalTopbar } from './portal-topbar';
import { useMediaQuery } from './use-media-query';
export type { PortalNavItem } from './portal-sidebar';

export function PortalShell({
  platform,
  items,
  children,
  context,
  identity,
  footer,
}: {
  platform: string;
  items: PortalNavItem[];
  children: ReactNode;
  context?: ReactNode;
  identity?: ReactNode;
  footer?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const t = useTranslations('common');
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const asideRef = useRef<HTMLElement>(null);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open || isDesktop) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    // Lock the page behind the drawer, then land focus inside it so keyboard
    // users do not have to tab through the content underneath.
    const previousOverflow = document.body.style.overflow;
    // Captured now: the ref may point elsewhere by the time cleanup runs.
    const trigger = triggerRef.current;
    document.body.style.overflow = 'hidden';
    asideRef.current
      ?.querySelector<HTMLElement>('a[href], button:not([disabled])')
      ?.focus();

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [open, isDesktop]);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)]">
      <a href="#main-content" className="skip-link">
        {t('a11y.skipToContent')}
      </a>
      <PortalSidebar
        platform={platform}
        items={items}
        open={open}
        onClose={close}
        identity={identity}
        footer={footer}
        isDesktop={isDesktop}
        asideRef={asideRef}
      />
      <div className="min-w-0 lg:pl-[var(--portal-sidebar-width)]">
        <PortalTopbar
          onMenu={() => setOpen(true)}
          context={context}
          open={open}
          menuButtonRef={triggerRef}
        />
        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto w-full max-w-[var(--content-max)] px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
        >
          <PortalBreadcrumbs />
          {children}
        </main>
      </div>
    </div>
  );
}
