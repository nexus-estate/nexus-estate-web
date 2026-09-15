'use client';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/portal/page-header';
import { Panel } from '@/components/ui/Panel';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { providerReviewApi } from '@/lib/api/administration/provider-review.api';
export default function ProviderRequestDetailPage() {
  const t = useTranslations('administration.providerReview');
  const providerT = useTranslations('provider');
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
      await qc.invalidateQueries({
        queryKey: ['administration', 'provider-requests'],
      });
      router.push('/admin/provider-requests');
    },
  });
  if (request.isLoading) return <p>{t('loading')}</p>;
  if (!request.data)
    return (
      <p className="text-sm text-red-700">
        {request.error instanceof Error ? request.error.message : t('error')}
      </p>
    );
  const data = request.data;
  return (
    <>
      <PageHeader
        title={t('detailTitle')}
        description={t('detailDescription')}
      />
      <div className="grid gap-6 md:grid-cols-2">
        <Panel className="p-6">
          <h2 className="font-semibold">{t('request')}</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt>{t('provider')}</dt>
              <dd>{data.providerAccount.displayName}</dd>
            </div>
            <div>
              <dt>{t('type')}</dt>
              <dd>{providerT(`types.${data.providerAccount.type}`)}</dd>
            </div>
            <div>
              <dt>{t('status')}</dt>
              <dd>
                <StatusBadge
                  status={data.providerAccount.verificationStatus}
                  label={providerT(
                    `status.${data.providerAccount.verificationStatus.toLowerCase()}`,
                  )}
                />
              </dd>
            </div>
            <div>
              <dt>{t('created')}</dt>
              <dd>{data.providerAccount.createdAt}</dd>
            </div>
          </dl>
        </Panel>
        <Panel className="p-6">
          <h2 className="font-semibold">{t('owner')}</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt>{t('email')}</dt>
              <dd>{data.owner.email}</dd>
            </div>
            <div>
              <dt>{t('emailVerified')}</dt>
              <dd>{data.owner.isEmailVerified ? t('yes') : t('no')}</dd>
            </div>
          </dl>
          <button
            className="mt-6 bg-[var(--primary)] px-4 py-2 text-sm text-white disabled:opacity-50"
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
