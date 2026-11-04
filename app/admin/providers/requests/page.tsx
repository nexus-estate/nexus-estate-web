'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useFormatter, useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { ProviderApprovalDialog } from '@/components/administration/provider-approval-dialog';
import { PageHeader } from '@/components/portal/page-header';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAdministrationSession } from '@/features/auth/administration/administration-session.provider';
import { providerReviewApi } from '@/lib/api/administration/provider-review.api';
import type { ProviderRegistrationReview } from '@/lib/api/administration/provider-review.types';
import { getApiErrorMessage } from '@/lib/api/error-message';

export default function ProviderRequestsPage() {
  const t = useTranslations('administration.providerReview');
  const providerT = useTranslations('provider');
  const commonT = useTranslations('common');
  const format = useFormatter();
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [verification, setVerification] = useState('');
  const [account, setAccount] = useState('');
  const [selected, setSelected] = useState<ProviderRegistrationReview | null>(
    null,
  );
  const queryClient = useQueryClient();
  const { authorizationReady, hasPermission } = useAdministrationSession();
  const canReview =
    authorizationReady && hasPermission('provider-account:approve');
  const requests = useQuery({
    queryKey: ['administration', 'provider-requests'],
    queryFn: providerReviewApi.pending,
    enabled: canReview,
  });
  const approve = useMutation({
    mutationFn: providerReviewApi.approve,
    onSuccess: async () => {
      setSelected(null);
      toast.success(t('approvedToast'));
      await queryClient.invalidateQueries({
        queryKey: ['administration', 'provider-requests'],
      });
      await queryClient.invalidateQueries({
        queryKey: ['administration', 'dashboard'],
      });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, commonT)),
  });
  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    return (requests.data ?? []).filter(
      ({ providerAccount, owner }) =>
        (!term ||
          `${providerAccount.displayName} ${owner.email}`
            .toLocaleLowerCase()
            .includes(term)) &&
        (!type || providerAccount.type === type) &&
        (!verification ||
          providerAccount.verificationStatus === verification) &&
        (!account || providerAccount.status === account),
    );
  }, [requests.data, search, type, verification, account]);
  const hasFilters = Boolean(search || type || verification || account);
  if (!authorizationReady)
    return (
      <p className="text-sm text-[var(--text-muted)]">
        {t('accessUnavailable')}
      </p>
    );
  if (!canReview)
    return (
      <p className="text-sm text-[var(--text-muted)]">{t('accessDenied')}</p>
    );
  return (
    <>
      <PageHeader
        title={t('title')}
        description={t('description')}
        actions={
          <button
            type="button"
            className="admin-button-secondary"
            disabled={requests.isFetching}
            onClick={() => void requests.refetch()}
          >
            {t('refresh')}
          </button>
        }
      />
      <section className="admin-data-panel">
        <div className="border-b border-[var(--border)] px-5 py-4 sm:px-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold">{t('queue')}</h2>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                {requests.isLoading
                  ? t('loading')
                  : t('queueCount', { count: requests.data?.length ?? 0 })}
              </p>
            </div>
            {hasFilters && (
              <button
                type="button"
                className="text-xs font-semibold text-[var(--primary)] hover:underline"
                onClick={() => {
                  setSearch('');
                  setType('');
                  setVerification('');
                  setAccount('');
                }}
              >
                {t('clearFilters')}
              </button>
            )}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(240px,2fr)_repeat(3,minmax(150px,1fr))]">
            <label className="block">
              <span className="admin-field-label">{t('search')}</span>
              <input
                className="app-control px-3 text-sm"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t('search')}
              />
            </label>
            <label className="block">
              <span className="admin-field-label">{t('type')}</span>
              <select
                className="app-control px-3 text-sm"
                value={type}
                onChange={(event) => setType(event.target.value)}
              >
                <option value="">{t('allTypes')}</option>
                {(['INDIVIDUAL', 'BROKER', 'AGENCY'] as const).map((value) => (
                  <option key={value} value={value}>
                    {providerT(`types.${value}`)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="admin-field-label">
                {t('verificationStatus')}
              </span>
              <select
                className="app-control px-3 text-sm"
                value={verification}
                onChange={(event) => setVerification(event.target.value)}
              >
                <option value="">{t('allStatuses')}</option>
                {(
                  ['UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED'] as const
                ).map((value) => (
                  <option key={value} value={value}>
                    {providerT(`status.${value.toLowerCase()}`)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="admin-field-label">{t('accountStatus')}</span>
              <select
                className="app-control px-3 text-sm"
                value={account}
                onChange={(event) => setAccount(event.target.value)}
              >
                <option value="">{t('allStatuses')}</option>
                {(['ACTIVE', 'SUSPENDED'] as const).map((value) => (
                  <option key={value} value={value}>
                    {providerT(`status.${value.toLowerCase()}`)}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        {requests.isError ? (
          <div className="p-6 text-sm">
            <p className="font-semibold text-[var(--danger)]">{t('error')}</p>
            <p className="mt-1 text-[var(--text-muted)]">
              {getApiErrorMessage(requests.error, commonT)}
            </p>
            <button
              className="admin-button-secondary mt-4"
              onClick={() => void requests.refetch()}
            >
              {t('retry')}
            </button>
          </div>
        ) : requests.isLoading ? (
          <div className="space-y-2 p-5" aria-label={t('loading')}>
            {[0, 1, 2].map((item) => (
              <div className="skeleton h-14" key={item} />
            ))}
          </div>
        ) : !filtered.length ? (
          <div className="px-6 py-14 text-center">
            <p className="font-semibold">
              {hasFilters ? t('noSearchResults') : t('empty')}
            </p>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              {hasFilters ? t('adjustSearch') : t('emptyDescription')}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead>
                <tr>
                  <th className="px-5 sm:px-6">{t('provider')}</th>
                  <th className="px-5">{t('ownerEmail')}</th>
                  <th className="px-5">{t('type')}</th>
                  <th className="px-5">{t('verificationStatus')}</th>
                  <th className="px-5">{t('accountStatus')}</th>
                  <th className="px-5">{t('created')}</th>
                  <th className="px-5 text-right sm:px-6">{t('review')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((request) => (
                  <tr
                    key={request.id}
                    className="border-t border-[var(--border-muted)]"
                  >
                    <td className="px-5 py-3 sm:px-6">
                      <Link
                        href={`/admin/provider-requests/${request.id}`}
                        className="font-semibold text-[var(--text)] hover:text-[var(--primary)] hover:underline"
                      >
                        {request.providerAccount.displayName}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-[var(--text-muted)]">
                      {request.owner.email}
                    </td>
                    <td className="px-5 py-3">
                      {providerT(`types.${request.providerAccount.type}`)}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge
                        status={request.providerAccount.verificationStatus}
                        label={providerT(
                          `status.${request.providerAccount.verificationStatus.toLowerCase()}`,
                        )}
                        size="sm"
                      />
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge
                        status={request.providerAccount.status}
                        label={providerT(
                          `status.${request.providerAccount.status.toLowerCase()}`,
                        )}
                        size="sm"
                      />
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 tabular-nums text-[var(--text-muted)]">
                      {format.dateTime(
                        new Date(request.providerAccount.createdAt),
                        { dateStyle: 'medium' },
                      )}
                    </td>
                    <td className="px-5 py-3 text-right sm:px-6">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          className="admin-button-primary"
                          href={`/admin/provider-requests/${request.id}`}
                        >
                          {t('viewDetails')}
                        </Link>
                        <button
                          type="button"
                          className="admin-button-secondary"
                          disabled={approve.isPending}
                          onClick={() => setSelected(request)}
                        >
                          {approve.isPending && approve.variables === request.id
                            ? t('approving')
                            : t('approve')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!requests.isLoading && !requests.isError && (
          <div className="border-t border-[var(--border)] px-5 py-3 text-xs text-[var(--text-muted)] sm:px-6">
            {t('showingCount', {
              shown: filtered.length,
              total: requests.data?.length ?? 0,
            })}
          </div>
        )}
      </section>
      <ProviderApprovalDialog
        open={selected !== null}
        providerName={selected?.providerAccount.displayName ?? ''}
        busy={approve.isPending}
        onClose={() => setSelected(null)}
        onConfirm={() => {
          if (selected) approve.mutate(selected.id);
        }}
      />
    </>
  );
}
