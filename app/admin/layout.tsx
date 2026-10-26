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
      match: 'prefix',
      section: t('nav.operations'),
    });
  if (session.hasPermission('authorization:role:read'))
    items.push(
      {
        label: t('nav.roles'),
        href: `/admin/authorization?platform=${platform}`,
        match: 'prefix',
        section: t('nav.accessControl'),
      },
      {
        label: t('nav.matrix'),
        href: `/admin/authorization/matrix?platform=${platform}`,
        match: 'exact',
        section: t('nav.accessControl'),
      },
    );
  if (session.hasPermission('authorization:permission:read'))
    items.push({
      label: t('nav.permissions'),
      href: `/admin/authorization/permissions?platform=${platform}`,
      match: 'prefix',
      section: t('nav.accessControl'),
    });
  if (session.hasPermission('authorization:assignment:read'))
    items.push({
      label: t('nav.subjects'),
      href: `/admin/authorization/subjects?platform=${platform}`,
      match: 'prefix',
      section: t('nav.accessControl'),
    });
  if (session.hasPermission('authorization:audit:read'))
    items.push({
      label: t('nav.audit'),
      href: '/admin/authorization/audit',
      match: 'exact',
      section: t('nav.accessControl'),
    });
  return (
    <PortalShell
      platform={t('overview.title')}
      appearance="administration"
      items={items}
      identity={
        <div className="mt-4 flex items-center gap-3">
          <span
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.08] text-xs font-semibold text-[#e8d39d]"
            aria-hidden="true"
          >
            A
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white">
              {t('nav.signedInAs')}
            </p>
            <p className="mt-0.5 truncate text-[11px] text-white/55">
              {session.authorization?.roles
                .map((role) => role.name)
                .join(' · ') || t('nav.noAssignedRole')}
            </p>
          </div>
        </div>
      }
      footer={
        <div className="mb-3 px-1">
          <button
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-semibold text-white/65 transition-colors hover:bg-red-400/10 hover:text-red-200"
            onClick={() => void session.logout()}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
              <path
                d="M10 17l5-5-5-5M15 12H3m9-8h6a2 2 0 012 2v12a2 2 0 01-2 2h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {t('nav.signOut')}
          </button>
        </div>
      }
      context={
        <span className="inline-flex items-center gap-2 rounded-full border border-[#d9e9e3] bg-[#f0f7f3] px-3 py-1.5 text-xs font-medium text-[#24584c]">
          <span
            className="h-1.5 w-1.5 rounded-full bg-[#37966e]"
            aria-hidden="true"
          />
          {t('nav.secureWorkspace')}
        </span>
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
