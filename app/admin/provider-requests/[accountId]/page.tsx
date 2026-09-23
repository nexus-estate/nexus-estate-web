'use client';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/portal/page-header';
import { ErrorAlert } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Panel } from '@/components/ui/Panel';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { providerReviewApi } from '@/lib/api/administration/provider-review.api';
import { FEEDBACK, notify } from '@/lib/notify';
export default function ProviderRequestDetailPage() {
  const t = useTranslations('administration.providerReview');
  const providerT = useTranslations('provider');
  const commonT = useTranslations('common');
  const params = useParams<{ accountId: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const request = useQuery({
    queryKey: ['administration', 'provider-requests', params.accountId],
    queryFn: () => providerReviewApi.detail(params.accountId),
  });
  const approve = useMutation({
    mutationFn: () => providerReviewApi.approve(params.accountId),
    onSuccess: async () => {
      notify.success(commonT(FEEDBACK.approved));
      await qc.invalidateQueries({
        queryKey: ['administration', 'provider-requests'],
      });
      router.push('/admin/provider-requests');
    },
    onError: (error) => notify.apiError(error, commonT),
  });
  if (request.isLoading)
    return <LoadingState label={t('loading')} className="min-h-[40vh]" />;
  if (!request.data)
    return (
      <ErrorAlert
        message={
          request.error instanceof Error ? request.error.message : t('error')
        }
        className="mt-6"
      />
    );
  const data = request.data;
  return (
    <>
      <PageHeader
        title={t('detailTitle')}
        description={t('detailDescription')}
      />
      <div className="grid gap-5 md:grid-cols-2">
        <Panel className="p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-[var(--text)]">
            {t('request')}
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-[var(--text-muted)]">{t('provider')}</dt>
              <dd className="mt-0.5 text-[var(--text)]">
                {data.providerAccount.displayName}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">{t('type')}</dt>
              <dd className="mt-0.5 text-[var(--text)]">
                {providerT(`types.${data.providerAccount.type}`)}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">{t('status')}</dt>
              <dd className="mt-0.5">
                <StatusBadge
                  status={data.providerAccount.verificationStatus}
                  label={providerT(
                    `status.${data.providerAccount.verificationStatus.toLowerCase()}`,
                  )}
                />
              </dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">{t('created')}</dt>
              <dd className="mt-0.5 text-[var(--text)]">
                {data.providerAccount.createdAt}
              </dd>
            </div>
          </dl>
        </Panel>
        <Panel className="p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-[var(--text)]">
            {t('owner')}
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-[var(--text-muted)]">{t('email')}</dt>
              <dd className="mt-0.5 text-[var(--text)]">{data.owner.email}</dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">{t('emailVerified')}</dt>
              <dd className="mt-0.5 text-[var(--text)]">
                {data.owner.isEmailVerified ? t('yes') : t('no')}
              </dd>
            </div>
          </dl>
          <button
            className="btn btn-primary mt-5"
            disabled={approve.isPending}
            onClick={() => {
              if (window.confirm(t('confirm'))) approve.mutate();
            }}
          >
            {approve.isPending ? t('approving') : t('approve')}
          </button>
        </Panel>
      </div>
    </>
  );
}
