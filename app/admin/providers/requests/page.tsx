'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/portal/page-header';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { providerReviewApi } from '@/lib/api/administration/provider-review.api';
export default function ProviderRequestsPage() {
  const t = useTranslations('administration');
  const providerT = useTranslations('provider');
  const queryClient = useQueryClient();
  const requests = useQuery({
    queryKey: ['administration', 'provider-requests'],
    queryFn: providerReviewApi.pending,
  });
  const approve = useMutation({
    mutationFn: providerReviewApi.approve,
    onSuccess: () =>
      void queryClient.invalidateQueries({
        queryKey: ['administration', 'provider-requests'],
      }),
  });
  return (
    <>
      <PageHeader
        title={t('providerReview.title')}
        description={t('providerReview.description')}
      />
      <div className="overflow-x-auto border border-[var(--border)] bg-[var(--surface)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--surface-subtle)] text-xs uppercase text-[var(--text-muted)]">
            <tr>
              <th className="px-4 py-3">{t('providerReview.provider')}</th>
              <th>{t('providerReview.owner')}</th>
              <th>{t('providerReview.status')}</th>
              <th className="px-4 py-3">{t('providerReview.approve')}</th>
            </tr>
          </thead>
          <tbody>
            {(requests.data ?? []).map((request) => (
              <tr className="border-t border-[var(--border)]" key={request.id}>
                <td className="px-4 py-3 font-medium">
                  <a
                    className="hover:underline"
                    href={`/admin/provider-requests/${request.id}`}
                  >
                    {request.providerAccount.displayName}
                  </a>
                </td>
                <td>{request.owner.email}</td>
                <td>
                  <div className="flex flex-wrap gap-1.5">
                    <StatusBadge
                      status={request.providerAccount.verificationStatus}
                      label={providerT(
                        `status.${request.providerAccount.verificationStatus.toLowerCase()}`,
                      )}
                    />
                    <StatusBadge
                      status={request.providerAccount.status}
                      label={providerT(
                        `status.${request.providerAccount.status.toLowerCase()}`,
                      )}
                    />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button
                    className="rounded-md bg-[var(--primary)] px-3 py-1.5 text-xs text-white disabled:opacity-50"
                    disabled={approve.isPending}
                    onClick={() => approve.mutate(request.id)}
                  >
                    {t('providerReview.approve')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {requests.isLoading && (
          <p className="p-6 text-sm text-[var(--text-muted)]">
            {t('providerReview.loading')}
          </p>
        )}
        {!requests.isLoading && !requests.data?.length && (
          <p className="p-6 text-sm text-[var(--text-muted)]">
            {t('providerReview.empty')}
          </p>
        )}
      </div>
    </>
  );
}
