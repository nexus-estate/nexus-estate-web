'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { PortalShell } from '@/components/portal/portal-shell';
import { ProviderContextProvider } from '@/features/provider/context/provider-context.provider';
import { useProviderEntryState } from '@/features/provider/use-provider-entry-state';
import { useAuth } from '@/hooks/use-auth';
export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations('provider');
  const router = useRouter();
  const { status } = useAuth();
  const workspace = useProviderEntryState(status === 'authenticated');
  useEffect(() => {
    if (status === 'anonymous') router.replace('/signin?next=/provider');
  }, [router, status]);
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
    <ProviderContextProvider>
      <PortalShell
        platform={t('title')}
        items={[
          { label: t('nav.overview'), href: '/provider' },
          { label: t('nav.account'), href: '/provider/account' },
          { label: t('nav.authorization'), href: '/provider/authorization' },
        ]}
        identity={identity}
      >
        {children}
      </PortalShell>
    </ProviderContextProvider>
  );
}
