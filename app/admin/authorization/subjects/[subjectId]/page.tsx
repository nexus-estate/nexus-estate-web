'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/portal/page-header';
import { useAdministrationSession } from '@/features/auth/administration/administration-session.provider';
import { administrationAuthorizationApi } from '@/lib/api/administration/authorization.api';
import type {
  AuthorizationPermission,
  Platform,
} from '@/lib/api/administration/types';
import { ApiError } from '@/lib/api/core/error';
import { getApiErrorMessage } from '@/lib/api/error-message';

export default function SubjectDetailPage() {
  const t = useTranslations('administration.authorization');
  const params = useParams<{ subjectId: string }>();
  const search = useSearchParams();
  const platform = (search.get('platform') as Platform) || 'MARKETPLACE';
  const { hasPermission } = useAdministrationSession();
  const qc = useQueryClient();
  const subject = useQuery({
    queryKey: [
      'administration',
      'authorization',
      platform,
      'subject',
      params.subjectId,
    ],
    queryFn: () =>
      administrationAuthorizationApi.subject(platform, params.subjectId),
  });
  const roles = useQuery({
    queryKey: [
      'administration',
      'authorization',
      platform,
      'roles',
      'assignment-options',
    ],
    queryFn: () =>
      administrationAuthorizationApi.roles(platform, {
        status: 'ACTIVE',
        limit: 100,
      }),
    enabled: hasPermission('authorization:assignment:write'),
  });
  const [reason, setReason] = useState('');
  const [draftRoles, setDraftRoles] = useState<string[] | null>(null);
  const selectedRoles =
    draftRoles ?? subject.data?.roles.map((role) => role.id) ?? [];
  const permissionsByCategory = useMemo(() => {
    const groups = new Map<string, AuthorizationPermission[]>();
    for (const permission of subject.data?.permissions ?? []) {
      const list = groups.get(permission.category) ?? [];
      list.push(permission);
      groups.set(permission.category, list);
    }
    return [...groups];
  }, [subject.data]);
  const assign = useMutation({
    mutationFn: () =>
      administrationAuthorizationApi.replaceSubjectRoles(
        platform,
        params.subjectId,
        {
          roleIds: selectedRoles,
          reason: reason.trim() || undefined,
        },
      ),
    onSuccess: () => {
      setDraftRoles(null);
      setReason('');
      void qc.invalidateQueries({
        queryKey: ['administration', 'authorization', platform],
      });
    },
  });
  if (subject.isLoading) return <p>{t('loading')}</p>;
  if (subject.isError || !subject.data)
    return <p className="text-sm text-red-700">{t('error')}</p>;
  const item = subject.data;
  return (
    <>
      <PageHeader
        title={item.displayName}
        description={item.secondaryText ?? item.subjectType}
      />
      <div className="max-w-4xl space-y-6">
        <section className="border border-[var(--border)] bg-white p-6">
          <h2 className="font-semibold">Identity / Context</h2>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-[var(--text-muted)]">Subject type</dt>
              <dd>{item.subjectType}</dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">Status</dt>
              <dd>{item.status}</dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">Secondary</dt>
              <dd>{item.secondaryText ?? '—'}</dd>
            </div>
            {item.providerDisplayName && (
              <div>
                <dt className="text-[var(--text-muted)]">Provider business</dt>
                <dd>{item.providerDisplayName}</dd>
              </div>
            )}
            {item.customerEmail && (
              <div>
                <dt className="text-[var(--text-muted)]">Customer email</dt>
                <dd>{item.customerEmail}</dd>
              </div>
            )}
          </dl>
          <details className="mt-4 text-xs text-[var(--text-muted)]">
            <summary>Technical details</summary>
            <pre className="mt-2 overflow-auto">
              {JSON.stringify(
                {
                  id: item.id,
                  providerId: item.providerId,
                  customerId: item.customerId,
                },
                null,
                2,
              )}
            </pre>
          </details>
        </section>
        <section className="border border-[var(--border)] bg-white p-6">
          <h2 className="font-semibold">Assigned roles</h2>
          <div className="mt-3 space-y-2">
            {item.roles.map((role) => (
              <div key={role.id} className="border-b py-2 text-sm">
                <Link
                  className="font-medium hover:underline"
                  href={`/admin/authorization/roles/${role.id}?platform=${platform}`}
                >
                  {role.name}
                </Link>
                <span className="ml-2 text-[var(--text-muted)]">
                  {role.code} · {role.status}
                </span>
              </div>
            ))}
          </div>
          {hasPermission('authorization:assignment:write') && (
            <div className="mt-5 border-t pt-4">
              <p className="text-sm font-medium">Replace role assignment</p>
              <div className="mt-2 grid gap-2">
                {roles.data?.items.map((role) => (
                  <label className="flex gap-2 text-sm" key={role.id}>
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(role.id)}
                      onChange={(e) =>
                        setDraftRoles((current) => {
                          const next = current ?? selectedRoles;
                          return e.target.checked
                            ? [...new Set([...next, role.id])]
                            : next.filter((id) => id !== role.id);
                        })
                      }
                    />
                    {role.name}{' '}
                    <code className="text-xs text-[var(--text-muted)]">
                      {role.code}
                    </code>
                  </label>
                ))}
              </div>
              <textarea
                className="mt-3 w-full border px-3 py-2 text-sm"
                placeholder="Reason (optional)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <button
                className="mt-3 rounded bg-[var(--primary)] px-4 py-2 text-sm text-white disabled:opacity-50"
                disabled={assign.isPending}
                onClick={() => assign.mutate()}
              >
                Save assignments
              </button>
              {assign.isError && (
                <p className="mt-2 text-sm text-red-700">
                  {getApiErrorMessage(assign.error, t)}
                  {assign.error instanceof ApiError && assign.error.requestId
                    ? ` (${assign.error.requestId})`
                    : ''}
                </p>
              )}
            </div>
          )}
        </section>
        <section className="border border-[var(--border)] bg-white p-6">
          <h2 className="font-semibold">Effective permissions</h2>
          <div className="mt-3 space-y-4">
            {permissionsByCategory.map(([category, permissions]) => (
              <div key={category}>
                <h3 className="text-sm font-medium">{category}</h3>
                {permissions.map((permission) => (
                  <div className="border-b py-2 text-sm" key={permission.id}>
                    {permission.name}
                    <code className="ml-2 text-xs text-[var(--text-muted)]">
                      {permission.code}
                    </code>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
