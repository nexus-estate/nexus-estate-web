'use client';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { PageHeader } from '@/components/portal/page-header';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorAlert } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { useProviderAuthorization } from '@/features/provider/context/provider-context.hooks';
import {
  useArchiveProviderListing,
  useProviderListings,
  usePublishProviderListing,
} from '@/features/provider/supply/provider-supply.queries';
import { ApiError } from '@/lib/api/core/error';
import type { ListingStatus } from '@/lib/api/listing/listing.types';
import { FEEDBACK, notify } from '@/lib/notify';

function statusVariant(
  status: ListingStatus,
): 'success' | 'warning' | 'default' {
  if (status === 'PUBLISHED') return 'success';
  if (status === 'ARCHIVED') return 'default';
  return 'warning';
}

export default function ProviderListingsPage() {
  const locale = useLocale();
  const t = useTranslations('provider');
  const commonT = useTranslations('common');
  const workspace = useProviderAuthorization();
  const listings = useProviderListings(
    workspace.hasProviderPermission('listing:read'),
  );
  const publishListing = usePublishProviderListing();
  const archiveListing = useArchiveProviderListing();

  const canCreate = workspace.hasProviderPermission('listing:create');
  const canRead = workspace.hasProviderPermission('listing:read');
  const canPublish = workspace.hasProviderPermission('listing:publish');
  const canArchive = workspace.hasProviderPermission('listing:archive');
  const blockedByLifecycle =
    workspace.state !== 'LOADING' && workspace.state !== 'ACTIVE_VERIFIED';

  return (
    <>
      <PageHeader
        title={t('listings.title')}
        description={t('listings.description')}
        actions={
          <Link
            href="/provider/listings/new"
            aria-disabled={!canCreate}
            className={`btn btn-primary ${
              canCreate ? '' : 'pointer-events-none opacity-50'
            }`}
          >
            {t('listings.new')}
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
      ) : listings.isLoading ? (
        <LoadingState label={t('loading')} />
      ) : listings.isError ? (
        <ErrorAlert
          message={
            listings.error instanceof ApiError && listings.error.status === 403
              ? t('permissionDenied')
              : t('listings.loadFailed')
          }
          onRetry={() => listings.refetch()}
        />
      ) : (listings.data?.length ?? 0) === 0 ? (
        <EmptyState
          title={t('listings.empty')}
          className="bg-[var(--surface)]"
        />
      ) : (
        <ul className="panel divide-y divide-[var(--border-muted)] overflow-hidden">
          {(listings.data ?? []).map((listing) => (
            <li
              key={listing.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">
                  {listing.estate.title}
                </div>
                <div className="mt-0.5 text-xs text-[var(--text-muted)]">
                  {new Intl.NumberFormat(locale, {
                    style: 'currency',
                    currency: 'VND',
                    maximumFractionDigits: 0,
                  }).format(listing.estate.price)}
                </div>
              </div>
              <Badge variant={statusVariant(listing.status)}>
                {t(`listings.status.${listing.status}`)}
              </Badge>
              <div className="flex items-center gap-2">
                {listing.status === 'DRAFT' && canPublish && (
                  <button
                    type="button"
                    disabled={publishListing.isPending}
                    onClick={() =>
                      publishListing.mutate(listing.id, {
                        onSuccess: () =>
                          notify.success(commonT(FEEDBACK.published)),
                        onError: (error) =>
                          notify.apiError(
                            error,
                            commonT,
                            'listings.actionFailed',
                          ),
                      })
                    }
                    className="btn btn-secondary btn-sm"
                  >
                    {t('listings.publish')}
                  </button>
                )}
                {listing.status === 'PUBLISHED' && canArchive && (
                  <button
                    type="button"
                    disabled={archiveListing.isPending}
                    onClick={() =>
                      archiveListing.mutate(listing.id, {
                        onSuccess: () =>
                          notify.success(commonT(FEEDBACK.archived)),
                        onError: (error) =>
                          notify.apiError(
                            error,
                            commonT,
                            'listings.actionFailed',
                          ),
                      })
                    }
                    className="btn btn-danger btn-sm"
                  >
                    {t('listings.archive')}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      {(publishListing.isError || archiveListing.isError) && (
        <ErrorAlert
          className="mt-4"
          message={
            (publishListing.error instanceof ApiError &&
              publishListing.error.status === 403) ||
            (archiveListing.error instanceof ApiError &&
              archiveListing.error.status === 403)
              ? t('permissionDenied')
              : t('listings.actionFailed')
          }
        />
      )}
    </>
  );
}
