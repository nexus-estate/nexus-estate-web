'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useFormatter, useTranslations } from 'next-intl';
import toast from 'react-hot-toast';

import { MarketplaceIcon } from '@/components/customer/marketplace-icon';
import { useAdministrationSession } from '@/features/auth/administration/administration-session.provider';
import { providerReviewApi } from '@/lib/api/administration/provider-review.api';
import type { ProviderRegistrationReview } from '@/lib/api/administration/provider-review.types';
import { ApiError } from '@/lib/api/core/error';
import { getApiErrorMessage } from '@/lib/api/error-message';

import './provider-review-workspace.css';

const reviewKey = ['administration', 'provider-requests'] as const;

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function ProviderReviewWorkspace({
  initialAccountId,
}: {
  initialAccountId?: string;
}) {
  const t = useTranslations('administration.providerReview');
  const providerT = useTranslations('provider');
  const commonT = useTranslations('common');
  const format = useFormatter();
  const queryClient = useQueryClient();
  const { authorizationReady, hasPermission } = useAdministrationSession();
  const canReview =
    authorizationReady && hasPermission('provider-account:approve');
  const [selectedId, setSelectedId] = useState<string | null>(
    initialAccountId ?? null,
  );
  const [search, setSearch] = useState('');
  const [mobileOpen, setMobileOpen] = useState(Boolean(initialAccountId));
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const lock = useRef(false);
  const [processing, setProcessing] = useState(false);
  const approve = useMutation({ mutationFn: providerReviewApi.approve });
  const busy = processing || approve.isPending;

  const requests = useQuery({
    queryKey: reviewKey,
    queryFn: providerReviewApi.pending,
    enabled: canReview,
    staleTime: 0,
    refetchInterval: busy ? false : 10_000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: 'always',
  });

  const selected =
    requests.data?.find((item) => item.id === selectedId) ?? null;
  const visible = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    return (requests.data ?? []).filter(
      (item) =>
        !term ||
        `${item.providerAccount.displayName} ${item.id} ${item.owner.email}`
          .toLocaleLowerCase()
          .includes(term),
    );
  }, [requests.data, search]);

  useEffect(() => {
    if (!requests.isSuccess || busy || selectedId !== null) return;
    const first = requests.data[0]?.id;
    // Pin the first server result once; subsequent polling must not change it.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (first) setSelectedId(first);
  }, [requests.isSuccess, requests.data, selectedId, busy]);

  const runApproval = async (request: ProviderRegistrationReview) => {
    if (lock.current || !canReview) return;
    lock.current = true;
    setProcessing(true);
    setActionError(null);
    setNotice(null);
    const order = requests.data ?? [];
    try {
      const result = await approve.mutateAsync(request.id);
      if (
        result.providerAccount.id !== request.id ||
        result.providerAccount.verificationStatus !== 'VERIFIED'
      ) {
        setActionError(t('unconfirmed'));
        await requests.refetch();
        return;
      }
      // This is a confirmed server result, not an optimistic queue update.
      await queryClient.cancelQueries({ queryKey: reviewKey });
      queryClient.setQueryData<ProviderRegistrationReview[]>(
        reviewKey,
        (items) => items?.filter((item) => item.id !== request.id),
      );
      const remaining = order.filter((item) => item.id !== request.id);
      const index = order.findIndex((item) => item.id === request.id);
      setSelectedId(
        remaining[Math.min(index, remaining.length - 1)]?.id ?? null,
      );
      setNotice(
        t('approvedToastNamed', { name: request.providerAccount.displayName }),
      );
      toast.success(
        t('approvedToastNamed', { name: request.providerAccount.displayName }),
      );
      void queryClient.invalidateQueries({
        queryKey: ['administration', 'dashboard'],
      });
      await queryClient.invalidateQueries({ queryKey: reviewKey });
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.status === 404 ||
          error.status === 409 ||
          error.code === 'PROVIDER_ACCOUNT_INVALID_STATE')
      ) {
        try {
          const current = await providerReviewApi.detail(request.id);
          if (current.providerAccount.verificationStatus !== 'PENDING') {
            setActionError(
              t('serverDecision', {
                name: current.providerAccount.displayName,
                status: providerT(
                  `status.${current.providerAccount.verificationStatus.toLowerCase()}`,
                ),
              }),
            );
          } else setActionError(getApiErrorMessage(error, commonT));
        } catch (detailError) {
          setActionError(
            detailError instanceof ApiError && detailError.status === 404
              ? t('noLongerPending', {
                  name: request.providerAccount.displayName,
                })
              : getApiErrorMessage(error, commonT),
          );
        }
        await requests.refetch();
      } else setActionError(getApiErrorMessage(error, commonT));
    } finally {
      lock.current = false;
      setProcessing(false);
    }
  };

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

  const detail = selected;
  const showEmpty = requests.isSuccess && requests.data.length === 0;
  const missingSelection = requests.isSuccess && selectedId !== null && !detail;

  return (
    <section
      className={`admin-review-workspace ${mobileOpen ? 'mobile-detail-open' : ''}`}
      aria-label={t('title')}
    >
      <header className="admin-review-heading">
        <div>
          <p className="admin-review-eyebrow">Nexus Estate Administration</p>
          <h1>{t('title')}</h1>
          <p>{t('description')}</p>
        </div>
        <button
          type="button"
          className="admin-button-secondary"
          disabled={requests.isFetching || busy}
          onClick={() => void requests.refetch()}
        >
          <MarketplaceIcon name="arrow" className="h-4 w-4 rotate-90" />
          {t('refresh')}
        </button>
      </header>

      <div className="admin-review-layout">
        <aside
          className={`admin-review-queue ${detail ? 'admin-review-queue-has-detail' : ''}`}
        >
          <div className="admin-review-queue-header">
            <div className="flex items-center gap-3">
              <h2>{t('queue')}</h2>
              <span className="admin-review-count">
                {requests.data ? requests.data.length : '—'}
              </span>
            </div>
            <p>
              {requests.isLoading
                ? t('loading')
                : requests.data
                  ? t('queueCount', { count: requests.data.length })
                  : t('error')}
            </p>
            <label className="admin-review-search">
              <MarketplaceIcon name="search" className="h-5 w-5" />
              <span className="sr-only">{t('search')}</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t('search')}
              />
            </label>
          </div>
          {requests.isError ? (
            <div className="admin-review-state">
              <p>{t('error')}</p>
              <button
                className="admin-button-secondary"
                onClick={() => void requests.refetch()}
              >
                {t('retry')}
              </button>
            </div>
          ) : requests.isLoading ? (
            <div className="admin-review-skeletons" aria-label={t('loading')}>
              {[1, 2, 3].map((item) => (
                <div className="skeleton h-20" key={item} />
              ))}
            </div>
          ) : !visible.length ? (
            <div className="admin-review-state">
              <p>{search ? t('noSearchResults') : t('empty')}</p>
              <span>{search ? t('adjustSearch') : t('emptyDescription')}</span>
            </div>
          ) : (
            <div className="admin-review-list">
              {visible.map((item) => {
                const active = item.id === detail?.id;
                return (
                  <button
                    type="button"
                    key={item.id}
                    aria-pressed={active}
                    disabled={busy}
                    className={`admin-review-list-item ${active ? 'is-selected' : ''}`}
                    onClick={() => {
                      setSelectedId(item.id);
                      setMobileOpen(true);
                      setActionError(null);
                    }}
                  >
                    <span className="admin-review-avatar">
                      {initials(item.providerAccount.displayName)}
                    </span>
                    <span className="admin-review-list-copy">
                      <strong>{item.providerAccount.displayName}</strong>
                      <small>
                        {providerT(`types.${item.providerAccount.type}`)}
                      </small>
                    </span>
                    <time dateTime={item.providerAccount.createdAt}>
                      {format.relativeTime(
                        new Date(item.providerAccount.createdAt),
                        new Date(),
                      )}
                    </time>
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        <div
          className={`admin-review-detail ${detail ? 'is-open' : ''}`}
          aria-busy={busy}
        >
          {requests.isError && (
            <div className="admin-review-error" role="alert">
              <p>{t('error')}</p>
              <button
                type="button"
                className="admin-button-secondary mt-2"
                disabled={requests.isFetching || busy}
                onClick={() => void requests.refetch()}
              >
                {t('retry')}
              </button>
            </div>
          )}
          {notice && (
            <p className="admin-review-notice" role="status">
              {notice}
            </p>
          )}
          {actionError && (
            <p className="admin-review-error" role="alert">
              {actionError}
            </p>
          )}
          {missingSelection && !actionError && (
            <p className="admin-review-error" role="status">
              {t('selectionGone')}
            </p>
          )}
          {!detail && mobileOpen && (
            <button
              type="button"
              className="admin-review-back"
              onClick={() => setMobileOpen(false)}
            >
              {t('backToQueue')}
            </button>
          )}
          {detail ? (
            <>
              <button
                type="button"
                className="admin-review-back"
                disabled={busy}
                onClick={() => setMobileOpen(false)}
              >
                <MarketplaceIcon name="arrow" className="h-4 w-4 rotate-180" />{' '}
                {t('backToQueue')}
              </button>
              <div className="admin-review-detail-scroll">
                <div className="admin-review-breadcrumb">
                  {t('request')} <span>/</span> {detail.id}
                </div>
                <div className="admin-review-profile-head">
                  <span className="admin-review-profile-avatar">
                    {initials(detail.providerAccount.displayName)}
                  </span>
                  <div>
                    <h2>{detail.providerAccount.displayName}</h2>
                    <p>{providerT(`types.${detail.providerAccount.type}`)}</p>
                    <span className="admin-review-pending">
                      <MarketplaceIcon name="clock" className="h-4 w-4" />{' '}
                      {providerT(
                        `status.${detail.providerAccount.verificationStatus.toLowerCase()}`,
                      )}
                    </span>
                  </div>
                </div>
                <section className="admin-review-section">
                  <h3>{t('providerInformation')}</h3>
                  <dl className="admin-review-facts">
                    <div>
                      <dt>{t('request')}</dt>
                      <dd>{detail.id}</dd>
                    </div>
                    <div>
                      <dt>{t('provider')}</dt>
                      <dd>{detail.providerAccount.displayName}</dd>
                    </div>
                    <div>
                      <dt>{t('type')}</dt>
                      <dd>
                        {providerT(`types.${detail.providerAccount.type}`)}
                      </dd>
                    </div>
                    <div>
                      <dt>{t('verificationStatus')}</dt>
                      <dd>
                        {providerT(
                          `status.${detail.providerAccount.verificationStatus.toLowerCase()}`,
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt>{t('created')}</dt>
                      <dd>
                        {format.dateTime(
                          new Date(detail.providerAccount.createdAt),
                          { dateStyle: 'medium', timeStyle: 'short' },
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt>{t('updated')}</dt>
                      <dd>
                        {format.dateTime(
                          new Date(detail.providerAccount.updatedAt),
                          { dateStyle: 'medium', timeStyle: 'short' },
                        )}
                      </dd>
                    </div>
                  </dl>
                </section>
                <section className="admin-review-section">
                  <h3>{t('owner')}</h3>
                  <dl className="admin-review-facts">
                    <div>
                      <dt>{t('email')}</dt>
                      <dd className="break-all">{detail.owner.email}</dd>
                    </div>
                    <div>
                      <dt>{t('emailVerified')}</dt>
                      <dd>
                        {detail.owner.isEmailVerified ? t('yes') : t('no')}
                      </dd>
                    </div>
                    <div>
                      <dt>{t('lastLogin')}</dt>
                      <dd>
                        {detail.owner.lastLogin
                          ? format.dateTime(new Date(detail.owner.lastLogin), {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })
                          : '—'}
                      </dd>
                    </div>
                  </dl>
                </section>
              </div>
              <div className="admin-review-actions">
                <button
                  type="button"
                  className="admin-review-reject"
                  disabled
                  aria-describedby="review-rejection-unavailable"
                >
                  {t('reject')}
                </button>
                <button
                  type="button"
                  className="admin-review-approve"
                  disabled={
                    busy ||
                    requests.isError ||
                    detail.providerAccount.verificationStatus !== 'PENDING'
                  }
                  onClick={() => void runApproval(detail)}
                >
                  {busy ? t('approving') : t('approve')}
                </button>
                <p
                  id="review-rejection-unavailable"
                  className="admin-review-action-note"
                >
                  {t('rejectUnavailable')}
                </p>
              </div>
            </>
          ) : (
            <div className="admin-review-empty-detail">
              <h2>{showEmpty ? t('processedAll') : t('selectRequest')}</h2>
              <p>
                {showEmpty ? t('processedAllDescription') : t('selectRequest')}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
