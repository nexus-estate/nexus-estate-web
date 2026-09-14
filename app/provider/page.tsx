'use client';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/portal/page-header';
import { useProviderEntryState } from '@/features/provider/use-provider-entry-state';
export default function ProviderPage() {
  const t = useTranslations('provider');
  const workspace = useProviderEntryState();
  const account = workspace.account.data;
  const auth = workspace.authorization.data;
  if (workspace.state === 'NO_PROVIDER')
    return (
      <>
        <PageHeader
          title={t('overview.noProviderTitle')}
          description={t('overview.noProviderDescription')}
        />
        <div className="border border-[var(--border)] bg-[var(--surface)] p-6">
          <p className="text-sm text-[var(--text-muted)]">
            {t('overview.noProviderBody')}
          </p>
          <a
            className="mt-5 inline-flex bg-[var(--primary)] px-4 py-2 text-sm text-white"
            href="/provider/onboarding"
          >
            {t('onboarding.start')}
          </a>
        </div>
      </>
    );
  if (workspace.state === 'LOADING') return <p>{t('loading')}</p>;
  const stateText = t(`lifecycle.${workspace.state.toLowerCase()}`);
  return (
    <>
      <PageHeader
        title={account?.displayName ?? t('title')}
        description={t('overview.description')}
      />
      <div className="mb-6 flex flex-wrap gap-2 text-xs">
        <span className="border px-2 py-1">
          {account?.type ? t(`types.${account.type}`) : '—'}
        </span>
        <span className="border px-2 py-1">
          {account?.status ? t(`status.${account.status.toLowerCase()}`) : '—'}
        </span>
        <span className="border px-2 py-1">
          {account?.verificationStatus
            ? t(`status.${account.verificationStatus.toLowerCase()}`)
            : '—'}
        </span>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <section className="border border-[var(--border)] bg-[var(--surface)] p-6">
          <h2 className="font-semibold">{t('overview.business')}</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-[var(--text-muted)]">
                {t('labels.provider')}
              </dt>
              <dd>{account?.displayName}</dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">
                {t('labels.providerStatus')}
              </dt>
              <dd>
                {account?.status
                  ? t(`status.${account.status.toLowerCase()}`)
                  : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">
                {t('labels.verification')}
              </dt>
              <dd>
                {account?.verificationStatus
                  ? t(`status.${account.verificationStatus.toLowerCase()}`)
                  : '—'}
              </dd>
            </div>
          </dl>
        </section>
        <section className="border border-[var(--border)] bg-[var(--surface)] p-6">
          <h2 className="font-semibold">{t('overview.membershipAccess')}</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-[var(--text-muted)]">
                {t('labels.membership')}
              </dt>
              <dd>
                {auth?.membershipStatus
                  ? t(`status.${auth.membershipStatus.toLowerCase()}`)
                  : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">{t('labels.roles')}</dt>
              <dd>{auth?.roles.map((role) => role.name).join(', ') || '—'}</dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">
                {t('labels.permissions')}
              </dt>
              <dd>{auth?.permissions.length ?? 0}</dd>
            </div>
          </dl>
        </section>
      </div>
      <div className="mt-6 border border-[var(--border)] bg-[var(--surface)] p-6">
        <h2 className="font-semibold">{t('overview.platformState')}</h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">{stateText}</p>
      </div>
    </>
  );
}
