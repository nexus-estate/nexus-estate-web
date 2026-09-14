'use client';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/portal/page-header';
import { administrationAuthorizationApi } from '@/lib/api/administration/authorization.api';
export default function AuditPage() {
  const query = useQuery({
    queryKey: ['administration', 'authorization', 'audit'],
    queryFn: () => administrationAuthorizationApi.audit(),
  });
  const items = query.data?.items ?? [];
  return (
    <>
      <PageHeader
        title="Authorization audit"
        description="Immutable authorization changes across platform boundaries."
      />
      <div className="overflow-x-auto border border-[var(--border)] bg-[var(--surface)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--surface-subtle)] text-xs uppercase text-[var(--text-muted)]">
            <tr>
              <th className="px-4 py-3">Time</th>
              <th>Actor</th>
              <th>Platform</th>
              <th>Action</th>
              <th>Request ID</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr
                className="border-t border-[var(--border)]"
                key={item.id ?? `${item.createdAt}-${index}`}
              >
                <td className="px-4 py-3">{item.createdAt ?? '—'}</td>
                <td>{item.actor ?? '—'}</td>
                <td>{item.platform ?? '—'}</td>
                <td>{item.action ?? '—'}</td>
                <td className="font-mono text-xs">{item.requestId ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {query.isLoading && (
          <p className="p-6 text-sm text-[var(--text-muted)]">
            Loading audit events…
          </p>
        )}
        {!query.isLoading && !items.length && (
          <p className="p-6 text-sm text-[var(--text-muted)]">
            No audit events found.
          </p>
        )}
      </div>
    </>
  );
}
