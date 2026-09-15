'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
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
  const { platform, setPlatform } = useAuthorizationPlatform();
  const query = useQuery({
    queryKey: [
      'administration',
      'authorization',
      platform,
      'subjects',
      { q, status },
    ],
    queryFn: () =>
      administrationAuthorizationApi.subjects(platform, {
        q: q || undefined,
        status: status || undefined,
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
      <div className="mb-4">
        <input
          className="w-full max-w-sm rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm"
          placeholder={t('searchSubjects')}
          aria-label={t('searchSubjects')}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="ml-2 rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">{t('allStatuses')}</option>
          <option value="ACTIVE">{t('statusActive')}</option>
          <option value="DISABLED">{t('statusDisabled')}</option>
        </select>
      </div>
      <div className="overflow-x-auto border border-[var(--border)] bg-[var(--surface)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--surface-subtle)] text-xs uppercase text-[var(--text-muted)]">
            <tr>
              <th className="px-4 py-3">{t('identity')}</th>
              <th>{t('status')}</th>
              <th>{t('roles')}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr className="border-t border-[var(--border)]" key={item.id}>
                <td className="px-4 py-3">
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
          <p className="p-6 text-sm text-[var(--text-muted)]">{t('loading')}</p>
        )}
        {!query.isLoading && !items.length && (
          <p className="p-6 text-sm text-[var(--text-muted)]">
            {t('noSubjects')}
          </p>
        )}
      </div>
    </>
  );
}
