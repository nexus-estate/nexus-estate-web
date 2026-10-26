'use client';
import { useState, type ReactNode } from 'react';
import { PortalBreadcrumbs } from './portal-breadcrumbs';
import { PortalSidebar, type PortalNavItem } from './portal-sidebar';
import { PortalTopbar } from './portal-topbar';
export type { PortalNavItem } from './portal-sidebar';

export function PortalShell({
  platform,
  items,
  children,
  context,
  identity,
  footer,
  appearance = 'default',
}: {
  platform: string;
  items: PortalNavItem[];
  children: ReactNode;
  context?: ReactNode;
  identity?: ReactNode;
  footer?: ReactNode;
  appearance?: 'default' | 'administration';
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`min-h-screen overflow-x-clip bg-[var(--background)] text-[var(--text)] ${appearance === 'administration' ? 'admin-portal' : ''}`}
    >
      <PortalSidebar
        platform={platform}
        items={items}
        open={open}
        onClose={() => setOpen(false)}
        identity={identity}
        footer={footer}
        appearance={appearance}
      />
      <div className="min-w-0 lg:pl-[var(--portal-sidebar-width)]">
        <PortalTopbar
          onMenu={() => setOpen(true)}
          context={context}
          appearance={appearance}
        />
        <main className="mx-auto w-full max-w-[var(--content-max)] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-9">
          <PortalBreadcrumbs />
          {children}
        </main>
      </div>
    </div>
  );
}
