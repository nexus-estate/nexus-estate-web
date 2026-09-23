'use client';
import { useState } from 'react';
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
  const [actionError, setActionError] = useState<unknown>(null);

  const canCreate = workspace.hasProviderPermission('listing:create');
  const canRead = workspace.hasProviderPermission('listing:read');
  const canPublish = workspace.hasProviderPermission('listing:publish');
  const canArchive = workspace.hasProviderPermission('listing:archive');
  const blockedByLifecycle =
    workspace.state !== 'LOADING' && workspace.state !== 'ACTIVE_VERIFIED';
  const actionErrorMessage =
    actionError instanceof ApiError && actionError.status === 403
      ? t('permissionDenied')
      : actionError instanceof ApiError &&
          actionError.code === 'LISTING_PROPERTY_NOT_ACTIVE'
        ? t('listings.propertyNotActive')
        : t('listings.actionFailed');

  const pendingActionFor = (listingId: string) => {
    if (publishListing.isPending && publishListing.variables === listingId)
      return 'publish';
    if (archiveListing.isPending && archiveListing.variables === listingId)
      return 'archive';
    return null;
  };

  const runAction = (action: 'publish' | 'archive', listingId: string) => {
    setActionError(null);
    const options = {
      onSuccess: () => {
        setActionError(null);
        notify.success(
          commonT(
            action === 'publish' ? FEEDBACK.published : FEEDBACK.archived,
          ),
        );
      },
      onError: (error: unknown) => setActionError(error),
    };
    if (action === 'publish') publishListing.mutate(listingId, options);
    else archiveListing.mutate(listingId, options);
  };

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
              {(() => {
                const pendingAction = pendingActionFor(listing.id);
                return (
                  <>
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
                          disabled={pendingAction !== null}
                          onClick={() => runAction('publish', listing.id)}
                          className="btn btn-secondary btn-sm"
                        >
                          {pendingAction === 'publish'
                            ? t('listings.publishing')
                            : t('listings.publish')}
                        </button>
                      )}
                      {listing.status === 'PUBLISHED' && canArchive && (
                        <button
                          type="button"
                          disabled={pendingAction !== null}
                          onClick={() => runAction('archive', listing.id)}
                          className="btn btn-danger btn-sm"
                        >
                          {pendingAction === 'archive'
                            ? t('listings.archiving')
                            : t('listings.archive')}
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
      {actionError && (
        <ErrorAlert className="mt-4" message={actionErrorMessage} />
      )}
    </>
  );
}
