'use client';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/portal/page-header';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAdministrationSession } from '@/features/auth/administration/administration-session.provider';
import { administrationAuthorizationApi } from '@/lib/api/administration/authorization.api';
import type {
  Platform,
  AuthorizationRole,
} from '@/lib/api/administration/types';
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
      void qc.invalidateQueries({
        queryKey: ['administration', 'authorization', platform],
      });
    },
  });
  const remove = useMutation({
    mutationFn: (id: string) =>
      administrationAuthorizationApi.deleteRole(platform, id),
    onSuccess: () =>
      void qc.invalidateQueries({
        queryKey: ['administration', 'authorization', platform, 'roles'],
      }),
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
            className="app-control w-auto px-3 py-2"
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
        <section className="app-panel p-6">
          <div className="flex justify-between">
            <h2 className="text-lg font-semibold">{t('roles')}</h2>
            {canWrite && (
              <button
                className="rounded bg-[var(--primary)] px-3 py-2 text-sm text-white"
                onClick={() => setCreating(true)}
              >
                {t('create')}
              </button>
            )}
          </div>
          {creating && (
            <form
              className="mt-4 grid gap-3 border-b pb-5"
              onSubmit={(e) => {
                e.preventDefault();
                create.mutate();
              }}
            >
              <input
                className="auth-input"
                required
                placeholder="SUPPORT_AGENT"
                aria-label={t('code')}
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
              />
              <input
                className="auth-input"
                required
                placeholder={t('name')}
                aria-label={t('name')}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <textarea
                className="auth-input"
                placeholder={t('description')}
                aria-label={t('description')}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
              <button
                className="rounded bg-[var(--accent)] px-3 py-2 text-white"
                disabled={create.isPending}
              >
                {t('save')}
              </button>
            </form>
          )}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-xs uppercase text-gray-500">
                  <th className="py-3">{t('name')}</th>
                  <th>{t('code')}</th>
                  <th>{t('status')}</th>
                  <th>{t('permissionsCount')}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {items.map((role: AuthorizationRole) => (
                  <tr className="border-b" key={role.id}>
                    <td className="py-3 font-medium">
                      <a
                        className="hover:underline"
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
                          className="text-red-700"
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
              <p className="py-6 text-[var(--text-muted)]">
                {t('loadingRoles')}
              </p>
            )}
            {roles.error && (
              <p className="py-6 text-[var(--danger)]">
                {t('unableToLoadRoles')}
              </p>
            )}
          </div>
        </section>
        <section className="app-panel p-6">
          <h2 className="text-lg font-semibold">{t('permissions')}</h2>
          <p className="mt-1 text-sm text-gray-500">
            {t('permissionsDescription')}
          </p>
          <div className="mt-4 space-y-3">
            {(permissions.data?.items ?? []).map((permission) => (
              <div key={permission.id} className="rounded border p-3">
                <div className="font-medium">{permission.code}</div>
                <div className="text-xs text-gray-500">
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
