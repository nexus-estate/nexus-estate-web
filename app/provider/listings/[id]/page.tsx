'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/portal/page-header';
import { ListingEstateSummary } from '@/components/provider/listing/listing-estate-summary';
import { ListingOverview } from '@/components/provider/listing/listing-overview';
import { Button } from '@/components/ui/Button';
import { useProviderAuthorization } from '@/features/provider/context/provider-context.hooks';
import {
  useProviderListing,
  useProviderProperty,
} from '@/features/provider/supply/provider-supply.queries';
import { ApiError } from '@/lib/api/core/error';

export default function ProviderListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const t = useTranslations('provider');
  const workspace = useProviderAuthorization();
  const canRead = workspace.hasProviderPermission('listing:read');
  const canReadEstate = workspace.hasProviderPermission('property:read');
  const listing = useProviderListing(id, canRead);
  const estateId = listing.data?.estateId ?? '';
  const estate = useProviderProperty(
    estateId,
    canRead && canReadEstate && Boolean(estateId),
  );
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={t('listingDetail.title')}
        description={t('listingDetail.description')}
        actions={
          <Link
            href="/provider/listings"
            className="app-button app-button-secondary"
          >
            {t('listingDetail.back')}
          </Link>
        }
      />
      {workspace.state === 'LOADING' ? (
        <p role="status">{t('loading')}</p>
      ) : workspace.state !== 'ACTIVE_VERIFIED' ? (
        <p role="alert" className="text-sm text-[var(--text-muted)]">
          {t(`lifecycle.${workspace.state.toLowerCase()}`)}
        </p>
      ) : !canRead ? (
        <p role="alert">{t('permissionDenied')}</p>
      ) : listing.isLoading ? (
        <div
          role="status"
          aria-label={t('loading')}
          className="skeleton h-44"
        />
      ) : listing.isError ? (
        <div role="alert" className="space-y-3">
          <p>
            {listing.error instanceof ApiError && listing.error.status === 403
              ? t('permissionDenied')
              : t('listings.loadFailed')}
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => void listing.refetch()}
          >
            {t('controls.refresh')}
          </Button>
        </div>
      ) : !listing.data ? (
        <p role="alert">{t('listingDetail.notFound')}</p>
      ) : (
        <>
          <ListingOverview listing={listing.data} />
          {!canReadEstate ? (
            <p role="alert" className="mt-6">
              {t('listingDetail.estatePermissionDenied')}
            </p>
          ) : estate.isLoading ? (
            <div
              role="status"
              aria-label={t('listingDetail.estateLoading')}
              className="skeleton mt-7 h-64"
            />
          ) : estate.isError || !estate.data ? (
            <div role="alert" className="mt-7 space-y-3">
              <p className="text-sm text-[var(--text-muted)]">
                {estate.error instanceof ApiError && estate.error.status === 403
                  ? t('permissionDenied')
                  : (estate.error instanceof ApiError &&
                        estate.error.status === 404) ||
                      (!estate.data && !estate.isError)
                    ? t('listingDetail.estateMissing')
                    : t('properties.loadFailed')}
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => void estate.refetch()}
              >
                {t('controls.refresh')}
              </Button>
            </div>
          ) : (
            <ListingEstateSummary key={estateId} estate={estate.data} />
          )}
        </>
      )}
    </div>
  );
}
