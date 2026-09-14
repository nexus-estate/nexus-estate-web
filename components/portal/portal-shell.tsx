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
    <div className="min-h-screen bg-[var(--background)]">
      <PortalSidebar
        platform={platform}
        items={items}
        open={open}
        onClose={() => setOpen(false)}
        identity={identity}
        footer={footer}
      />
      <div className="lg:pl-64">
        <PortalTopbar onMenu={() => setOpen(true)} context={context} />
        <main className="mx-auto max-w-[1440px] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
