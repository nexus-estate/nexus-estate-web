'use client';
import { useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { PortalShell } from '@/components/portal/portal-shell';
import { useProviderEntryState } from '@/features/provider/use-provider-entry-state';
import { useAuth } from '@/hooks/use-auth';
import { getMarketplaceUrl } from '@/lib/platform/urls';
export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations('provider');
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const { status, logout } = useAuth();
  const workspace = useProviderEntryState(status === 'authenticated');
  useEffect(() => {
    if (status !== 'anonymous') return;
    const query = search.toString();
    const current = query ? `${pathname}?${query}` : pathname;
    router.replace(`/signin?next=${encodeURIComponent(current)}`);
  }, [pathname, router, search, status]);
  if (status === 'restoring')
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-[var(--text-muted)]">
        {t('loading')}
      </div>
    );
  if (status === 'anonymous') return null;
  const identity = (
    <div className="mt-4 text-xs text-[var(--text-muted)]">
      <div className="font-medium text-[var(--text)]">
        {workspace.account.data?.displayName ?? t('identity.notEnrolled')}
      </div>
      <div>
        {workspace.account.data?.type
          ? t(`types.${workspace.account.data.type}`)
          : t('identity.providerPlatform')}
      </div>
      <div className="mt-1">
        {workspace.authorization.data?.verificationStatus
          ? t(
              `status.${workspace.authorization.data.verificationStatus.toLowerCase()}`,
            )
          : t('identity.notEnrolled')}
      </div>
    </div>
  );
  return (
    <PortalShell
      platform={t('title')}
      items={[
        { label: t('nav.overview'), href: '/provider', match: 'exact' },
        {
          label: t('nav.properties'),
          href: '/provider/properties',
          match: 'prefix',
        },
        {
          label: t('nav.listings'),
          href: '/provider/listings',
          match: 'prefix',
        },
        {
          label: t('nav.account'),
          href: '/provider/account',
          match: 'prefix',
        },
        {
          label: t('nav.authorization'),
          href: '/provider/authorization',
          match: 'exact',
        },
      ]}
      identity={identity}
      footer={
        <div className="mb-3 space-y-2 px-3 text-xs">
          <a
            className="block text-[var(--text-muted)]"
            href={getMarketplaceUrl('/')}
          >
            {t('footer.back')}
          </a>
          <button className="text-red-700" onClick={() => void logout()}>
            {t('footer.signOut')}
          </button>
        </div>
      }
    >
      {children}
    </PortalShell>
  );
}
