'use client';
import { useState, type ReactNode } from 'react';
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
}: {
  platform: string;
  items: PortalNavItem[];
  children: ReactNode;
  context?: ReactNode;
  identity?: ReactNode;
  footer?: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-clip bg-[var(--background)] text-[var(--text)]">
      <PortalSidebar
        platform={platform}
        items={items}
        open={open}
        onClose={() => setOpen(false)}
        identity={identity}
        footer={footer}
      />
      <div className="min-w-0 lg:pl-[var(--portal-sidebar-width)]">
        <PortalTopbar onMenu={() => setOpen(true)} context={context} />
        <main className="mx-auto w-full max-w-[var(--content-max)] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-9">
          {children}
        </main>
      </div>
    </div>
  );
}
