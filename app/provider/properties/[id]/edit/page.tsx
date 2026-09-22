'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { PageHeader } from '@/components/portal/page-header';
import { useProviderAuthorization } from '@/features/provider/context/provider-context.hooks';
import {
  useProviderProperty,
  useUpdateProviderProperty,
} from '@/features/provider/supply/provider-supply.queries';
import { ApiError } from '@/lib/api/core/error';

const CONTROL_CLASS =
  'mt-1 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)]';

export default function EditProviderPropertyPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const t = useTranslations('provider');
  const workspace = useProviderAuthorization();
  const property = useProviderProperty(
    params.id,
    workspace.hasProviderPermission('property:update'),
  );
  const updateProperty = useUpdateProviderProperty();
  const estate = property.data;
  const [title, setTitle] = useState<string | null>(null);
  const currentTitle = title ?? estate?.title ?? '';

  const lifecycleBlocked =
    workspace.state !== 'LOADING' && workspace.state !== 'ACTIVE_VERIFIED';
  const canUpdate = workspace.hasProviderPermission('property:update');
  const canSubmit =
    canUpdate && currentTitle.trim().length > 0 && !updateProperty.isPending;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    try {
      await updateProperty.mutateAsync({
        id: params.id,
        data: { title: currentTitle.trim() },
      });
      router.push('/provider/properties');
    } catch {
      // The mutation error below gives stale clients a safe 403 state.
    }
  };

  return (
    <>
      <PageHeader
        title={t('properties.editTitle')}
        description={t('properties.editDescription')}
      />
      {workspace.state === 'LOADING' && (
        <p className="mb-4 text-sm text-[var(--text-muted)]">{t('loading')}</p>
      )}
      {lifecycleBlocked && (
        <p className="mb-4 border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text-muted)]">
          {t(`lifecycle.${workspace.state.toLowerCase()}`)}
        </p>
      )}
      {workspace.state === 'ACTIVE_VERIFIED' && !canUpdate && (
        <p className="mb-4 border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text-muted)]">
          {t('permissionDenied')}
        </p>
      )}
      {property.isError && (
        <p role="alert" className="mb-4 text-sm text-[var(--danger)]">
          {property.error instanceof ApiError && property.error.status === 403
            ? t('permissionDenied')
            : t('properties.loadFailed')}
        </p>
      )}
      {!property.isLoading && !property.isError && !estate && (
        <p role="alert" className="mb-4 text-sm text-[var(--danger)]">
          {t('properties.loadFailed')}
        </p>
      )}
      {estate && canUpdate && (
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
          {updateProperty.isError && (
            <p
              role="alert"
              className="border border-[var(--danger)] px-4 py-3 text-sm text-[var(--danger)]"
            >
              {updateProperty.error instanceof ApiError &&
              updateProperty.error.status === 403
                ? t('permissionDenied')
                : t('properties.updateFailed')}
            </p>
          )}
          <div className="border border-[var(--border)] bg-[var(--surface)] p-6">
            <label className="block text-sm font-medium" htmlFor="estate-title">
              {t('properties.fields.title')}
            </label>
            <input
              id="estate-title"
              type="text"
              required
              value={currentTitle}
              onChange={(event) => setTitle(event.target.value)}
              className={CONTROL_CLASS}
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={!canSubmit}
              className="bg-[var(--primary)] px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {updateProperty.isPending
                ? t('properties.updating')
                : t('properties.update')}
            </button>
            <button
              type="button"
              onClick={() => router.push('/provider/properties')}
              className="border border-[var(--border)] px-6 py-2.5 text-sm font-medium text-[var(--text-muted)]"
            >
              {t('properties.cancel')}
            </button>
          </div>
        </form>
      )}
    </>
  );
}
