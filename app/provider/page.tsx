'use client';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/portal/page-header';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/LoadingState';
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
        <div className="panel p-5">
          <p className="text-sm text-[var(--text-muted)]">
            {t('overview.noProviderBody')}
          </p>
          <a className="btn btn-primary mt-4" href="/provider/onboarding">
            {t('onboarding.start')}
          </a>
        </div>
      </>
    );
  if (workspace.state === 'LOADING')
    return <LoadingState label={t('loading')} />;
  const lifecycleKey =
    workspace.state === 'PENDING'
      ? 'pending_verification'
      : workspace.state === 'ACTIVE'
        ? 'active_verified'
        : workspace.state.toLowerCase();
  const stateText = t(`lifecycle.${lifecycleKey}`);
  return (
    <>
      <PageHeader
        title={account?.displayName ?? t('title')}
        description={t('overview.description')}
      />
      <div className="mb-5 flex flex-wrap gap-2">
        <Badge>{account?.type ? t(`types.${account.type}`) : '—'}</Badge>
        <Badge>
          {account?.status ? t(`status.${account.status.toLowerCase()}`) : '—'}
        </Badge>
        <Badge>
          {account?.verificationStatus
            ? t(`status.${account.verificationStatus.toLowerCase()}`)
            : '—'}
        </Badge>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <section className="panel p-5">
          <h2 className="text-sm font-semibold text-[var(--text)]">
            {t('overview.business')}
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-[var(--text-muted)]">
                {t('labels.provider')}
              </dt>
              <dd className="mt-0.5 text-[var(--text)]">
                {account?.displayName}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">
                {t('labels.providerStatus')}
              </dt>
              <dd className="mt-0.5 text-[var(--text)]">
                {account?.status
                  ? t(`status.${account.status.toLowerCase()}`)
                  : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">
                {t('labels.verification')}
              </dt>
              <dd className="mt-0.5 text-[var(--text)]">
                {account?.verificationStatus
                  ? t(`status.${account.verificationStatus.toLowerCase()}`)
                  : '—'}
              </dd>
            </div>
          </dl>
        </section>
        <section className="panel p-5">
          <h2 className="text-sm font-semibold text-[var(--text)]">
            {t('overview.membershipAccess')}
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-[var(--text-muted)]">
                {t('labels.membership')}
              </dt>
              <dd className="mt-0.5 text-[var(--text)]">
                {auth?.membershipStatus
                  ? t(`status.${auth.membershipStatus.toLowerCase()}`)
                  : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">{t('labels.roles')}</dt>
              <dd className="mt-0.5 text-[var(--text)]">
                {auth?.roles.map((role) => role.name).join(', ') || '—'}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">
                {t('labels.permissions')}
              </dt>
              <dd className="mt-0.5 text-[var(--text)]">
                {auth?.permissions.length ?? 0}
              </dd>
            </div>
          </dl>
        </section>
      </div>
      <div className="panel mt-5 p-5">
        <h2 className="text-sm font-semibold text-[var(--text)]">
          {t('overview.platformState')}
        </h2>
        <p className="mt-1.5 text-sm text-[var(--text-muted)]">{stateText}</p>
      </div>
    </>
  );
}
