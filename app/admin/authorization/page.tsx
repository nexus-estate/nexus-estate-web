'use client';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { administrationAuthorizationApi } from '@/lib/api/administration/authorization.api';
import type {
  Platform,
  AuthorizationRole,
} from '@/lib/api/administration/types';
const platforms: Platform[] = ['MARKETPLACE', 'PROVIDER', 'ADMINISTRATION'];
export default function AuthorizationPage() {
  const t = useTranslations('administration.authorization');
  const [platform, setPlatform] = useState<Platform>('MARKETPLACE');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', description: '' });
  const qc = useQueryClient();
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
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow">Access control</p>
          <h1 className="mt-2 text-3xl font-bold text-[#102f2d]">
            {t('title')}
          </h1>
        </div>
        <select
          className="rounded border bg-white px-3 py-2"
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
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-xl bg-white p-6 shadow">
          <div className="flex justify-between">
            <h2 className="text-lg font-semibold">{t('roles')}</h2>
            <button
              className="rounded bg-[#173b38] px-3 py-2 text-sm text-white"
              onClick={() => setCreating(true)}
            >
              {t('create')}
            </button>
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
                placeholder="Code (e.g. SUPPORT_AGENT)"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
              />
              <input
                className="auth-input"
                required
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <textarea
                className="auth-input"
                placeholder="Description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
              <button
                className="rounded bg-[#9a7b4f] px-3 py-2 text-white"
                disabled={create.isPending}
              >
                Save
              </button>
            </form>
          )}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-xs uppercase text-gray-500">
                  <th className="py-3">Name</th>
                  <th>Code</th>
                  <th>Status</th>
                  <th>Permissions</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {items.map((role: AuthorizationRole) => (
                  <tr className="border-b" key={role.id}>
                    <td className="py-3 font-medium">{role.name}</td>
                    <td>{role.code}</td>
                    <td>{role.status ?? 'ACTIVE'}</td>
                    <td>{role.permissionCount ?? 0}</td>
                    <td>
                      {role.isDeletable && (
                        <button
                          className="text-red-700"
                          onClick={() => remove.mutate(role.id)}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {roles.isLoading && (
              <p className="py-6 text-gray-500">Loading roles…</p>
            )}
            {roles.error && (
              <p className="py-6 text-red-700">Unable to load roles.</p>
            )}
          </div>
        </section>
        <section className="rounded-xl bg-white p-6 shadow">
          <h2 className="text-lg font-semibold">{t('permissions')}</h2>
          <p className="mt-1 text-sm text-gray-500">
            Code-owned permissions grouped by category.
          </p>
          <div className="mt-4 space-y-3">
            {(permissions.data?.items ?? []).map((permission) => (
              <div key={permission.id} className="rounded border p-3">
                <div className="font-medium">{permission.code}</div>
                <div className="text-xs text-gray-500">
                  {permission.category ?? 'General'} ·{' '}
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
