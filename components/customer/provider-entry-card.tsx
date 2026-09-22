'use client';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/Badge';
import { ErrorAlert } from '@/components/ui/ErrorState';
import { useProviderEntryState } from '@/features/provider/use-provider-entry-state';
import { getProviderHref } from '@/lib/platform/urls';

const STATE_BADGES: Record<
  string,
  { variant: 'success' | 'warning' | 'error' | 'info' | 'default' }
> = {
  ACTIVE: { variant: 'success' },
  PENDING: { variant: 'warning' },
  REJECTED: { variant: 'error' },
  SUSPENDED: { variant: 'error' },
  CONTEXT_REQUIRED: { variant: 'info' },
  NO_PROVIDER: { variant: 'default' },
};

export function ProviderEntryCard() {
  const t = useTranslations('customer.providerEntry');
  const { account, authorization, state, isLoading } = useProviderEntryState();
  if (isLoading || state === 'LOADING')
    return (
      <section className="panel p-5">
        <p className="label-caps">{t('title')}</p>
        <p className="mt-2 text-sm text-[var(--text-muted)]">{t('loading')}</p>
      </section>
    );
  if (state === 'ERROR')
    return (
      <section className="panel p-5">
        <p className="label-caps">{t('title')}</p>
        <ErrorAlert message={t('error')} className="mt-3" />
      </section>
    );
  const name = account.data?.displayName ?? t('defaultName');
  const statusKey = state.toLowerCase();
  const descriptionKey =
    state === 'NO_PROVIDER'
      ? 'noProvider.description'
      : `${statusKey}.description`;
  return (
    <section className="panel p-5">
      <p className="label-caps">{t('title')}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <h2 className="text-base font-semibold text-[var(--text)]">
          {state === 'NO_PROVIDER' ? t('noProvider.title') : name}
        </h2>
        <Badge variant={STATE_BADGES[state]?.variant ?? 'default'}>
          {state.replace(/_/g, ' ')}
        </Badge>
      </div>
      <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
        {t(descriptionKey)}
      </p>
      {authorization.data?.providerDisplayName && (
        <p className="mt-2 text-sm font-medium text-[var(--text)]">
          {authorization.data.providerDisplayName}
        </p>
      )}
      <a
        href={getProviderHref(
          state === 'NO_PROVIDER' ? '/provider/onboarding' : '/provider',
        )}
        className="btn btn-secondary mt-4"
      >
        {t(state === 'NO_PROVIDER' ? 'actions.become' : 'actions.open')}
      </a>
    </section>
  );
}
