'use client';
import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/portal/page-header';
import { useProviderEntryState } from '@/features/provider/use-provider-entry-state';
import { providerApi } from '@/lib/api/provider/provider.api';
import { FEEDBACK, notify } from '@/lib/notify';
export default function ProviderAccountPage() {
  const t = useTranslations('provider');
  const commonT = useTranslations('common');
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
    onSuccess: () => {
      notify.success(commonT(FEEDBACK.updated));
      void queryClient.invalidateQueries({
        queryKey: ['provider-workspace'],
      });
    },
    onError: (error) => notify.apiError(error, commonT),
  });
  return (
    <>
      <PageHeader
        title={t('nav.account')}
        description={t('overview.description')}
      />
      <form
        className="panel max-w-xl p-5 sm:p-6"
        onSubmit={(event) => {
          event.preventDefault();
          update.mutate();
        }}
      >
        <div>
          <label className="field-label" htmlFor="provider-display-name">
            {t('onboarding.displayName')}
          </label>
          <input
            id="provider-display-name"
            className="field"
            required
            maxLength={255}
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
          />
        </div>
        {account.data && (
          <dl className="mt-5 grid gap-4 border-t border-[var(--border-muted)] pt-5 text-sm sm:grid-cols-2">
            <div>
              <dt className="label-caps">{t('account.providerId')}</dt>
              <dd className="mt-1 break-all font-mono text-xs text-[var(--text-muted)]">
                {account.data.id}
              </dd>
            </div>
            <div>
              <dt className="label-caps">{t('labels.providerStatus')}</dt>
              <dd className="mt-1 text-[var(--text)]">
                {t(`status.${account.data.status.toLowerCase()}`)}
              </dd>
            </div>
            <div>
              <dt className="label-caps">{t('labels.verification')}</dt>
              <dd className="mt-1 text-[var(--text)]">
                {t(`status.${account.data.verificationStatus.toLowerCase()}`)}
              </dd>
            </div>
            <div>
              <dt className="label-caps">{t('account.created')}</dt>
              <dd className="mt-1 text-[var(--text)]">
                {new Intl.DateTimeFormat(undefined, {
                  dateStyle: 'medium',
                }).format(new Date(account.data.createdAt))}
              </dd>
            </div>
          </dl>
        )}
        {account.error && (
          <p role="alert" className="field-error">
            {account.error.message}
          </p>
        )}
        {update.isError && (
          <p role="alert" className="field-error">
            {update.error.message}
          </p>
        )}
        <button
          className="btn btn-primary mt-5"
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
