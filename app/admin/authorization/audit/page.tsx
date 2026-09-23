'use client';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/portal/page-header';
import { ErrorAlert } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Pagination } from '@/components/ui/Pagination';
import { administrationAuthorizationApi } from '@/lib/api/administration/authorization.api';

const DEFAULT_PAGE = 1;

export default function AuditPage() {
  const t = useTranslations('administration.authorization');
  const commonT = useTranslations('common');
  const query = useQuery({
    queryKey: ['administration', 'authorization', 'audit'],
    queryFn: () => administrationAuthorizationApi.audit(),
  });
  const items = query.data?.items ?? [];
  const meta = query.data?.meta;
  const page = meta?.page ?? DEFAULT_PAGE;
  const totalPages = meta?.totalPages ?? 0;
  return (
    <>
      <PageHeader title={t('audit')} description={t('auditDescription')} />
      <div className="panel overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>{t('time')}</th>
              <th>{t('actor')}</th>
              <th>{t('platform')}</th>
              <th>{t('action')}</th>
              <th>{t('requestId')}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id ?? `${item.createdAt}-${index}`}>
                <td>{item.createdAt ?? '—'}</td>
                <td>{item.actorAdministratorId}</td>
                <td>{item.platform ?? '—'}</td>
                <td>{item.action ?? '—'}</td>
                <td className="font-mono text-xs">{item.requestId ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {query.isLoading && (
          <LoadingState compact label={t('loading')} className="p-6" />
        )}
        {!query.isLoading && !items.length && !query.error && (
          <p className="p-6 text-sm text-[var(--text-muted)]">{t('noAudit')}</p>
        )}
      </div>
      {query.error && (
        <ErrorAlert
          message={t('error')}
          onRetry={() => query.refetch()}
          className="mt-4"
        />
      )}
      {!query.error && totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          hrefForPage={(target) => `/admin/authorization/audit?page=${target}`}
          labels={{
            previous: commonT('pagination.previous'),
            next: commonT('pagination.next'),
            pageOf: commonT('pagination.pageOf', {
              current: page,
              total: totalPages,
            }),
          }}
        />
      )}
    </>
  );
}
