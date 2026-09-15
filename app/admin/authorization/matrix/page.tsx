'use client';
import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import {
  PlatformSelector,
  useAuthorizationPlatform,
} from '@/components/administration/platform-selector';
import { PageHeader } from '@/components/portal/page-header';
import { useAdministrationSession } from '@/features/auth/administration/administration-session.provider';
import { administrationAuthorizationApi } from '@/lib/api/administration/authorization.api';
import type { MatrixResponse } from '@/lib/api/administration/types';
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
const sameSet = (left: string[], right: string[]) =>
  left.length === right.length && left.every((value) => right.includes(value));
export default function MatrixPage() {
  const t = useTranslations('common');
  const adminT = useTranslations('administration.authorization');
  const { platform, setPlatform } = useAuthorizationPlatform();
  const qc = useQueryClient();
  const { hasPermission } = useAdministrationSession();
  const query = useQuery({
    queryKey: ['administration', 'authorization', platform, 'matrix'],
    queryFn: () => administrationAuthorizationApi.matrix(platform),
  });
  const data = query.data as
    (MatrixResponse & { permissionGroups?: Group[] }) | undefined;
  const [roleId, setRoleId] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const activeRoleId = roleId || data?.roles?.[0]?.id || '';
  const persisted = data?.assignments?.[activeRoleId] ?? [];
  const activeSelected = roleId ? selected : persisted;
  const dirty = !sameSet(activeSelected, persisted);
  const activeRole = data?.roles.find((role) => role.id === activeRoleId);
  const canEdit =
    hasPermission('authorization:role:write') &&
    Boolean(activeRole?.allowedActions.updatePermissions);
  useEffect(() => {
    if (data?.roles && !data.roles.length) {
      // Empty platforms are valid and need a deliberate empty state.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRoleId('');
      setSelected([]);
      return;
    }
    if (data?.roles && !data.roles.some((role) => role.id === roleId)) {
      // Synchronize the draft with the first server-provided role once.
      setRoleId(data.roles[0].id);

      setSelected(data.assignments[data.roles[0].id] ?? []);
    }
  }, [data, roleId]);
  useEffect(() => {
    // Platform changes are an external navigation event; reset the local draft.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRoleId('');
    setSelected([]);
  }, [platform]);
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
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: ['administration', 'authorization', platform],
      });
    },
  });
  return (
    <>
      <PageHeader
        title={adminT('matrix')}
        description={adminT('matrixDescription')}
        actions={
          <>
            <button
              disabled={!activeRoleId || save.isPending || !dirty || !canEdit}
              onClick={() => save.mutate()}
              className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {save.isPending ? t('status.saving') : adminT('saveChanges')}
            </button>
            <button
              type="button"
              disabled={!dirty || save.isPending}
              onClick={() => {
                setSelected(data?.assignments?.[activeRoleId] ?? []);
              }}
              className="ml-2 rounded-md border border-[var(--border)] px-4 py-2 text-sm disabled:opacity-50"
            >
              {adminT('reset')}
            </button>
          </>
        }
      />
      <div className="mb-5">
        <PlatformSelector platform={platform} onChange={setPlatform} />
      </div>
      <div className="mb-5">
        <label
          className="text-xs font-medium text-[var(--text-muted)]"
          htmlFor="matrix-role"
        >
          {adminT('role')}
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
      {!query.isLoading && data?.roles?.length === 0 && (
        <p className="border border-dashed border-[var(--border)] p-6 text-sm text-[var(--text-muted)]">
          {adminT('noRolesForMatrix')}
        </p>
      )}
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
                    disabled={!canEdit}
                    onChange={(e) => {
                      setSelected((current) =>
                        e.target.checked
                          ? [...current, permission.id]
                          : current.filter((id) => id !== permission.id),
                      );
                    }}
                  />
                  <span>
                    <span className="block font-medium">
                      {permission.name ?? permission.code}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">
                      {permission.code}
                      {permission.riskLevel
                        ? ` · ${adminT(
                            `risk${permission.riskLevel[0]}${permission.riskLevel.slice(1).toLowerCase()}`,
                          )}`
                        : ''}
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
        <p className="text-sm text-[var(--text-muted)]">
          {adminT('loadingMatrix')}
        </p>
      )}
      {query.error && (
        <p className="text-sm text-[var(--danger)]">
          {adminT('unableToLoadMatrix')}
        </p>
      )}
    </>
  );
}
