'use client';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  PortalShell,
  type PortalNavItem,
} from '@/components/portal/portal-shell';
import {
  AdministrationSessionProvider,
  useAdministrationSession,
} from '@/features/auth/administration/administration-session.provider';
function Guard({ children }: { children: React.ReactNode }) {
  const session = useAdministrationSession();
  const t = useTranslations('administration');
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => {
    if (session.status === 'anonymous' && pathname !== '/admin/login')
      router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
  }, [pathname, router, session.status]);
  if (session.status === 'restoring')
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-[var(--text-muted)]">
        Loading administration…
      </div>
    );
  if (!session.isAuthenticated && pathname !== '/admin/login') return null;
  if (pathname === '/admin/login') return <>{children}</>;
  const items: PortalNavItem[] = [
    {
      label: t('nav.overview'),
      href: '/admin',
      section: t('nav.dashboardSection'),
    },
  ];
  if (session.hasPermission('provider-account:approve'))
    items.push({
      label: t('nav.providerReview'),
      href: '/admin/provider-requests',
      section: t('nav.operations'),
    });
  if (session.hasPermission('authorization:role:read'))
    items.push({
      label: t('nav.authorization'),
      href: '/admin/authorization',
      section: t('nav.accessControl'),
    });
  if (session.hasPermission('authorization:assignment:read'))
    items.push({
      label: t('nav.subjects'),
      href: '/admin/authorization/subjects',
      section: t('nav.accessControl'),
    });
  if (session.hasPermission('authorization:audit:read'))
    items.push({
      label: t('nav.audit'),
      href: '/admin/authorization/audit',
      section: t('nav.accessControl'),
    });
  return (
    <PortalShell platform="Administration / ERP" items={items}>
      {children}
    </PortalShell>
  );
}
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdministrationSessionProvider>
      <Guard>{children}</Guard>
    </AdministrationSessionProvider>
  );
}
