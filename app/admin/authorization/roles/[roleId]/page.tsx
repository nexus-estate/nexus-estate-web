'use client';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/portal/page-header';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAdministrationSession } from '@/features/auth/administration/administration-session.provider';
import { administrationAuthorizationApi } from '@/lib/api/administration/authorization.api';
import type { Platform } from '@/lib/api/administration/types';
import { ApiError } from '@/lib/api/core/error';
import { getApiErrorMessage } from '@/lib/api/error-message';
export default function RoleDetailPage() {
  const t = useTranslations('administration.authorization');
  const params = useParams<{ roleId: string }>();
  const search = useSearchParams();
  const platform = (search.get('platform') as Platform) || 'MARKETPLACE';
  const qc = useQueryClient();
  const { hasPermission } = useAdministrationSession();
  const role = useQuery({
    queryKey: [
      'administration',
      'authorization',
      platform,
      'role',
      params.roleId,
    ],
    queryFn: () => administrationAuthorizationApi.role(platform, params.roleId),
  });
  const subjects = useQuery({
    queryKey: [
      'administration',
      'authorization',
      platform,
      'role-subjects',
      params.roleId,
    ],
    queryFn: () =>
      administrationAuthorizationApi.roleSubjects(platform, params.roleId),
  });
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'DISABLED'>('ACTIVE');
  useEffect(() => {
    if (!role.data) return;
    // Server data is the canonical form source after each load/refetch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setName(role.data.name);
    setDescription(role.data.description ?? '');
    setStatus(role.data.status);
  }, [role.data]);
  const canWrite = hasPermission('authorization:role:write');
  const update = useMutation({
    mutationFn: () => {
      const payload = {
        name,
        description,
        expectedVersion: role.data?.version ?? 1,
        ...(canWrite && role.data?.allowedActions.updateStatus
          ? { status }
          : {}),
      };
      return administrationAuthorizationApi.updateRole(
        platform,
        params.roleId,
        payload,
      );
    },
    onSuccess: () =>
      void qc.invalidateQueries({
        queryKey: ['administration', 'authorization', platform],
      }),
    onError: (error) => {
      if (
        error instanceof ApiError &&
        error.errorCode === 'AUTHORIZATION_ROLE_VERSION_CONFLICT'
      ) {
        void qc.invalidateQueries({
          queryKey: [
            'administration',
            'authorization',
            platform,
            'role',
            params.roleId,
          ],
        });
      }
    },
  });
  if (role.isLoading) return <p>{t('loading')}</p>;
  if (!role.data) return <p className="text-sm text-red-700">{t('error')}</p>;
  const item = role.data;
  const canMetadata = canWrite && item.allowedActions.updateMetadata;
  const canStatus = canWrite && item.allowedActions.updateStatus;
  return (
    <>
      <PageHeader title={item.name} description={item.code} />
      <div className="max-w-3xl space-y-6">
        <section className="border border-[var(--border)] bg-[var(--surface)] p-6">
          <dl className="grid gap-4 sm:grid-cols-3 text-sm">
            <div>
              <dt>{t('status')}</dt>
              <dd>
                <StatusBadge
                  status={item.status}
                  label={
                    item.status === 'ACTIVE'
                      ? t('statusActive')
                      : t('statusDisabled')
                  }
                />
              </dd>
            </div>
            <div>
              <dt>{t('type')}</dt>
              <dd>{item.isSystem ? t('system') : t('custom')}</dd>
            </div>
            <div>
              <dt>{t('version')}</dt>
              <dd>{item.version}</dd>
            </div>
            <div>
              <dt>{t('permissions')}</dt>
              <dd>{item.permissionCount}</dd>
            </div>
            <div>
              <dt>{t('assignments')}</dt>
              <dd>{item.assignmentCount}</dd>
            </div>
            <div>
              <dt>{t('updated')}</dt>
              <dd>{item.updatedAt}</dd>
            </div>
          </dl>
        </section>
        {canMetadata && (
          <section className="border border-[var(--border)] bg-[var(--surface)] p-6">
            <h2 className="font-semibold">{t('edit')}</h2>
            <input
              className="mt-4 w-full border px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <textarea
              className="mt-3 w-full border px-3 py-2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <button
              className="mt-4 bg-[var(--primary)] px-4 py-2 text-sm text-white disabled:opacity-50"
              disabled={update.isPending || !name.trim()}
              onClick={() => update.mutate()}
            >
              {t('save')}
            </button>
            {canStatus && (
              <label className="mt-3 block text-sm">
                <span className="mr-2">{t('status')}</span>
                <select
                  className="border px-3 py-2"
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as 'ACTIVE' | 'DISABLED')
                  }
                >
                  <option value="ACTIVE">{t('statusActive')}</option>
                  <option value="DISABLED">{t('statusDisabled')}</option>
                </select>
              </label>
            )}
            {update.isError && (
              <p className="mt-3 text-sm text-red-700">
                {getApiErrorMessage(update.error, t)}
                {update.error instanceof ApiError && update.error.requestId
                  ? ` (${update.error.requestId})`
                  : ''}
              </p>
            )}
          </section>
        )}
        {!canMetadata && canWrite && (
          <p className="text-sm text-[var(--text-muted)]">{t('readOnly')}</p>
        )}
        <section className="border border-[var(--border)] bg-[var(--surface)] p-6">
          <h2 className="font-semibold">{t('permissions')}</h2>
          <div className="mt-3 space-y-2">
            {item.permissions.map((permission) => (
              <div className="border-b py-2 text-sm" key={permission.id}>
                <span>{permission.name}</span>
                <code className="ml-3 text-xs text-[var(--text-muted)]">
                  {permission.code}
                </code>
              </div>
            ))}
          </div>
        </section>
        <section className="border border-[var(--border)] bg-[var(--surface)] p-6">
          <h2 className="font-semibold">{t('assignedSubjects')}</h2>
          {subjects.isLoading && <p className="mt-3 text-sm">{t('loading')}</p>}
          {!subjects.isLoading && subjects.data?.items.length === 0 && (
            <p className="mt-3 text-sm text-[var(--text-muted)]">
              {t('noSubjects')}
            </p>
          )}
          <div className="mt-3 divide-y">
            {subjects.data?.items.map((subject) => (
              <div className="py-2 text-sm" key={subject.id}>
                <span className="font-medium">{subject.displayName}</span>
                <span className="ml-2 text-[var(--text-muted)]">
                  {subject.subjectType} ·{' '}
                  <StatusBadge
                    status={subject.status}
                    label={
                      subject.status === 'ACTIVE'
                        ? t('statusActive')
                        : subject.status === 'DISABLED'
                          ? t('statusDisabled')
                          : subject.status
                    }
                  />
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
