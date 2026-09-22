'use client';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { PageHeader } from '@/components/portal/page-header';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorAlert } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { useProviderAuthorization } from '@/features/provider/context/provider-context.hooks';
import {
  useArchiveProviderProperty,
  useActivateProviderProperty,
  useProviderProperties,
} from '@/features/provider/supply/provider-supply.queries';
import { ApiError } from '@/lib/api/core/error';
import type { Estate } from '@/lib/api/estate/estate.types';
import { FEEDBACK, notify } from '@/lib/notify';

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
  const commonT = useTranslations('common');
  const workspace = useProviderAuthorization();
  const properties = useProviderProperties(
    workspace.hasProviderPermission('property:read'),
  );
  const archiveProperty = useArchiveProviderProperty();
  const activateProperty = useActivateProviderProperty();

  const canCreate = workspace.hasProviderPermission('property:create');
  const canRead = workspace.hasProviderPermission('property:read');
  const canUpdate = workspace.hasProviderPermission('property:update');
  const canArchive = workspace.hasProviderPermission('property:archive');
  const blockedByLifecycle =
    workspace.state !== 'LOADING' && workspace.state !== 'ACTIVE_VERIFIED';

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
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">
                  {estate.title}
                </div>
                <div className="mt-0.5 text-xs text-[var(--text-muted)]">
                  {formatPrice(estate.price, locale)} · {estate.province.name}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {canUpdate && (
                  <Link
                    href={`/provider/properties/${estate.id}/edit`}
                    className="btn btn-secondary btn-sm"
                  >
                    {t('properties.edit')}
                  </Link>
                )}
                {canUpdate && estate.status === 'DRAFT' && (
                  <button
                    type="button"
                    disabled={activateProperty.isPending}
                    onClick={() => activateProperty.mutate(estate.id)}
                    className="btn btn-primary btn-sm"
                  >
                    {t('properties.activate')}
                  </button>
                )}
                {canArchive && (
                  <button
                    type="button"
                    disabled={archiveProperty.isPending}
                    onClick={() =>
                      archiveProperty.mutate(estate.id, {
                        onSuccess: () =>
                          notify.success(commonT(FEEDBACK.archived)),
                        onError: (error) =>
                          notify.apiError(
                            error,
                            commonT,
                            'properties.archiveFailed',
                          ),
                      })
                    }
                    className="btn btn-danger btn-sm"
                  >
                    {t('properties.archive')}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      {archiveProperty.isError && (
        <ErrorAlert
          className="mt-4"
          message={
            archiveProperty.error instanceof ApiError &&
            archiveProperty.error.status === 403
              ? t('permissionDenied')
              : t('properties.archiveFailed')
          }
        />
      )}
    </>
  );
}
