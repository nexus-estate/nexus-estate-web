'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { AdminPagination } from '@/components/administration/admin-pagination';
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
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [roleType, setRoleType] = useState('');
  const [permissionCode, setPermissionCode] = useState('');
  const [sort, setSort] = useState<
    | 'name'
    | 'code'
    | 'createdAt'
    | 'updatedAt'
    | 'assignmentCount'
    | 'permissionCount'
  >('name');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({ code: '', name: '', description: '' });
  const qc = useQueryClient();
  const { hasPermission } = useAdministrationSession();
  const canWrite = hasPermission('authorization:role:write');
  const platformQuery = useQuery({
    queryKey: ['administration', 'authorization', 'platforms'],
    queryFn: administrationAuthorizationApi.platforms,
  });
  const roles = useQuery({
    queryKey: [
      'administration',
      'authorization',
      platform,
      'roles',
      { q, status, roleType, permissionCode, sort, order, page },
    ],
    queryFn: () =>
      administrationAuthorizationApi.roles(platform, {
        q: q || undefined,
        status: status ? (status as 'ACTIVE' | 'DISABLED') : undefined,
        isSystem: roleType ? roleType === 'system' : undefined,
        permissionCode: permissionCode || undefined,
        sort,
        order,
        page,
        limit: 20,
      }),
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">{t('roles')}</h2>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                {roles.data?.meta.total ?? 0} {t('roles').toLocaleLowerCase()}
              </p>
            </div>
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
              className="mt-4 grid gap-3 rounded-xl border border-[var(--border)] bg-[#f8faf9] p-4"
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
              <button
                type="button"
                className="w-fit text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text)]"
                onClick={() => setCreating(false)}
              >
                {commonT('actions.cancel')}
              </button>
              {create.isError && (
                <p className="text-sm text-[var(--danger)]">
                  {create.error instanceof Error
                    ? create.error.message
                    : t('error')}
                </p>
              )}
            </form>
          )}
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <input
              className="app-control px-3 text-sm sm:max-w-xs"
              aria-label={t('search')}
              placeholder={t('searchRoles')}
              value={q}
              onChange={(event) => {
                setPage(1);
                setQ(event.target.value);
              }}
            />
            <select
              className="app-control px-3 text-sm sm:w-48"
              aria-label={t('status')}
              value={status}
              onChange={(event) => {
                setPage(1);
                setStatus(event.target.value);
              }}
            >
              <option value="">{t('allStatuses')}</option>
              <option value="ACTIVE">{t('statusActive')}</option>
              <option value="DISABLED">{t('statusDisabled')}</option>
            </select>
            <select
              className="app-control px-3 text-sm"
              aria-label={t('type')}
              value={roleType}
              onChange={(event) => {
                setPage(1);
                setRoleType(event.target.value);
              }}
            >
              <option value="">{t('allRoleTypes')}</option>
              <option value="system">{t('system')}</option>
              <option value="custom">{t('custom')}</option>
            </select>
            <input
              className="app-control px-3 text-sm"
              aria-label={t('permissionCode')}
              placeholder={t('permissionCode')}
              value={permissionCode}
              onChange={(event) => {
                setPage(1);
                setPermissionCode(event.target.value);
              }}
            />
            <select
              className="app-control px-3 text-sm"
              aria-label={t('sort')}
              value={sort}
              onChange={(event) => {
                setPage(1);
                setSort(event.target.value as typeof sort);
              }}
            >
              <option value="name">{t('sortName')}</option>
              <option value="code">{t('sortCode')}</option>
              <option value="createdAt">{t('sortCreated')}</option>
              <option value="updatedAt">{t('sortUpdated')}</option>
              <option value="assignmentCount">{t('sortAssignments')}</option>
              <option value="permissionCount">{t('sortPermissions')}</option>
            </select>
            <select
              className="app-control px-3 text-sm"
              aria-label={t('sortOrder')}
              value={order}
              onChange={(event) => {
                setPage(1);
                setOrder(event.target.value as 'asc' | 'desc');
              }}
            >
              <option value="asc">{t('ascending')}</option>
              <option value="desc">{t('descending')}</option>
            </select>
            <button
              type="button"
              className="w-fit text-xs font-semibold text-[var(--primary)] hover:underline"
              onClick={() => {
                setQ('');
                setStatus('');
                setRoleType('');
                setPermissionCode('');
                setSort('name');
                setOrder('asc');
                setPage(1);
              }}
            >
              {t('clearFilters')}
            </button>
          </div>
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
                      <Link
                        className="hover:underline"
                        href={`/admin/authorization/roles/${encodeURIComponent(role.id)}?platform=${encodeURIComponent(platform)}`}
                      >
                        {role.name}
                      </Link>
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
                          disabled={remove.isPending}
                          onClick={() => {
                            if (
                              window.confirm(
                                t('confirmDeleteRole', { name: role.name }),
                              )
                            )
                              remove.mutate(role.id);
                          }}
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
              <div className="py-6 text-sm text-[var(--danger)]">
                <p>{t('unableToLoadRoles')}</p>
                <button
                  className="mt-2 font-semibold underline"
                  onClick={() => void roles.refetch()}
                >
                  {t('retry')}
                </button>
              </div>
            )}
            {!roles.isLoading && !roles.error && !items.length && (
              <p className="py-8 text-center text-sm text-[var(--text-muted)]">
                {t('noRoles')}
              </p>
            )}
          </div>
          {roles.data?.meta && (
            <AdminPagination meta={roles.data.meta} onPageChange={setPage} />
          )}
          {remove.isError && (
            <p role="alert" className="mt-3 text-sm text-[var(--danger)]">
              {remove.error instanceof Error
                ? remove.error.message
                : t('error')}
            </p>
          )}
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
