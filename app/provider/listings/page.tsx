'use client';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { PageHeader } from '@/components/portal/page-header';
import { useProviderAuthorization } from '@/features/provider/context/provider-context.hooks';
import {
  useArchiveProviderListing,
  useProviderListings,
  usePublishProviderListing,
} from '@/features/provider/supply/provider-supply.queries';
import { ApiError } from '@/lib/api/core/error';
import type { ListingStatus } from '@/lib/api/listing/listing.types';

function statusTone(status: ListingStatus) {
  if (status === 'PUBLISHED') return 'text-[var(--primary)]';
  if (status === 'ARCHIVED') return 'text-[var(--text-subtle)]';
  return 'text-[var(--text-muted)]';
}

export default function ProviderListingsPage() {
  const locale = useLocale();
  const t = useTranslations('provider');
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
  const actionError = publishListing.error ?? archiveListing.error;
  const actionErrorMessage =
    actionError instanceof ApiError && actionError.status === 403
      ? t('permissionDenied')
      : actionError instanceof ApiError &&
          actionError.code === 'LISTING_PROPERTY_NOT_ACTIVE'
        ? t('listings.propertyNotActive')
        : t('listings.actionFailed');

  return (
    <>
      <PageHeader
        title={t('listings.title')}
        description={t('listings.description')}
        actions={
          <Link
            href="/provider/listings/new"
            aria-disabled={!canCreate}
            className={`inline-flex bg-[var(--primary)] px-4 py-2 text-sm text-white ${
              canCreate ? 'hover:opacity-90' : 'pointer-events-none opacity-50'
            }`}
          >
            {t('listings.new')}
          </Link>
        }
      />
      {workspace.state === 'LOADING' ? (
        <p className="text-sm text-[var(--text-muted)]">{t('loading')}</p>
      ) : blockedByLifecycle ? (
        <p className="border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text-muted)]">
          {t(`lifecycle.${workspace.state.toLowerCase()}`)}
        </p>
      ) : !canRead ? (
        <p
          role="alert"
          className="border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text-muted)]"
        >
          {t('permissionDenied')}
        </p>
      ) : listings.isLoading ? (
        <p className="text-sm text-[var(--text-muted)]">{t('loading')}</p>
      ) : listings.isError ? (
        <p role="alert" className="text-sm text-[var(--danger)]">
          {listings.error instanceof ApiError && listings.error.status === 403
            ? t('permissionDenied')
            : t('listings.loadFailed')}
        </p>
      ) : (listings.data?.length ?? 0) === 0 ? (
        <div className="border border-[var(--border)] bg-[var(--surface)] px-6 py-16 text-center text-sm text-[var(--text-muted)]">
          {t('listings.empty')}
        </div>
      ) : (
        <ul className="divide-y divide-[var(--border-muted)] border border-[var(--border)] bg-[var(--surface)]">
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
              <span
                className={`text-xs font-semibold uppercase tracking-wide ${statusTone(listing.status)}`}
              >
                {t(`listings.status.${listing.status}`)}
              </span>
              <div className="flex items-center gap-2">
                {listing.status === 'DRAFT' && canPublish && (
                  <button
                    type="button"
                    disabled={publishListing.isPending}
                    onClick={() => publishListing.mutate(listing.id)}
                    className="border border-[var(--primary)] px-3 py-1.5 text-xs font-medium text-[var(--primary)] disabled:opacity-50"
                  >
                    {t('listings.publish')}
                  </button>
                )}
                {listing.status === 'PUBLISHED' && canArchive && (
                  <button
                    type="button"
                    disabled={archiveListing.isPending}
                    onClick={() => archiveListing.mutate(listing.id)}
                    className="border border-[var(--danger)] px-3 py-1.5 text-xs font-medium text-[var(--danger)] disabled:opacity-50"
                  >
                    {t('listings.archive')}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      {actionError && (
        <p role="alert" className="mt-4 text-sm text-[var(--danger)]">
          {actionErrorMessage}
        </p>
      )}
    </>
  );
}
