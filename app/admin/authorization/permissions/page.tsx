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
import { administrationAuthorizationApi } from '@/lib/api/administration/authorization.api';
import type { RiskLevel } from '@/lib/api/administration/types';

const PAGE_SIZE = 20;

export default function PermissionsPage() {
  const t = useTranslations('administration.authorization');
  const { platform, setPlatform } = useAuthorizationPlatform();
  const [q, setQ] = useState('');
  const [riskLevel, setRiskLevel] = useState<RiskLevel | ''>('');
  const [includeDeprecated, setIncludeDeprecated] = useState(false);
  const [category, setCategory] = useState('');
  const [resource, setResource] = useState('');
  const [action, setAction] = useState('');
  const [assignable, setAssignable] = useState('');
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: [
      'administration',
      'authorization',
      platform,
      'permissions',
      {
        q,
        riskLevel,
        includeDeprecated,
        category,
        resource,
        action,
        assignable,
        page,
      },
    ],
    queryFn: () =>
      administrationAuthorizationApi.permissions(platform, {
        q: q || undefined,
        riskLevel: riskLevel || undefined,
        includeDeprecated,
        category: category || undefined,
        resource: resource || undefined,
        action: action || undefined,
        isAssignable: assignable ? assignable === 'true' : undefined,
        page,
        limit: PAGE_SIZE,
      }),
  });
  const clearFilters = () => {
    setQ('');
    setRiskLevel('');
    setIncludeDeprecated(false);
    setCategory('');
    setResource('');
    setAction('');
    setAssignable('');
    setPage(1);
  };

  return (
    <>
      <PageHeader
        title={t('permissions')}
        description={t('permissionsDescription')}
      />
      <div className="mb-5 rounded-2xl border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-xs)] sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <PlatformSelector
            platform={platform}
            onChange={(next) => {
              setPage(1);
              setPlatform(next);
            }}
          />
          <button
            type="button"
            className="text-xs font-semibold text-[var(--primary)] hover:underline"
            onClick={clearFilters}
          >
            {t('clearFilters')}
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <label className="relative block min-w-0 flex-1">
            <span className="sr-only">{t('searchPermissions')}</span>
            <svg
              viewBox="0 0 24 24"
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-subtle)]"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="10.8"
                cy="10.8"
                r="6.3"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <path
                d="M15.5 15.5L20 20"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
            <input
              className="app-control pl-9 pr-3 text-sm"
              placeholder={t('searchPermissions')}
              value={q}
              onChange={(e) => {
                setPage(1);
                setQ(e.target.value);
              }}
            />
          </label>
          <select
            aria-label={t('risk')}
            className="app-control px-3 text-sm"
            value={riskLevel}
            onChange={(e) => {
              setPage(1);
              setRiskLevel(e.target.value as RiskLevel | '');
            }}
          >
            <option value="">{t('allRisks')}</option>
            <option value="LOW">{t('riskLow')}</option>
            <option value="MEDIUM">{t('riskMedium')}</option>
            <option value="HIGH">{t('riskHigh')}</option>
            <option value="CRITICAL">{t('riskCritical')}</option>
          </select>
          <input
            className="app-control px-3 text-sm"
            aria-label={t('category')}
            placeholder={t('category')}
            value={category}
            onChange={(e) => {
              setPage(1);
              setCategory(e.target.value);
            }}
          />
          <input
            className="app-control px-3 text-sm"
            aria-label={t('resource')}
            placeholder={t('resource')}
            value={resource}
            onChange={(e) => {
              setPage(1);
              setResource(e.target.value);
            }}
          />
          <input
            className="app-control px-3 text-sm"
            aria-label={t('action')}
            placeholder={t('action')}
            value={action}
            onChange={(e) => {
              setPage(1);
              setAction(e.target.value);
            }}
          />
          <select
            className="app-control px-3 text-sm"
            aria-label={t('assignable')}
            value={assignable}
            onChange={(e) => {
              setPage(1);
              setAssignable(e.target.value);
            }}
          >
            <option value="">{t('allAssignable')}</option>
            <option value="true">{t('yes')}</option>
            <option value="false">{t('no')}</option>
          </select>
          <label className="flex min-h-10 items-center gap-2 rounded-lg border border-[var(--border)] px-3 text-sm text-[var(--text-muted)]">
            <input
              type="checkbox"
              checked={includeDeprecated}
              onChange={(e) => {
                setPage(1);
                setIncludeDeprecated(e.target.checked);
              }}
            />
            {t('showDeprecated')}
          </label>
        </div>
      </div>

      {query.isError ? (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
          {t('error')}
        </section>
      ) : query.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <div className="skeleton h-40 rounded-2xl" key={item} />
          ))}
        </div>
      ) : query.data?.items.length ? (
        <>
          <div className="mb-3 flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>
              {t('permissionCount', { count: query.data.meta.total })}
            </span>
            {query.isFetching && <span>{t('loading')}</span>}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {query.data.items.map((permission) => (
              <Link
                className="group rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-xs)] transition-all hover:-translate-y-0.5 hover:border-[#a7bbb1] hover:shadow-[var(--shadow-sm)]"
                href={`/admin/authorization/permissions/${permission.id}?platform=${platform}`}
                key={permission.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-semibold leading-5 text-[#173d39] group-hover:text-[var(--primary)]">
                    {permission.name}
                  </h2>
                  <span
                    className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${permission.riskLevel === 'CRITICAL' ? 'bg-red-100 text-red-800' : permission.riskLevel === 'HIGH' ? 'bg-orange-100 text-orange-800' : permission.riskLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}
                  >
                    {t(
                      `risk${permission.riskLevel[0]}${permission.riskLevel.slice(1).toLowerCase()}`,
                    )}
                  </span>
                </div>
                <code className="mt-3 block break-all rounded-lg bg-[#f6f8f7] px-2.5 py-2 text-[11px] text-[var(--text-muted)]">
                  {permission.code}
                </code>
                <p className="mt-3 text-xs text-[var(--text-muted)]">
                  {permission.category || t('general')} ·{' '}
                  {permission.resource || '—'} · {permission.action || '—'}
                </p>
                <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-[var(--text-muted)]">
                  {permission.description || t('noDescription')}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#24584c]">
                  {t('viewDetails')}{' '}
                  <span
                    aria-hidden="true"
                    className="transition-transform group-hover:translate-x-1"
                  >
                    →
                  </span>
                </span>
              </Link>
            ))}
          </div>
          <div className="mt-5 overflow-hidden rounded-2xl border border-[var(--border)] bg-white">
            <AdminPagination meta={query.data.meta} onPageChange={setPage} />
          </div>
        </>
      ) : (
        <section className="rounded-2xl border border-dashed border-[var(--border-strong)] bg-white px-6 py-14 text-center">
          <h2 className="font-semibold">{t('noPermissionsFound')}</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {t('adjustFilters')}
          </p>
        </section>
      )}
    </>
  );
}
