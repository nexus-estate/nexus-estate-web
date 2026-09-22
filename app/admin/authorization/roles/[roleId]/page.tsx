'use client';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/portal/page-header';
import { ErrorAlert } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAdministrationSession } from '@/features/auth/administration/administration-session.provider';
import { administrationAuthorizationApi } from '@/lib/api/administration/authorization.api';
import type { Platform } from '@/lib/api/administration/types';
import { ApiError } from '@/lib/api/core/error';
import { getApiErrorMessage } from '@/lib/api/error-message';
import { FEEDBACK, notify } from '@/lib/notify';
export default function RoleDetailPage() {
  const t = useTranslations('administration.authorization');
  // Business error codes live in `common.errors`; a domain translator cannot
  // resolve them.
  const commonT = useTranslations('common');
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
    onSuccess: () => {
      notify.success(commonT(FEEDBACK.updated));
      void qc.invalidateQueries({
        queryKey: ['administration', 'authorization', platform],
      });
    },
    onError: (error) => {
      notify.apiError(error, commonT);
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
  if (role.isLoading)
    return <LoadingState label={t('loading')} className="min-h-[40vh]" />;
  if (!role.data) return <ErrorAlert message={t('error')} className="mt-6" />;
  const item = role.data;
  const canMetadata = canWrite && item.allowedActions.updateMetadata;
  const canStatus = canWrite && item.allowedActions.updateStatus;
  return (
    <>
      <PageHeader title={item.name} description={item.code} />
      <div className="max-w-3xl space-y-5">
        <section className="panel p-5 sm:p-6">
          <dl className="grid gap-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="label-caps">{t('status')}</dt>
              <dd className="mt-1">
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
              <dt className="label-caps">{t('type')}</dt>
              <dd className="mt-1 text-[var(--text)]">
                {item.isSystem ? t('system') : t('custom')}
              </dd>
            </div>
            <div>
              <dt className="label-caps">{t('version')}</dt>
              <dd className="mt-1 text-[var(--text)]">{item.version}</dd>
            </div>
            <div>
              <dt className="label-caps">{t('permissions')}</dt>
              <dd className="mt-1 text-[var(--text)]">
                {item.permissionCount}
              </dd>
            </div>
            <div>
              <dt className="label-caps">{t('assignments')}</dt>
              <dd className="mt-1 text-[var(--text)]">
                {item.assignmentCount}
              </dd>
            </div>
            <div>
              <dt className="label-caps">{t('updated')}</dt>
              <dd className="mt-1 text-[var(--text)]">{item.updatedAt}</dd>
            </div>
          </dl>
        </section>
        {canMetadata && (
          <section className="panel p-5 sm:p-6">
            <h2 className="text-sm font-semibold text-[var(--text)]">
              {t('edit')}
            </h2>
            <input
              className="field mt-4"
              aria-label={t('name')}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <textarea
              className="field mt-3"
              aria-label={t('description')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="mt-4 flex flex-wrap items-end gap-3">
              <button
                className="btn btn-primary"
                disabled={update.isPending || !name.trim()}
                onClick={() => update.mutate()}
              >
                {t('save')}
              </button>
              {canStatus && (
                <div>
                  <label className="field-label" htmlFor="role-status">
                    {t('status')}
                  </label>
                  <select
                    id="role-status"
                    className="field w-auto min-w-40"
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as 'ACTIVE' | 'DISABLED')
                    }
                  >
                    <option value="ACTIVE">{t('statusActive')}</option>
                    <option value="DISABLED">{t('statusDisabled')}</option>
                  </select>
                </div>
              )}
            </div>
            {update.isError && (
              <p role="alert" className="field-error">
                {getApiErrorMessage(update.error, commonT)}
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
        <section className="panel p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-[var(--text)]">
            {t('permissions')}
          </h2>
          <div className="mt-3">
            {item.permissions.map((permission) => (
              <div
                className="flex flex-wrap items-baseline gap-x-3 border-b border-[var(--border-muted)] py-2 text-sm last:border-0"
                key={permission.id}
              >
                <span className="text-[var(--text)]">{permission.name}</span>
                <code className="font-mono text-xs text-[var(--text-muted)]">
                  {permission.code}
                </code>
              </div>
            ))}
          </div>
        </section>
        <section className="panel p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-[var(--text)]">
            {t('assignedSubjects')}
          </h2>
          {subjects.isLoading && (
            <p className="mt-3 text-sm text-[var(--text-muted)]">
              {t('loading')}
            </p>
          )}
          {!subjects.isLoading && subjects.data?.items.length === 0 && (
            <p className="mt-3 text-sm text-[var(--text-muted)]">
              {t('noSubjects')}
            </p>
          )}
          <div className="mt-3 divide-y divide-[var(--border-muted)]">
            {subjects.data?.items.map((subject) => (
              <div className="py-2 text-sm" key={subject.id}>
                <span className="font-medium text-[var(--text)]">
                  {subject.displayName}
                </span>
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
