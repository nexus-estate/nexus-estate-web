'use client';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/portal/page-header';
import { administrationAuthorizationApi } from '@/lib/api/administration/authorization.api';
import type { MatrixResponse, Platform } from '@/lib/api/administration/types';
import { getApiErrorMessage } from '@/lib/api/error-message';
type Group = {
  category: string;
  permissions: Array<{
    id: string;
    code: string;
    name?: string;
    riskLevel?: string;
  }>;
};
export default function MatrixPage() {
  const t = useTranslations('common');
  const platform: Platform = 'MARKETPLACE';
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ['administration', 'authorization', platform, 'matrix'],
    queryFn: () => administrationAuthorizationApi.matrix(platform),
  });
  const data = query.data as
    (MatrixResponse & { permissionGroups?: Group[] }) | undefined;
  const [roleId, setRoleId] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const activeRoleId = roleId || data?.roles?.[0]?.id || '';
  const activeSelected = roleId
    ? selected
    : (data?.assignments?.[activeRoleId] ?? []);
  const save = useMutation({
    mutationFn: () =>
      administrationAuthorizationApi.replaceRolePermissions(
        platform,
        activeRoleId,
        {
          permissionIds: activeSelected,
          expectedVersion:
            data?.roles?.find((role) => role.id === activeRoleId)?.version ?? 1,
        },
      ),
    onSuccess: () =>
      void qc.invalidateQueries({
        queryKey: ['administration', 'authorization', platform],
      }),
  });
  return (
    <>
      <PageHeader
        title="Permission matrix"
        description="Edit one role at a time and save its complete permission set atomically."
        actions={
          <button
            disabled={!activeRoleId || save.isPending}
            onClick={() => save.mutate()}
            className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {save.isPending ? 'Saving…' : 'Save changes'}
          </button>
        }
      />
      <div className="mb-5">
        <label
          className="text-xs font-medium text-[var(--text-muted)]"
          htmlFor="matrix-role"
        >
          Role
        </label>
        <select
          id="matrix-role"
          className="mt-1 block w-full max-w-sm rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm"
          value={activeRoleId}
          onChange={(e) => {
            setRoleId(e.target.value);
            setSelected(data?.assignments?.[e.target.value] ?? []);
          }}
        >
          {(data?.roles ?? []).map((role) => (
            <option key={role.id} value={role.id}>
              {role.name} ({role.code})
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-5">
        {(data?.permissionGroups ?? []).map((group) => (
          <section
            className="border border-[var(--border)] bg-white"
            key={group.category}
          >
            <h2 className="border-b border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-3 text-sm font-medium">
              {group.category}
            </h2>
            <div className="grid gap-1 p-3 md:grid-cols-2">
              {group.permissions.map((permission) => (
                <label
                  className="flex items-start gap-3 rounded px-2 py-2 text-sm hover:bg-[var(--surface-subtle)]"
                  key={permission.id}
                >
                  <input
                    type="checkbox"
                    checked={activeSelected.includes(permission.id)}
                    onChange={(e) =>
                      setSelected((current) =>
                        e.target.checked
                          ? [...current, permission.id]
                          : current.filter((id) => id !== permission.id),
                      )
                    }
                  />
                  <span>
                    <span className="block font-medium">
                      {permission.name ?? permission.code}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">
                      {permission.code}
                      {permission.riskLevel ? ` · ${permission.riskLevel}` : ''}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </section>
        ))}
      </div>
      {save.isError && (
        <p className="mt-4 text-sm text-red-700">
          {getApiErrorMessage(save.error, t)}
        </p>
      )}
      {query.isLoading && (
        <p className="text-sm text-[var(--text-muted)]">Loading matrix…</p>
      )}
      {query.error && (
        <p className="text-sm text-red-700">Unable to load matrix.</p>
      )}
    </>
  );
}
