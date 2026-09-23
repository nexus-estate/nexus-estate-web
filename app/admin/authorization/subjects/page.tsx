'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import {
  PlatformSelector,
  useAuthorizationPlatform,
} from '@/components/administration/platform-selector';
import { PageHeader } from '@/components/portal/page-header';
import { ErrorAlert } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Pagination } from '@/components/ui/Pagination';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { administrationAuthorizationApi } from '@/lib/api/administration/authorization.api';

const DEFAULT_PAGE = 1;
const PAGE_SIZE = 20;

export default function SubjectsPage() {
  const t = useTranslations('administration.authorization');
  const commonT = useTranslations('common');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const { platform, setPlatform } = useAuthorizationPlatform();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const rawPage = Number.parseInt(searchParams.get('page') ?? '', 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : DEFAULT_PAGE;

  const hrefForPage = (target: number) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    if (target <= 1) nextParams.delete('page');
    else nextParams.set('page', String(target));
    const queryString = nextParams.toString();
    return queryString ? `${pathname}?${queryString}` : pathname;
  };

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
        limit: PAGE_SIZE,
      }),
  });
  const items = query.data?.items ?? [];
  const totalPages = query.data?.meta.totalPages ?? 0;
  return (
    <>
      <PageHeader
        title={t('subjects')}
        description={t('identityDescription')}
      />
      <div className="mb-4">
        <PlatformSelector platform={platform} onChange={setPlatform} />
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          className="field w-full sm:max-w-sm"
          placeholder={t('searchSubjects')}
          aria-label={t('searchSubjects')}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="field w-auto min-w-36"
          aria-label={t('status')}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">{t('allStatuses')}</option>
          <option value="ACTIVE">{t('statusActive')}</option>
          <option value="DISABLED">{t('statusDisabled')}</option>
        </select>
      </div>
      <div className="panel overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>{t('identity')}</th>
              <th>{t('status')}</th>
              <th>{t('roles')}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  <div className="font-medium">{item.displayName}</div>
                  {item.secondaryText && (
                    <div className="text-xs text-[var(--text-muted)]">
                      {item.secondaryText}
                    </div>
                  )}
                </td>
                <td>
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
                <td>{String(item.roleCount)}</td>
                <td>
                  <Link
                    className="link"
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
          <LoadingState compact label={t('loading')} className="p-6" />
        )}
        {!query.isLoading && !items.length && !query.error && (
          <p className="p-6 text-sm text-[var(--text-muted)]">
            {t('noSubjects')}
          </p>
        )}
      </div>
      {query.error && (
        <ErrorAlert
          message={t('error')}
          onRetry={() => query.refetch()}
          className="mt-4"
        />
      )}
      {!query.error && (
        <Pagination
          page={page}
          totalPages={totalPages}
          hrefForPage={hrefForPage}
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
