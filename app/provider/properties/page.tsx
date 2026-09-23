'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { PageHeader } from '@/components/portal/page-header';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorAlert } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useProviderAuthorization } from '@/features/provider/context/provider-context.hooks';
import {
  useArchiveProviderProperty,
  useActivateProviderProperty,
  useProviderProperties,
  useRestoreProviderProperty,
} from '@/features/provider/supply/provider-supply.queries';
import { ApiError } from '@/lib/api/core/error';
import type { Estate } from '@/lib/api/estate/estate.types';

function formatPrice(value: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function ProviderPropertiesPage() {
  const locale = useLocale();
  const t = useTranslations('provider');
  const workspace = useProviderAuthorization();
  const properties = useProviderProperties(
    workspace.hasProviderPermission('property:read'),
  );
  const archiveProperty = useArchiveProviderProperty();
  const activateProperty = useActivateProviderProperty();
  const restoreProperty = useRestoreProviderProperty();
  const [lifecycleError, setLifecycleError] = useState<unknown>(null);

  const canCreate = workspace.hasProviderPermission('property:create');
  const canRead = workspace.hasProviderPermission('property:read');
  const canUpdate = workspace.hasProviderPermission('property:update');
  const canArchive = workspace.hasProviderPermission('property:archive');
  const blockedByLifecycle =
    workspace.state !== 'LOADING' && workspace.state !== 'ACTIVE_VERIFIED';
  const pendingActionFor = (propertyId: string) => {
    if (activateProperty.isPending && activateProperty.variables === propertyId)
      return 'activate';
    if (archiveProperty.isPending && archiveProperty.variables === propertyId)
      return 'archive';
    if (restoreProperty.isPending && restoreProperty.variables === propertyId)
      return 'restore';
    return null;
  };

  const runLifecycle = (
    action: 'activate' | 'archive' | 'restore',
    propertyId: string,
  ) => {
    setLifecycleError(null);
    const options = {
      onSuccess: () => setLifecycleError(null),
      onError: (error: unknown) => setLifecycleError(error),
    };
    if (action === 'activate') activateProperty.mutate(propertyId, options);
    if (action === 'archive') archiveProperty.mutate(propertyId, options);
    if (action === 'restore') restoreProperty.mutate(propertyId, options);
  };

  const lifecycleErrorMessage =
    lifecycleError instanceof ApiError && lifecycleError.status === 403
      ? t('permissionDenied')
      : lifecycleError instanceof ApiError &&
          lifecycleError.code === 'PROPERTY_ACTIVATION_INCOMPLETE'
        ? t('properties.activationIncomplete')
        : lifecycleError instanceof ApiError &&
            lifecycleError.code === 'PROPERTY_PUBLISHED_LISTING_CONFLICT'
          ? t('properties.publishedListingConflict')
          : lifecycleError instanceof ApiError &&
              lifecycleError.code === 'PROPERTY_INVALID_STATUS_TRANSITION'
            ? t('properties.invalidStatusTransition')
            : lifecycleError instanceof ApiError &&
                lifecycleError.code === 'LISTING_PROPERTY_NOT_ACTIVE'
              ? t('properties.listingPropertyNotActive')
              : t('properties.lifecycleFailed');

  return (
    <>
      <PageHeader
        title={t('properties.title')}
        description={t('properties.description')}
        actions={
          <Link
            href="/provider/properties/new"
            aria-disabled={!canCreate}
            className={`btn btn-primary ${
              canCreate ? '' : 'pointer-events-none opacity-50'
            }`}
          >
            {t('properties.new')}
          </Link>
        }
      />
      {workspace.state === 'LOADING' ? (
        <LoadingState label={t('loading')} />
      ) : blockedByLifecycle ? (
        <p className="panel px-4 py-3 text-sm text-[var(--text-muted)]">
          {t(`lifecycle.${workspace.state.toLowerCase()}`)}
        </p>
      ) : !canRead ? (
        <p
          role="alert"
          className="panel px-4 py-3 text-sm text-[var(--text-muted)]"
        >
          {t('permissionDenied')}
        </p>
      ) : properties.isLoading ? (
        <LoadingState label={t('loading')} />
      ) : properties.isError ? (
        <ErrorAlert
          message={
            properties.error instanceof ApiError &&
            properties.error.status === 403
              ? t('permissionDenied')
              : t('properties.loadFailed')
          }
          onRetry={() => properties.refetch()}
        />
      ) : (properties.data?.length ?? 0) === 0 ? (
        <EmptyState
          title={t('properties.empty')}
          className="bg-[var(--surface)]"
        />
      ) : (
        <ul className="panel divide-y divide-[var(--border-muted)] overflow-hidden">
          {(properties.data ?? []).map((estate: Estate) => (
            <li
              key={estate.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              {(() => {
                const pendingAction = pendingActionFor(estate.id);
                return (
                  <>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="truncate text-sm font-medium">
                          {estate.title}
                        </div>
                        <StatusBadge
                          status={estate.status}
                          label={t(`properties.status.${estate.status}`)}
                          size="sm"
                        />
                      </div>
                      <div className="mt-0.5 text-xs text-[var(--text-muted)]">
                        {formatPrice(estate.price, locale)} ·{' '}
                        {estate.province.name}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {canUpdate && estate.status !== 'ARCHIVED' && (
                        <Link
                          href={`/provider/properties/${estate.id}/edit`}
                          className="btn btn-secondary btn-sm"
                        >
                          {t('properties.edit')}
                        </Link>
                      )}
                      {estate.status === 'DRAFT' && canUpdate && (
                        <button
                          type="button"
                          disabled={pendingAction !== null}
                          onClick={() => runLifecycle('activate', estate.id)}
                          className="btn btn-primary btn-sm"
                        >
                          {pendingAction === 'activate'
                            ? t('properties.activating')
                            : t('properties.activate')}
                        </button>
                      )}
                      {(estate.status === 'DRAFT' ||
                        estate.status === 'ACTIVE') &&
                        canArchive && (
                          <button
                            type="button"
                            disabled={pendingAction !== null}
                            onClick={() => runLifecycle('archive', estate.id)}
                            className="btn btn-danger btn-sm"
                          >
                            {pendingAction === 'archive'
                              ? t('properties.archiving')
                              : t('properties.archive')}
                          </button>
                        )}
                      {estate.status === 'ARCHIVED' && canUpdate && (
                        <button
                          type="button"
                          disabled={pendingAction !== null}
                          onClick={() => runLifecycle('restore', estate.id)}
                          className="btn btn-primary btn-sm"
                        >
                          {pendingAction === 'restore'
                            ? t('properties.restoring')
                            : t('properties.restore')}
                        </button>
                      )}
                    </div>
                  </>
                );
              })()}
            </li>
          ))}
        </ul>
      )}
      {lifecycleError && (
        <ErrorAlert className="mt-4" message={lifecycleErrorMessage} />
      )}
    </>
  );
}
