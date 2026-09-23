'use client';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/portal/page-header';
import { ErrorAlert } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { StatusBadge } from '@/components/ui/StatusBadge';
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
  if (permission.isLoading)
    return <LoadingState label={t('loading')} className="min-h-[40vh]" />;
  if (!permission.data)
    return <ErrorAlert message={t('error')} className="mt-6" />;
  const item = permission.data;
  return (
    <>
      <PageHeader title={item.name} description={item.code} />
      <div className="max-w-4xl space-y-5">
        <section className="panel p-5 sm:p-6">
          <dl className="grid gap-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-[var(--text-muted)]">{t('category')}</dt>
              <dd>{item.category}</dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">{t('resource')}</dt>
              <dd>{item.resource}</dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">{t('action')}</dt>
              <dd>{item.action}</dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">{t('risk')}</dt>
              <dd>
                {t(
                  `risk${item.riskLevel[0]}${item.riskLevel.slice(1).toLowerCase()}`,
                )}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">{t('assignable')}</dt>
              <dd>{item.isAssignable ? t('yes') : t('no')}</dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">{t('deprecated')}</dt>
              <dd>{item.isDeprecated ? t('yes') : t('no')}</dd>
            </div>
          </dl>
          <p className="mt-5 text-sm text-[var(--text-muted)]">
            {item.description ?? '—'}
          </p>
        </section>
        <section className="panel p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-[var(--text)]">
            {t('rolesGrantingPermission')}
          </h2>
          <div className="mt-3 divide-y divide-[var(--border-muted)]">
            {roles.data?.items.map((role) => (
              <div className="py-2 text-sm" key={role.id}>
                <Link
                  className="link"
                  href={`/admin/authorization/roles/${role.id}?platform=${platform}`}
                >
                  {role.name}
                </Link>
                <span className="ml-2 text-[var(--text-muted)]">
                  {role.code} ·{' '}
                  <StatusBadge
                    status={role.status}
                    label={
                      role.status === 'ACTIVE'
                        ? t('statusActive')
                        : t('statusDisabled')
                    }
                  />{' '}
                  · {role.isSystem ? t('system') : t('custom')}
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
