'use client';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useProviderEntryState } from '@/features/provider/use-provider-entry-state';
export function ProviderEntryCard() {
  const t = useTranslations('customer.providerEntry');
  const { account, authorization, state, isLoading } = useProviderEntryState();
  if (isLoading || state === 'LOADING')
    return (
      <section className="border border-[var(--border)] bg-[var(--surface)] p-6">
        <p className="text-sm text-[var(--text-muted)]">{t('loading')}</p>
      </section>
    );
  if (state === 'ERROR')
    return (
      <section className="border border-[var(--border)] bg-[var(--surface)] p-6">
        <p className="text-sm text-[var(--text-muted)]">{t('error')}</p>
      </section>
    );
  const name = account.data?.displayName ?? t('defaultName');
  const statusKey = state.toLowerCase();
  return (
    <section className="border border-[var(--border)] bg-[var(--surface)] p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
        {t('title')}
      </p>
      <h2 className="mt-2 text-lg font-semibold">
        {state === 'NO_PROVIDER' ? t('noProvider.title') : name}
      </h2>
      <p className="mt-2 text-sm text-[var(--text-muted)]">
        {t(`${statusKey}.description`)}
      </p>
      {authorization.data?.providerDisplayName && (
        <p className="mt-2 text-sm font-medium">
          {authorization.data.providerDisplayName}
        </p>
      )}
      <Link
        href={state === 'NO_PROVIDER' ? '/provider/onboarding' : '/provider'}
        className="mt-5 inline-flex border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-[var(--surface-subtle)]"
      >
        {t(state === 'NO_PROVIDER' ? 'actions.become' : 'actions.open')}
      </Link>
    </section>
  );
}
