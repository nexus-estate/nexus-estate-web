'use client';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/portal/page-header';
import { administrationAuthorizationApi } from '@/lib/api/administration/authorization.api';
export default function AuditPage() {
  const t = useTranslations('administration.authorization');
  const query = useQuery({
    queryKey: ['administration', 'authorization', 'audit'],
    queryFn: () => administrationAuthorizationApi.audit(),
  });
  const items = query.data?.items ?? [];
  return (
    <>
      <PageHeader title={t('audit')} description={t('auditDescription')} />
      <div className="overflow-x-auto border border-[var(--border)] bg-[var(--surface)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--surface-subtle)] text-xs uppercase text-[var(--text-muted)]">
            <tr>
              <th className="px-4 py-3">{t('time')}</th>
              <th>{t('actor')}</th>
              <th>{t('platform')}</th>
              <th>{t('action')}</th>
              <th>{t('requestId')}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr
                className="border-t border-[var(--border)]"
                key={item.id ?? `${item.createdAt}-${index}`}
              >
                <td className="px-4 py-3">{item.createdAt ?? '—'}</td>
                <td>{item.actorAdministratorId}</td>
                <td>{item.platform ?? '—'}</td>
                <td>{item.action ?? '—'}</td>
                <td className="font-mono text-xs">{item.requestId ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {query.isLoading && (
          <p className="p-6 text-sm text-[var(--text-muted)]">{t('loading')}</p>
        )}
        {!query.isLoading && !items.length && (
          <p className="p-6 text-sm text-[var(--text-muted)]">{t('noAudit')}</p>
        )}
      </div>
    </>
  );
}
