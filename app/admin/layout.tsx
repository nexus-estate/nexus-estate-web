'use client';
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
  if (!session.isAuthenticated && pathname !== '/admin/login') {
    router.replace('/admin/login');
    return null;
  }
  if (pathname === '/admin/login') return <>{children}</>;
  const items: PortalNavItem[] = [{ label: t('nav.overview'), href: '/admin' }];
  if (session.hasPermission('authorization:role:read'))
    items.push({ label: t('nav.authorization'), href: '/admin/authorization' });
  if (session.hasPermission('authorization:assignment:read'))
    items.push({
      label: t('nav.subjects'),
      href: '/admin/authorization/subjects',
    });
  if (session.hasPermission('authorization:audit:read'))
    items.push({ label: t('nav.audit'), href: '/admin/authorization/audit' });
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
