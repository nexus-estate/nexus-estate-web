'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { AdminPagination } from '@/components/administration/admin-pagination';
import {
  PlatformSelector,
  useAuthorizationPlatform,
} from '@/components/administration/platform-selector';
import { PageHeader } from '@/components/portal/page-header';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { administrationAuthorizationApi } from '@/lib/api/administration/authorization.api';
export default function SubjectsPage() {
  const t = useTranslations('administration.authorization');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const { platform, setPlatform } = useAuthorizationPlatform();
  const query = useQuery({
    queryKey: [
      'administration',
      'authorization',
      platform,
      'subjects',
      { q, status, page },
    ],
    queryFn: () =>
      administrationAuthorizationApi.subjects(platform, {
        q: q || undefined,
        status: status || undefined,
        page,
        limit: 20,
      }),
  });
  const items = query.data?.items ?? [];
  return (
    <>
      <PageHeader
        title={t('subjects')}
        description={t('identityDescription')}
      />
      <div className="mb-4">
        <PlatformSelector platform={platform} onChange={setPlatform} />
      </div>
      <section className="mb-4 flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-xs)] sm:flex-row sm:items-center">
        <input
          className="app-control px-3 text-sm sm:max-w-sm"
          placeholder={t('searchSubjects')}
          aria-label={t('searchSubjects')}
          value={q}
          onChange={(e) => {
            setPage(1);
            setQ(e.target.value);
          }}
        />
        <select
          aria-label={t('status')}
          className="app-control px-3 text-sm sm:w-52"
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
        >
          <option value="">{t('allStatuses')}</option>
          <option value="ACTIVE">{t('statusActive')}</option>
          <option value="DISABLED">{t('statusDisabled')}</option>
        </select>
        <span className="text-xs text-[var(--text-muted)] sm:ml-auto">
          {query.data?.meta.total ?? 0} {t('subjects').toLocaleLowerCase()}
        </span>
      </section>
      <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-xs)]">
        {query.isError ? (
          <div className="p-6 text-sm text-[var(--danger)]">{t('error')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f8faf9] text-[10px] uppercase tracking-[0.13em] text-[var(--text-muted)]">
                <tr>
                  <th className="px-5 py-4 sm:px-6">{t('identity')}</th>
                  <th className="px-5 py-4">{t('status')}</th>
                  <th className="px-5 py-4">{t('roles')}</th>
                  <th className="px-5 py-4 text-right sm:px-6">
                    {t('viewDetails')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr className="border-t border-[var(--border)]" key={item.id}>
                    <td className="px-5 py-4 sm:px-6">
                      <div className="font-medium">{item.displayName}</div>
                      {item.secondaryText && (
                        <div className="text-xs text-[var(--text-muted)]">
                          {item.secondaryText}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge
                        status={String(item.status ?? 'UNKNOWN')}
                        label={
                          item.status === 'ACTIVE'
                            ? t('statusActive')
                            : item.status === 'DISABLED'
                              ? t('statusDisabled')
                              : String(item.status ?? '—')
                        }
                      />
                    </td>
                    <td className="px-5 py-4">{String(item.roleCount)}</td>
                    <td className="px-5 py-4 text-right sm:px-6">
                      <Link
                        className="text-[var(--primary)] hover:underline"
                        href={`/admin/authorization/subjects/${item.id}?platform=${platform}`}
                      >
                        {t('viewDetails')}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {query.isLoading && (
              <div className="space-y-3 p-5">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="skeleton h-12 rounded-lg" />
                ))}
              </div>
            )}
            {!query.isLoading && !items.length && !query.isError && (
              <p className="p-6 text-sm text-[var(--text-muted)]">
                {t('noSubjects')}
              </p>
            )}
          </div>
        )}
        {query.data?.meta && (
          <AdminPagination meta={query.data.meta} onPageChange={setPage} />
        )}
      </section>
    </>
  );
}
