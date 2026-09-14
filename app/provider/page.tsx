'use client';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/portal/page-header';
import { useProviderAuthorization } from '@/features/provider/context/provider-context.hooks';
import { useProviderContext } from '@/features/provider/context/provider-context.provider';
import { providerApi } from '@/lib/api/provider/provider.api';
export default function ProviderPage() {
  const t = useTranslations('provider');
  const { providerId } = useProviderContext();
  const account = useQuery({
    queryKey: ['provider', providerId, 'account'],
    queryFn: providerApi.profile,
  });
  const auth = useProviderAuthorization();
  if (account.error && !auth.isLoading)
    return (
      <>
        <PageHeader
          title={t('onboarding.title')}
          description={t('onboarding.description')}
        />
        <div className="rounded-md border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-sm text-[var(--text-muted)]">
          {t('labels.noAccount')}
        </div>
      </>
    );
  return (
    <>
      <PageHeader
        title={t('overview.title')}
        description={t('overview.description')}
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          [t('labels.provider'), String(account.data?.displayName ?? '—')],
          [
            t('labels.providerStatus'),
            String(auth.data?.providerStatus ?? account.data?.status ?? '—'),
          ],
          [
            t('labels.verification'),
            String(
              auth.data?.verificationStatus ??
                account.data?.verificationStatus ??
                '—',
            ),
          ],
          [
            t('labels.permissions'),
            String(auth.data?.permissions?.length ?? 0),
          ],
        ].map(([label, value]) => (
          <div
            className="border border-[var(--border)] bg-[var(--surface)] p-5"
            key={label}
          >
            <div className="text-xs text-[var(--text-muted)]">{label}</div>
            <div className="mt-2 text-lg font-semibold text-[var(--text)]">
              {value}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="text-sm font-medium">{t('labels.supplyAccess')}</div>
        <div className="mt-2 text-sm text-[var(--text-muted)]">
          {auth.state === 'ACTIVE_VERIFIED'
            ? t('labels.activeVerified')
            : t('labels.currentState', { state: auth.state })}
        </div>
      </div>
    </>
  );
}
