'use client';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/portal/page-header';
import { administrationAuthorizationApi } from '@/lib/api/administration/authorization.api';
import type { Platform } from '@/lib/api/administration/types';

export default function PermissionDetailPage() {
  const t = useTranslations('administration.authorization');
  const params = useParams<{ permissionId: string }>();
  const search = useSearchParams();
  const platform = (search.get('platform') as Platform) || 'MARKETPLACE';
  const permission = useQuery({
    queryKey: [
      'administration',
      'authorization',
      platform,
      'permission',
      params.permissionId,
    ],
    queryFn: () =>
      administrationAuthorizationApi.permission(platform, params.permissionId),
  });
  const roles = useQuery({
    queryKey: [
      'administration',
      'authorization',
      platform,
      'permission-roles',
      params.permissionId,
    ],
    queryFn: () =>
      administrationAuthorizationApi.permissionRoles(
        platform,
        params.permissionId,
      ),
  });
  if (permission.isLoading) return <p>{t('loading')}</p>;
  if (!permission.data)
    return <p className="text-sm text-red-700">{t('error')}</p>;
  const item = permission.data;
  return (
    <>
      <PageHeader title={item.name} description={item.code} />
      <div className="max-w-4xl space-y-6">
        <section className="border border-[var(--border)] bg-white p-6">
          <dl className="grid gap-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-[var(--text-muted)]">Category</dt>
              <dd>{item.category}</dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">Resource</dt>
              <dd>{item.resource}</dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">Action</dt>
              <dd>{item.action}</dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">Risk</dt>
              <dd>{item.riskLevel}</dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">Assignable</dt>
              <dd>{item.isAssignable ? 'Yes' : 'No'}</dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">Deprecated</dt>
              <dd>{item.isDeprecated ? 'Yes' : 'No'}</dd>
            </div>
          </dl>
          <p className="mt-5 text-sm text-[var(--text-muted)]">
            {item.description ?? '—'}
          </p>
        </section>
        <section className="border border-[var(--border)] bg-white p-6">
          <h2 className="font-semibold">Roles granting this permission</h2>
          <div className="mt-3 divide-y">
            {roles.data?.items.map((role) => (
              <div className="py-2 text-sm" key={role.id}>
                <Link
                  className="font-medium hover:underline"
                  href={`/admin/authorization/roles/${role.id}?platform=${platform}`}
                >
                  {role.name}
                </Link>
                <span className="ml-2 text-[var(--text-muted)]">
                  {role.code} · {role.status} ·{' '}
                  {role.isSystem ? 'System' : 'Custom'}
                </span>
              </div>
            ))}
          </div>
          {!roles.isLoading && !roles.data?.items.length && (
            <p className="mt-3 text-sm text-[var(--text-muted)]">
              {t('noRoles')}
            </p>
          )}
        </section>
      </div>
    </>
  );
}
