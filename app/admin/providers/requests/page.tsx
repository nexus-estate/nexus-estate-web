'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/portal/page-header';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { providerReviewApi } from '@/lib/api/administration/provider-review.api';
import type { ProviderRegistrationReview } from '@/lib/api/administration/provider-review.types';
import { FEEDBACK, notify } from '@/lib/notify';
export default function ProviderRequestsPage() {
  const t = useTranslations('administration');
  const providerT = useTranslations('provider');
  const commonT = useTranslations('common');
  const queryClient = useQueryClient();
  const requests = useQuery({
    queryKey: ['administration', 'provider-requests'],
    queryFn: providerReviewApi.pending,
  });
  const approve = useMutation({
    mutationFn: providerReviewApi.approve,
    onMutate: async (accountId: string) => {
      // The request leaves the pending queue, so remove it immediately and
      // restore the queue if the approval fails.
      const key = ['administration', 'provider-requests'] as const;
      await queryClient.cancelQueries({ queryKey: key });
      const previous =
        queryClient.getQueryData<ProviderRegistrationReview[]>(key);
      queryClient.setQueryData<ProviderRegistrationReview[]>(key, (current) =>
        current?.filter((request) => request.id !== accountId),
      );
      return { previous };
    },
    onSuccess: () => {
      notify.success(commonT(FEEDBACK.approved));
      void queryClient.invalidateQueries({
        queryKey: ['administration', 'provider-requests'],
      });
    },
    onError: (error, _accountId, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(
          ['administration', 'provider-requests'],
          context.previous,
        );
      }
      notify.apiError(error, commonT);
    },
  });
  return (
    <>
      <PageHeader
        title={t('providerReview.title')}
        description={t('providerReview.description')}
      />
      <div className="panel overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>{t('providerReview.provider')}</th>
              <th>{t('providerReview.owner')}</th>
              <th>{t('providerReview.status')}</th>
              <th>{t('providerReview.approve')}</th>
            </tr>
          </thead>
          <tbody>
            {(requests.data ?? []).map((request) => (
              <tr key={request.id}>
                <td>
                  <a
                    className="link"
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
                <td>
                  <button
                    className="btn btn-secondary btn-sm"
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
