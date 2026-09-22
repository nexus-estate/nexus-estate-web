'use client';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/portal/page-header';
import { ErrorAlert } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAdministrationSession } from '@/features/auth/administration/administration-session.provider';
import { administrationAuthorizationApi } from '@/lib/api/administration/authorization.api';
import type {
  Platform,
  AuthorizationRole,
} from '@/lib/api/administration/types';
import { FEEDBACK, notify } from '@/lib/notify';
const platforms: Platform[] = ['MARKETPLACE', 'PROVIDER', 'ADMINISTRATION'];
export default function AuthorizationPage() {
  const t = useTranslations('administration.authorization');
  const commonT = useTranslations('common');
  const [platform, setPlatform] = useState<Platform>('MARKETPLACE');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', description: '' });
  const qc = useQueryClient();
  const { hasPermission } = useAdministrationSession();
  const canWrite = hasPermission('authorization:role:write');
  const platformQuery = useQuery({
    queryKey: ['administration', 'authorization', 'platforms'],
    queryFn: administrationAuthorizationApi.platforms,
  });
  const roles = useQuery({
    queryKey: ['administration', 'authorization', platform, 'roles'],
    queryFn: () => administrationAuthorizationApi.roles(platform),
  });
  const permissions = useQuery({
    queryKey: ['administration', 'authorization', platform, 'permissions'],
    queryFn: () => administrationAuthorizationApi.permissions(platform),
  });
  const create = useMutation({
    mutationFn: () => administrationAuthorizationApi.createRole(platform, form),
    onSuccess: () => {
      setCreating(false);
      setForm({ code: '', name: '', description: '' });
      notify.success(commonT(FEEDBACK.created));
      void qc.invalidateQueries({
        queryKey: ['administration', 'authorization', platform],
      });
    },
    onError: (error) => notify.apiError(error, commonT),
  });
  const remove = useMutation({
    mutationFn: (id: string) =>
      administrationAuthorizationApi.deleteRole(platform, id),
    onSuccess: () => {
      notify.success(commonT(FEEDBACK.deleted));
      void qc.invalidateQueries({
        queryKey: ['administration', 'authorization', platform, 'roles'],
      });
    },
    onError: (error) => notify.apiError(error, commonT),
  });
  const items = roles.data?.items ?? [];
  return (
    <div>
      <PageHeader
        title={t('title')}
        description={t('description')}
        actions={
          <select
            aria-label={t('platform')}
            className="field w-auto min-w-40"
            value={platform}
            onChange={(e) => setPlatform(e.target.value as Platform)}
          >
            {(platformQuery.data?.items?.length
              ? platformQuery.data.items.map((item) => item.platform)
              : platforms
            ).map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        }
      />
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="panel p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-[var(--text)]">
              {t('roles')}
            </h2>
            {canWrite && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setCreating(true)}
              >
                {t('create')}
              </button>
            )}
          </div>
          {creating && (
            <form
              className="mt-4 grid gap-3 border-b border-[var(--border-muted)] pb-5"
              onSubmit={(e) => {
                e.preventDefault();
                create.mutate();
              }}
            >
              <input
                className="field"
                required
                placeholder="SUPPORT_AGENT"
                aria-label={t('code')}
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
              />
              <input
                className="field"
                required
                placeholder={t('name')}
                aria-label={t('name')}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <textarea
                className="field"
                placeholder={t('description')}
                aria-label={t('description')}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
              <button className="btn btn-primary" disabled={create.isPending}>
                {t('save')}
              </button>
            </form>
          )}
          <div className="mt-4 overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('name')}</th>
                  <th>{t('code')}</th>
                  <th>{t('status')}</th>
                  <th>{t('permissionsCount')}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {items.map((role: AuthorizationRole) => (
                  <tr key={role.id}>
                    <td className="font-medium">
                      <a
                        className="link"
                        href={`/admin/authorization/roles/${encodeURIComponent(role.id)}?platform=${encodeURIComponent(platform)}`}
                      >
                        {role.name}
                      </a>
                    </td>
                    <td>{role.code}</td>
                    <td>
                      <StatusBadge
                        status={role.status ?? 'ACTIVE'}
                        label={
                          role.status === 'DISABLED'
                            ? t('statusDisabled')
                            : t('statusActive')
                        }
                      />
                    </td>
                    <td>{role.permissionCount ?? 0}</td>
                    <td>
                      {canWrite && role.allowedActions.delete && (
                        <button
                          className="text-sm font-medium text-[var(--danger)] hover:underline"
                          onClick={() => remove.mutate(role.id)}
                        >
                          {commonT('actions.delete')}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {roles.isLoading && (
              <LoadingState compact label={t('loadingRoles')} />
            )}
            {roles.error && (
              <ErrorAlert
                message={t('unableToLoadRoles')}
                onRetry={() => roles.refetch()}
                className="mt-3"
              />
            )}
          </div>
        </section>
        <section className="panel p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-[var(--text)]">
            {t('permissions')}
          </h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {t('permissionsDescription')}
          </p>
          <div className="mt-4 space-y-2">
            {(permissions.data?.items ?? []).map((permission) => (
              <div key={permission.id} className="panel-flush px-3 py-2.5">
                <div className="font-mono text-xs font-medium text-[var(--text)]">
                  {permission.code}
                </div>
                <div className="mt-0.5 text-xs text-[var(--text-muted)]">
                  {permission.category ?? t('general')} ·{' '}
                  {permission.action ?? '—'}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
