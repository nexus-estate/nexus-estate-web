'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  PlatformSelector,
  useAuthorizationPlatform,
} from '@/components/administration/platform-selector';
import { PageHeader } from '@/components/portal/page-header';
import { administrationAuthorizationApi } from '@/lib/api/administration/authorization.api';
export default function SubjectsPage() {
  const [q, setQ] = useState('');
  const { platform, setPlatform } = useAuthorizationPlatform();
  const query = useQuery({
    queryKey: ['administration', 'authorization', platform, 'subjects', q],
    queryFn: () =>
      administrationAuthorizationApi.subjects(platform, q ? { q } : {}),
  });
  const items = query.data?.items ?? [];
  return (
    <>
      <PageHeader
        title="Authorization subjects"
        description="Platform-specific identities and their current role assignments."
      />
      <div className="mb-4">
        <PlatformSelector platform={platform} onChange={setPlatform} />
      </div>
      <div className="mb-4">
        <input
          className="w-full max-w-sm rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm"
          placeholder="Search customer identity"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <div className="overflow-x-auto border border-[var(--border)] bg-[var(--surface)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--surface-subtle)] text-xs uppercase text-[var(--text-muted)]">
            <tr>
              <th className="px-4 py-3">Identity</th>
              <th>Status</th>
              <th>Roles</th>
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
                <td>{String(item.status ?? '—')}</td>
                <td>{item.roleIds.length ? String(item.roleCount) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {query.isLoading && (
          <p className="p-6 text-sm text-[var(--text-muted)]">
            Loading subjects…
          </p>
        )}
        {!query.isLoading && !items.length && (
          <p className="p-6 text-sm text-[var(--text-muted)]">
            No subjects found.
          </p>
        )}
      </div>
    </>
  );
}
