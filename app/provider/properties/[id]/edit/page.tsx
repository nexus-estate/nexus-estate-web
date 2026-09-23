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
import { FEEDBACK, notify } from '@/lib/notify';

const CONTROL_CLASS = 'field';

export default function EditProviderPropertyPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const t = useTranslations('provider');
  const commonT = useTranslations('common');
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
      notify.success(commonT(FEEDBACK.updated));
    } catch (error) {
      // The mutation state below still renders a safe 403 state for stale clients.
      notify.apiError(error, commonT, 'properties.updateFailed');
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
        <p className="panel mb-4 px-4 py-3 text-sm text-[var(--text-muted)]">
          {t(`lifecycle.${workspace.state.toLowerCase()}`)}
        </p>
      )}
      {workspace.state === 'ACTIVE_VERIFIED' && !canUpdate && (
        <p className="panel mb-4 px-4 py-3 text-sm text-[var(--text-muted)]">
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
              className="rounded-[var(--radius-md)] border border-[var(--danger)]/25 bg-[var(--danger-soft)] px-3.5 py-2.5 text-sm font-medium text-[var(--danger-strong)]"
            >
              {updateProperty.error instanceof ApiError &&
              updateProperty.error.status === 403
                ? t('permissionDenied')
                : t('properties.updateFailed')}
            </p>
          )}
          <div className="panel p-5 sm:p-6">
            <label className="field-label" htmlFor="estate-title">
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
              className="btn btn-primary btn-lg"
            >
              {updateProperty.isPending
                ? t('properties.updating')
                : t('properties.update')}
            </button>
            <button
              type="button"
              onClick={() => router.push('/provider/properties')}
              className="btn btn-secondary btn-lg"
            >
              {t('properties.cancel')}
            </button>
          </div>
        </form>
      )}
    </>
  );
}
