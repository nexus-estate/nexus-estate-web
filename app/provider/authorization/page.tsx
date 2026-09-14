'use client';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/portal/page-header';
import { useProviderAuthorization } from '@/features/provider/context/provider-context.hooks';
export default function ProviderAuthorizationPage() {
  const t = useTranslations('provider');
  const auth = useProviderAuthorization();
  return (
    <>
      <PageHeader
        title={t('authorization.title')}
        description={t('authorization.description')}
      />
      <div className="border border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <span className="text-xs text-[var(--text-muted)]">Membership</span>
            <p className="mt-1 font-medium">
              {auth.data?.membershipStatus ?? '—'}
            </p>
          </div>
          <div>
            <span className="text-xs text-[var(--text-muted)]">Provider</span>
            <p className="mt-1 font-medium">
              {auth.data?.providerStatus ?? '—'}
            </p>
          </div>
          <div>
            <span className="text-xs text-[var(--text-muted)]">State</span>
            <p className="mt-1 font-medium">{auth.state}</p>
          </div>
        </div>
        <h2 className="mt-8 text-sm font-medium">
          {t('authorization.permissions')}
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {(auth.data?.permissions ?? []).map((p) => (
            <span
              className="rounded border border-[var(--border)] px-2 py-1 text-xs"
              key={p.code}
            >
              {p.code}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
