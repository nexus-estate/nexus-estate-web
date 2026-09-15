'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/portal/page-header';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAdministrationSession } from '@/features/auth/administration/administration-session.provider';
import { administrationAuthorizationApi } from '@/lib/api/administration/authorization.api';
import type {
  AuthorizationPermission,
  Platform,
} from '@/lib/api/administration/types';
import { getApiErrorDisplayMessage } from '@/lib/api/error-message';
import {
  activeSelectedRoleIds,
  buildAssignmentRoleOptions,
  selectedDisabledRoleIds,
} from '../assignment-options';

export default function SubjectDetailPage() {
  const t = useTranslations('administration.authorization');
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
      void qc.invalidateQueries({
        queryKey: ['administration', 'authorization', platform],
      });
    },
  });
  if (subject.isLoading) return <p>{t('loading')}</p>;
  if (subject.isError || !subject.data)
    return <p className="text-sm text-red-700">{t('error')}</p>;
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
      <div className="max-w-4xl space-y-6">
        <section className="border border-[var(--border)] bg-white p-6">
          <h2 className="font-semibold">{t('identity')}</h2>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
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
        <section className="border border-[var(--border)] bg-white p-6">
          <h2 className="font-semibold">{t('assignedSubjects')}</h2>
          <div className="mt-3 space-y-2">
            {item.roles.map((role) => (
              <div key={role.id} className="border-b py-2 text-sm">
                <Link
                  className="font-medium hover:underline"
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
            <div className="mt-5 border-t pt-4">
              <p className="text-sm font-medium">{t('replaceAssignment')}</p>
              <div className="mt-2 grid gap-2">
                {assignmentOptions.map((role) => (
                  <label className="flex gap-2 text-sm" key={role.id}>
                    <input
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
                className="mt-3 w-full border px-3 py-2 text-sm"
                placeholder={t('reasonOptional')}
                aria-label={t('reasonOptional')}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              {selectedDisabledRoles.length > 0 && (
                <p className="mt-2 text-sm text-amber-700">
                  {t('removeDisabledRoles')}
                </p>
              )}
              <button
                className="mt-3 rounded bg-[var(--primary)] px-4 py-2 text-sm text-white disabled:opacity-50"
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
                <p className="mt-2 text-sm text-red-700">{validationError}</p>
              )}
              {assign.isError && (
                <p className="mt-2 text-sm text-red-700">
                  {getApiErrorDisplayMessage(assign.error, t)}
                </p>
              )}
            </div>
          )}
        </section>
        <section className="border border-[var(--border)] bg-white p-6">
          <h2 className="font-semibold">{t('effectivePermissions')}</h2>
          <div className="mt-3 space-y-4">
            {permissionsByCategory.map(([category, permissions]) => (
              <div key={category}>
                <h3 className="text-sm font-medium">{category}</h3>
                {permissions.map((permission) => (
                  <div className="border-b py-2 text-sm" key={permission.id}>
                    {permission.name}
                    <code className="ml-2 text-xs text-[var(--text-muted)]">
                      {permission.code}
                    </code>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
