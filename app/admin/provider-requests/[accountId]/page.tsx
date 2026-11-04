'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useFormatter, useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { ProviderApprovalDialog } from '@/components/administration/provider-approval-dialog';
import { PageHeader } from '@/components/portal/page-header';
import { Panel, SectionHeader } from '@/components/ui/Panel';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAdministrationSession } from '@/features/auth/administration/administration-session.provider';
import { providerReviewApi } from '@/lib/api/administration/provider-review.api';
import { getApiErrorMessage } from '@/lib/api/error-message';

export default function ProviderRequestDetailPage() {
  const t = useTranslations('administration.providerReview');
  const providerT = useTranslations('provider');
  const commonT = useTranslations('common');
  const format = useFormatter();
  const params = useParams<{ accountId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { authorizationReady, hasPermission } = useAdministrationSession();
  const canReview =
    authorizationReady && hasPermission('provider-account:approve');
  const request = useQuery({
    queryKey: ['administration', 'provider-requests', params.accountId],
    queryFn: () => providerReviewApi.detail(params.accountId),
    enabled: canReview,
  });
  const approve = useMutation({
    mutationFn: () => providerReviewApi.approve(params.accountId),
    onSuccess: async () => {
      setConfirmOpen(false);
      toast.success(t('approvedToast'));
      await queryClient.invalidateQueries({
        queryKey: ['administration', 'provider-requests'],
      });
      await queryClient.invalidateQueries({
        queryKey: ['administration', 'dashboard'],
      });
      router.push('/admin/provider-requests');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, commonT)),
  });
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
        title={t('detailTitle')}
        description={t('detailDescription')}
        actions={
          <Link
            href="/admin/provider-requests"
            className="admin-button-secondary"
          >
            ← {t('backToQueue')}
          </Link>
        }
      />
      {request.isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="skeleton h-72" />
          <div className="skeleton h-72" />
        </div>
      ) : request.isError || !request.data ? (
        <Panel className="p-6">
          <p className="font-semibold text-[var(--danger)]">{t('error')}</p>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            {request.error instanceof Error
              ? request.error.message
              : t('error')}
          </p>
          <button
            className="admin-button-secondary mt-4"
            onClick={() => void request.refetch()}
          >
            {t('retry')}
          </button>
        </Panel>
      ) : (
        <>
          <div className="mb-5 flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border)] pb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                {t('request')}
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight">
                {request.data.providerAccount.displayName}
              </h2>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                {request.data.owner.email}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge
                status={request.data.providerAccount.verificationStatus}
                label={providerT(
                  `status.${request.data.providerAccount.verificationStatus.toLowerCase()}`,
                )}
              />
              <StatusBadge
                status={request.data.providerAccount.status}
                label={providerT(
                  `status.${request.data.providerAccount.status.toLowerCase()}`,
                )}
              />
            </div>
          </div>
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(300px,1fr)]">
            <Panel className="overflow-hidden">
              <SectionHeader title={t('providerInformation')} />
              <dl className="admin-detail-list">
                <div>
                  <dt>{t('provider')}</dt>
                  <dd>{request.data.providerAccount.displayName}</dd>
                </div>
                <div>
                  <dt>{t('type')}</dt>
                  <dd>
                    {providerT(`types.${request.data.providerAccount.type}`)}
                  </dd>
                </div>
                <div>
                  <dt>{t('verificationStatus')}</dt>
                  <dd>
                    <StatusBadge
                      status={request.data.providerAccount.verificationStatus}
                      label={providerT(
                        `status.${request.data.providerAccount.verificationStatus.toLowerCase()}`,
                      )}
                      size="sm"
                    />
                  </dd>
                </div>
                <div>
                  <dt>{t('accountStatus')}</dt>
                  <dd>
                    <StatusBadge
                      status={request.data.providerAccount.status}
                      label={providerT(
                        `status.${request.data.providerAccount.status.toLowerCase()}`,
                      )}
                      size="sm"
                    />
                  </dd>
                </div>
                <div>
                  <dt>{t('created')}</dt>
                  <dd className="tabular-nums">
                    {format.dateTime(
                      new Date(request.data.providerAccount.createdAt),
                      { dateStyle: 'medium', timeStyle: 'short' },
                    )}
                  </dd>
                </div>
                <div>
                  <dt>{t('updated')}</dt>
                  <dd className="tabular-nums">
                    {format.dateTime(
                      new Date(request.data.providerAccount.updatedAt),
                      { dateStyle: 'medium', timeStyle: 'short' },
                    )}
                  </dd>
                </div>
              </dl>
            </Panel>
            <div className="space-y-5">
              <Panel className="overflow-hidden">
                <SectionHeader title={t('owner')} />
                <dl className="admin-detail-list">
                  <div>
                    <dt>{t('email')}</dt>
                    <dd className="break-all">{request.data.owner.email}</dd>
                  </div>
                  <div>
                    <dt>{t('emailVerified')}</dt>
                    <dd>
                      <StatusBadge
                        status={
                          request.data.owner.isEmailVerified
                            ? 'VERIFIED'
                            : 'UNVERIFIED'
                        }
                        label={
                          request.data.owner.isEmailVerified
                            ? t('yes')
                            : t('no')
                        }
                        size="sm"
                      />
                    </dd>
                  </div>
                  <div>
                    <dt>{t('lastLogin')}</dt>
                    <dd className="tabular-nums">
                      {request.data.owner.lastLogin
                        ? format.dateTime(
                            new Date(request.data.owner.lastLogin),
                            { dateStyle: 'medium', timeStyle: 'short' },
                          )
                        : '—'}
                    </dd>
                  </div>
                </dl>
              </Panel>
              <Panel className="overflow-hidden">
                <SectionHeader
                  title={t('decision')}
                  description={t('decisionDescription')}
                />
                <div className="flex flex-wrap items-center gap-3 p-5">
                  <button
                    type="button"
                    className="admin-button-primary"
                    disabled={approve.isPending}
                    onClick={() => setConfirmOpen(true)}
                  >
                    {approve.isPending ? t('approving') : t('approve')}
                  </button>
                  <Link
                    href="/admin/provider-requests"
                    className="admin-button-secondary"
                  >
                    {t('backToQueue')}
                  </Link>
                </div>
              </Panel>
            </div>
          </div>
        </>
      )}
      <ProviderApprovalDialog
        open={confirmOpen}
        providerName={request.data?.providerAccount.displayName ?? ''}
        busy={approve.isPending}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => approve.mutate()}
      />
    </>
  );
}
