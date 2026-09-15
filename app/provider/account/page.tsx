'use client';
import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/portal/page-header';
import { useProviderEntryState } from '@/features/provider/use-provider-entry-state';
import { providerApi } from '@/lib/api/provider/provider.api';
export default function ProviderAccountPage() {
  const t = useTranslations('provider');
  const queryClient = useQueryClient();
  const workspace = useProviderEntryState();
  const account = workspace.account;
  const [displayName, setDisplayName] = useState('');
  const currentName = account.data?.displayName ?? '';
  useEffect(() => {
    // Initialize the editable draft when the canonical account arrives.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (account.data) setDisplayName(account.data.displayName);
  }, [account.data]);
  const update = useMutation({
    mutationFn: () =>
      providerApi.updateAccount({
        displayName: displayName.trim(),
      }),
    onSuccess: () =>
      void queryClient.invalidateQueries({
        queryKey: ['provider-workspace'],
      }),
  });
  return (
    <>
      <PageHeader
        title={t('nav.account')}
        description={t('overview.description')}
      />
      <form
        className="max-w-xl border border-[var(--border)] bg-[var(--surface)] p-6"
        onSubmit={(event) => {
          event.preventDefault();
          update.mutate();
        }}
      >
        <label className="block text-sm">
          <span className="mb-1 block font-medium">
            {t('onboarding.displayName')}
          </span>
          <input
            className="w-full rounded-md border border-[var(--border)] px-3 py-2"
            required
            maxLength={255}
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
          />
        </label>
        {account.data && (
          <dl className="mt-6 grid gap-3 border-t border-[var(--border)] pt-5 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-[var(--text-muted)]">
                {t('account.providerId')}
              </dt>
              <dd className="break-all font-mono text-xs">{account.data.id}</dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">
                {t('labels.providerStatus')}
              </dt>
              <dd>{t(`status.${account.data.status.toLowerCase()}`)}</dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">
                {t('labels.verification')}
              </dt>
              <dd>
                {t(`status.${account.data.verificationStatus.toLowerCase()}`)}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">
                {t('account.created')}
              </dt>
              <dd>
                {new Intl.DateTimeFormat(undefined, {
                  dateStyle: 'medium',
                }).format(new Date(account.data.createdAt))}
              </dd>
            </div>
          </dl>
        )}
        {account.error && (
          <p className="mt-3 text-sm text-red-700">{account.error.message}</p>
        )}
        {update.isError && (
          <p className="mt-3 text-sm text-red-700">{update.error.message}</p>
        )}
        <button
          className="mt-5 rounded-md bg-[var(--primary)] px-4 py-2 text-sm text-white disabled:opacity-50"
          disabled={
            update.isPending ||
            account.isLoading ||
            !displayName.trim() ||
            displayName.trim() === currentName
          }
        >
          {update.isPending
            ? t('onboarding.submitting')
            : t('onboarding.submit')}
        </button>
      </form>
    </>
  );
}
