'use client';
import { useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
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
  const commonT = useTranslations('common');
  const pathname = usePathname();
  const search = useSearchParams();
  const router = useRouter();
  useEffect(() => {
    if (session.status === 'anonymous' && pathname !== '/admin/login') {
      const query = search.toString();
      const current = query ? `${pathname}?${query}` : pathname;
      router.replace(`/admin/login?next=${encodeURIComponent(current)}`);
    }
  }, [pathname, router, search, session.status]);
  if (session.status === 'restoring')
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-[var(--text-muted)]">
        {commonT('status.loading')}
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
  const platform = search.get('platform') || 'MARKETPLACE';
  if (session.hasPermission('provider-account:approve'))
    items.push({
      label: t('nav.providerReview'),
      href: '/admin/provider-requests',
      section: t('nav.operations'),
    });
  if (session.hasPermission('authorization:role:read'))
    items.push(
      {
        label: t('nav.roles'),
        href: `/admin/authorization?platform=${platform}`,
        section: t('nav.accessControl'),
      },
      {
        label: t('nav.matrix'),
        href: `/admin/authorization/matrix?platform=${platform}`,
        section: t('nav.accessControl'),
      },
    );
  if (session.hasPermission('authorization:permission:read'))
    items.push({
      label: t('nav.permissions'),
      href: `/admin/authorization/permissions?platform=${platform}`,
      section: t('nav.accessControl'),
    });
  if (session.hasPermission('authorization:assignment:read'))
    items.push({
      label: t('nav.subjects'),
      href: `/admin/authorization/subjects?platform=${platform}`,
      section: t('nav.accessControl'),
    });
  if (session.hasPermission('authorization:audit:read'))
    items.push({
      label: t('nav.audit'),
      href: '/admin/authorization/audit',
      section: t('nav.accessControl'),
    });
  return (
    <PortalShell
      platform={t('overview.title')}
      items={items}
      identity={
        <div className="mt-4 text-xs text-[var(--text-muted)]">
          {session.authorization?.roles.map((role) => role.name).join(', ')}
        </div>
      }
      footer={
        <div className="mb-3 px-3 text-xs">
          <button
            className="text-red-700"
            onClick={() => void session.logout()}
          >
            {t('nav.signOut')}
          </button>
        </div>
      }
    >
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
