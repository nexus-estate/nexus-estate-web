'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useFormatter, useTranslations } from 'next-intl';
import { AdminPagination } from '@/components/administration/admin-pagination';
import { PageHeader } from '@/components/portal/page-header';
import { administrationAuthorizationApi } from '@/lib/api/administration/authorization.api';
import type { AuthorizationAuditFilters } from '@/lib/api/administration/types';
import { getApiErrorMessage } from '@/lib/api/error-message';

const PAGE_SIZE = 20;

export default function AuditPage() {
  const t = useTranslations('administration.authorization');
  const commonT = useTranslations('common');
  const format = useFormatter();
  const [page, setPage] = useState(1);
  const [platform, setPlatform] = useState('');
  const [action, setAction] = useState('');
  const [actorAdministratorId, setActorAdministratorId] = useState('');
  const [targetType, setTargetType] = useState('');
  const [targetId, setTargetId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const filters = useMemo<AuthorizationAuditFilters>(
    () => ({
      page,
      limit: PAGE_SIZE,
      platform: (platform ||
        undefined) as AuthorizationAuditFilters['platform'],
      action: action.trim() || undefined,
      actorAdministratorId: actorAdministratorId.trim() || undefined,
      targetType: targetType.trim() || undefined,
      targetId: targetId.trim() || undefined,
      from: from ? new Date(`${from}T00:00:00.000Z`).toISOString() : undefined,
      to: to ? new Date(`${to}T23:59:59.999Z`).toISOString() : undefined,
    }),
    [
      action,
      actorAdministratorId,
      from,
      page,
      platform,
      targetId,
      targetType,
      to,
    ],
  );
  const query = useQuery({
    queryKey: ['administration', 'authorization', 'audit', filters],
    queryFn: () => administrationAuthorizationApi.audit(filters),
  });
  const items = query.data?.items ?? [];
  const clearFilters = () => {
    setPage(1);
    setPlatform('');
    setAction('');
    setActorAdministratorId('');
    setTargetType('');
    setTargetId('');
    setFrom('');
    setTo('');
  };

  return (
    <>
      <PageHeader title={t('audit')} description={t('auditDescription')} />
      <section className="mb-5 rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-xs)] sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-[var(--text)]">{t('filters')}</h2>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              {t('auditFiltersDescription')}
            </p>
          </div>
          <button
            type="button"
            className="text-xs font-semibold text-[var(--primary)] hover:underline"
            onClick={clearFilters}
          >
            {t('clearFilters')}
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <label className="text-xs font-medium text-[var(--text-muted)]">
            {t('platform')}
            <select
              className="app-control mt-1.5 px-3 text-sm"
              value={platform}
              onChange={(event) => {
                setPage(1);
                setPlatform(event.target.value);
              }}
            >
              <option value="">{t('allPlatforms')}</option>
              <option value="MARKETPLACE">Marketplace</option>
              <option value="PROVIDER">Provider</option>
              <option value="ADMINISTRATION">Administration</option>
            </select>
          </label>
          <label className="text-xs font-medium text-[var(--text-muted)]">
            {t('action')}
            <input
              className="app-control mt-1.5 px-3 text-sm"
              placeholder={t('filterAction')}
              value={action}
              onChange={(event) => {
                setPage(1);
                setAction(event.target.value);
              }}
            />
          </label>
          <label className="text-xs font-medium text-[var(--text-muted)]">
            {t('actorId')}
            <input
              className="app-control mt-1.5 px-3 text-sm"
              placeholder={t('actorId')}
              value={actorAdministratorId}
              onChange={(event) => {
                setPage(1);
                setActorAdministratorId(event.target.value);
              }}
            />
          </label>
          <label className="text-xs font-medium text-[var(--text-muted)]">
            {t('targetType')}
            <input
              className="app-control mt-1.5 px-3 text-sm"
              placeholder={t('targetType')}
              value={targetType}
              onChange={(event) => {
                setPage(1);
                setTargetType(event.target.value);
              }}
            />
          </label>
          <label className="text-xs font-medium text-[var(--text-muted)]">
            {t('targetId')}
            <input
              className="app-control mt-1.5 px-3 text-sm"
              placeholder={t('targetId')}
              value={targetId}
              onChange={(event) => {
                setPage(1);
                setTargetId(event.target.value);
              }}
            />
          </label>
          <label className="text-xs font-medium text-[var(--text-muted)]">
            {t('from')}
            <input
              className="app-control mt-1.5 px-3 text-sm"
              type="date"
              value={from}
              max={to || undefined}
              onChange={(event) => {
                setPage(1);
                setFrom(event.target.value);
              }}
            />
          </label>
          <label className="text-xs font-medium text-[var(--text-muted)]">
            {t('to')}
            <input
              className="app-control mt-1.5 px-3 text-sm"
              type="date"
              value={to}
              min={from || undefined}
              onChange={(event) => {
                setPage(1);
                setTo(event.target.value);
              }}
            />
          </label>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-xs)]">
        {query.isError ? (
          <div className="m-5 rounded-xl border border-red-200 bg-red-50 p-5 sm:m-6">
            <p className="font-semibold text-red-900">{t('error')}</p>
            <p className="mt-1 text-sm text-red-800">
              {getApiErrorMessage(query.error, commonT)}
            </p>
            <button
              className="mt-4 rounded-lg bg-[#173d39] px-4 py-2 text-sm font-semibold text-white"
              onClick={() => void query.refetch()}
            >
              {t('retry')}
            </button>
          </div>
        ) : query.isLoading ? (
          <div className="space-y-3 p-5 sm:p-6">
            {[0, 1, 2, 3].map((item) => (
              <div className="skeleton h-12 rounded-lg" key={item} />
            ))}
          </div>
        ) : !items.length ? (
          <div className="px-6 py-16 text-center">
            <p className="font-semibold text-[var(--text)]">{t('noAudit')}</p>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              {t('noAuditFiltered')}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f8faf9] text-[10px] uppercase tracking-[0.13em] text-[var(--text-muted)]">
                <tr>
                  <th className="px-5 py-4 sm:px-6">{t('time')}</th>
                  <th className="px-5 py-4">{t('action')}</th>
                  <th className="px-5 py-4">{t('platform')}</th>
                  <th className="px-5 py-4">{t('actor')}</th>
                  <th className="px-5 py-4">{t('targetType')}</th>
                  <th className="px-5 py-4">{t('details')}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    className="border-t border-[var(--border-muted)]"
                    key={item.id}
                  >
                    <td className="whitespace-nowrap px-5 py-4 text-xs text-[var(--text-muted)] sm:px-6">
                      {item.createdAt
                        ? format.dateTime(new Date(item.createdAt), {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })
                        : '—'}
                    </td>
                    <td className="px-5 py-4 font-semibold text-[var(--text)]">
                      {item.action ?? '—'}
                    </td>
                    <td className="px-5 py-4">{item.platform ?? '—'}</td>
                    <td className="px-5 py-4 font-mono text-xs">
                      {item.actorAdministratorId}
                    </td>
                    <td className="px-5 py-4">{item.targetType ?? '—'}</td>
                    <td className="px-5 py-4">
                      <details className="max-w-sm">
                        <summary className="cursor-pointer text-xs font-semibold text-[var(--primary)]">
                          {t('viewDetails')}
                        </summary>
                        <div className="mt-2 space-y-1 rounded-lg bg-[#f6f8f7] p-3 text-xs text-[var(--text-muted)]">
                          <p>
                            {t('targetId')}: <code>{item.targetId ?? '—'}</code>
                          </p>
                          <p>
                            {t('requestId')}:{' '}
                            <code>{item.requestId ?? '—'}</code>
                          </p>
                          <p>
                            {t('reason')}: {item.reason ?? '—'}
                          </p>
                          <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap">
                            {JSON.stringify(
                              {
                                before: item.beforeState,
                                after: item.afterState,
                              },
                              null,
                              2,
                            )}
                          </pre>
                        </div>
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {query.data?.meta && (
          <AdminPagination meta={query.data.meta} onPageChange={setPage} />
        )}
      </section>
    </>
  );
}
