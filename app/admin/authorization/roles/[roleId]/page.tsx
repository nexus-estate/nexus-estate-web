'use client';
import { useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/portal/page-header';
import { administrationAuthorizationApi } from '@/lib/api/administration/authorization.api';
import type { Platform } from '@/lib/api/administration/types';
export default function RoleDetailPage() {
  const t = useTranslations('administration.authorization');
  const params = useParams<{ roleId: string }>();
  const search = useSearchParams();
  const platform = (search.get('platform') as Platform) || 'MARKETPLACE';
  const qc = useQueryClient();
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
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const update = useMutation({
    mutationFn: () =>
      administrationAuthorizationApi.updateRole(platform, params.roleId, {
        name,
        description,
        expectedVersion: role.data?.version ?? 1,
      }),
    onSuccess: () =>
      void qc.invalidateQueries({
        queryKey: ['administration', 'authorization', platform],
      }),
  });
  if (role.isLoading) return <p>{t('loading')}</p>;
  if (!role.data) return <p className="text-sm text-red-700">{t('error')}</p>;
  const item = role.data;
  return (
    <>
      <PageHeader title={item.name} description={item.code} />
      <div className="max-w-3xl space-y-6">
        <section className="border border-[var(--border)] bg-[var(--surface)] p-6">
          <dl className="grid gap-4 sm:grid-cols-3 text-sm">
            <div>
              <dt>{t('status')}</dt>
              <dd>{item.status}</dd>
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
        {item.allowedActions.updateMetadata && (
          <section className="border border-[var(--border)] bg-[var(--surface)] p-6">
            <h2 className="font-semibold">{t('edit')}</h2>
            <input
              className="mt-4 w-full border px-3 py-2"
              placeholder={item.name}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <textarea
              className="mt-3 w-full border px-3 py-2"
              placeholder={item.description ?? ''}
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
          </section>
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
      </div>
    </>
  );
}
