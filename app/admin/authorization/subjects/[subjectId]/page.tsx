'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/portal/page-header';
import { ErrorAlert } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAdministrationSession } from '@/features/auth/administration/administration-session.provider';
import { administrationAuthorizationApi } from '@/lib/api/administration/authorization.api';
import type {
  AuthorizationPermission,
  Platform,
} from '@/lib/api/administration/types';
import { getApiErrorDisplayMessage } from '@/lib/api/error-message';
import { FEEDBACK, notify } from '@/lib/notify';
import {
  activeSelectedRoleIds,
  buildAssignmentRoleOptions,
  selectedDisabledRoleIds,
} from '../assignment-options';

export default function SubjectDetailPage() {
  const t = useTranslations('administration.authorization');
  // Business error codes live in `common.errors`; a domain translator cannot
  // resolve them.
  const commonT = useTranslations('common');
  const params = useParams<{ subjectId: string }>();
  const search = useSearchParams();
  const platform = (search.get('platform') as Platform) || 'MARKETPLACE';
  const { hasPermission } = useAdministrationSession();
  const canManageAssignments =
    hasPermission('authorization:assignment:write') &&
    hasPermission('authorization:role:read');
  const qc = useQueryClient();
  const subject = useQuery({
    queryKey: [
      'administration',
      'authorization',
      platform,
      'subject',
      params.subjectId,
    ],
    queryFn: () =>
      administrationAuthorizationApi.subject(platform, params.subjectId),
  });
  const roles = useQuery({
    queryKey: [
      'administration',
      'authorization',
      platform,
      'roles',
      'assignment-options',
    ],
    queryFn: () =>
      administrationAuthorizationApi.rolesAll(platform, {
        status: 'ACTIVE',
        limit: 100,
      }),
    enabled: canManageAssignments,
  });
  const [reason, setReason] = useState('');
  const [draftRoles, setDraftRoles] = useState<string[] | null>(null);
  const selectedRoles =
    draftRoles ?? subject.data?.roles.map((role) => role.id) ?? [];
  const assignmentOptions = useMemo(
    () =>
      buildAssignmentRoleOptions(
        subject.data?.roles ?? [],
        roles.data?.items ?? [],
      ),
    [roles.data?.items, subject.data?.roles],
  );
  const selectedDisabledRoles = selectedDisabledRoleIds(
    assignmentOptions,
    selectedRoles,
  );
  const activeSelectedRoles = activeSelectedRoleIds(
    assignmentOptions,
    selectedRoles,
  );
  const [validationError, setValidationError] = useState('');
  const permissionsByCategory = useMemo(() => {
    const groups = new Map<string, AuthorizationPermission[]>();
    for (const permission of subject.data?.permissions ?? []) {
      const list = groups.get(permission.category) ?? [];
      list.push(permission);
      groups.set(permission.category, list);
    }
    return [...groups];
  }, [subject.data]);
  const assign = useMutation({
    mutationFn: () =>
      administrationAuthorizationApi.replaceSubjectRoles(
        platform,
        params.subjectId,
        {
          roleIds: activeSelectedRoles,
          reason: reason.trim() || undefined,
        },
      ),
    onSuccess: () => {
      setDraftRoles(null);
      setReason('');
      setValidationError('');
      notify.success(commonT(FEEDBACK.assigned));
      void qc.invalidateQueries({
        queryKey: ['administration', 'authorization', platform],
      });
    },
    onError: (error) => notify.apiError(error, commonT),
  });
  if (subject.isLoading)
    return <LoadingState label={t('loading')} className="min-h-[40vh]" />;
  if (subject.isError || !subject.data)
    return <ErrorAlert message={t('error')} className="mt-6" />;
  const item = subject.data;
  const subjectTypeLabel =
    item.subjectType === 'CUSTOMER'
      ? t('subjectCustomer')
      : item.subjectType === 'PROVIDER_MEMBERSHIP'
        ? t('subjectProviderMembership')
        : item.subjectType === 'ADMINISTRATOR'
          ? t('subjectAdministrator')
          : item.subjectType;
  return (
    <>
      <PageHeader
        title={item.displayName}
        description={item.secondaryText ?? subjectTypeLabel}
      />
      <div className="max-w-4xl space-y-5">
        <section className="panel p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-[var(--text)]">
            {t('identity')}
          </h2>
          <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-[var(--text-muted)]">{t('subjectType')}</dt>
              <dd>{subjectTypeLabel}</dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">{t('status')}</dt>
              <dd>
                <StatusBadge
                  status={item.status}
                  label={
                    item.status === 'ACTIVE'
                      ? t('statusActive')
                      : item.status === 'DISABLED'
                        ? t('statusDisabled')
                        : item.status
                  }
                />
              </dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">{t('secondary')}</dt>
              <dd>{item.secondaryText ?? '—'}</dd>
            </div>
            {item.providerDisplayName && (
              <div>
                <dt className="text-[var(--text-muted)]">
                  {t('providerBusiness')}
                </dt>
                <dd>{item.providerDisplayName}</dd>
              </div>
            )}
            {item.customerEmail && (
              <div>
                <dt className="text-[var(--text-muted)]">
                  {t('customerEmail')}
                </dt>
                <dd>{item.customerEmail}</dd>
              </div>
            )}
          </dl>
          <details className="mt-4 text-xs text-[var(--text-muted)]">
            <summary>{t('technicalDetails')}</summary>
            <pre className="mt-2 overflow-auto">
              {JSON.stringify(
                {
                  id: item.id,
                  providerId: item.providerId,
                  customerId: item.customerId,
                },
                null,
                2,
              )}
            </pre>
          </details>
        </section>
        <section className="panel p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-[var(--text)]">
            {t('assignedSubjects')}
          </h2>
          <div className="mt-3">
            {item.roles.map((role) => (
              <div
                key={role.id}
                className="border-b border-[var(--border-muted)] py-2 text-sm last:border-0"
              >
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
                        : role.status === 'DISABLED'
                          ? t('statusDisabled')
                          : role.status
                    }
                  />
                </span>
              </div>
            ))}
          </div>
          {canManageAssignments && (
            <div className="mt-5 border-t border-[var(--border-muted)] pt-4">
              <p className="text-sm font-semibold text-[var(--text)]">
                {t('replaceAssignment')}
              </p>
              <div className="mt-2 grid gap-1.5">
                {assignmentOptions.map((role) => (
                  <label
                    className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] px-2 py-1.5 text-sm hover:bg-[var(--surface-subtle)]"
                    key={role.id}
                  >
                    <input
                      className="h-4 w-4 accent-[var(--primary)]"
                      type="checkbox"
                      checked={selectedRoles.includes(role.id)}
                      disabled={!role.canAdd && !role.assigned}
                      onChange={(e) =>
                        setDraftRoles((current) => {
                          const next = current ?? selectedRoles;
                          return e.target.checked
                            ? [...new Set([...next, role.id])]
                            : next.filter((id) => id !== role.id);
                        })
                      }
                    />
                    {role.name}{' '}
                    <code className="text-xs text-[var(--text-muted)]">
                      {role.code}
                    </code>
                    <span className="text-xs text-[var(--text-muted)]">
                      {role.status === 'DISABLED'
                        ? t('disabledRoleWarning')
                        : t('statusActive')}
                    </span>
                  </label>
                ))}
              </div>
              <textarea
                className="field mt-3"
                placeholder={t('reasonOptional')}
                aria-label={t('reasonOptional')}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              {selectedDisabledRoles.length > 0 && (
                <p className="mt-2 text-sm font-medium text-[var(--warning-strong)]">
                  {t('removeDisabledRoles')}
                </p>
              )}
              <button
                className="btn btn-primary mt-3"
                disabled={
                  assign.isPending ||
                  roles.isLoading ||
                  roles.isError ||
                  selectedDisabledRoles.length > 0
                }
                onClick={() => {
                  if (selectedDisabledRoles.length > 0) {
                    setValidationError(t('removeDisabledRoles'));
                    return;
                  }
                  assign.mutate();
                }}
              >
                {t('saveAssignments')}
              </button>
              {validationError && (
                <p role="alert" className="field-error">
                  {validationError}
                </p>
              )}
              {assign.isError && (
                <p role="alert" className="field-error">
                  {getApiErrorDisplayMessage(assign.error, commonT)}
                </p>
              )}
            </div>
          )}
        </section>
        <section className="panel p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-[var(--text)]">
            {t('effectivePermissions')}
          </h2>
          <div className="mt-3 space-y-5">
            {permissionsByCategory.map(([category, permissions]) => (
              <div key={category}>
                <h3 className="label-caps">{category}</h3>
                <div className="mt-1">
                  {permissions.map((permission) => (
                    <div
                      className="flex flex-wrap items-baseline gap-x-2 border-b border-[var(--border-muted)] py-2 text-sm last:border-0"
                      key={permission.id}
                    >
                      <span className="text-[var(--text)]">
                        {permission.name}
                      </span>
                      <code className="font-mono text-xs text-[var(--text-muted)]">
                        {permission.code}
                      </code>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
