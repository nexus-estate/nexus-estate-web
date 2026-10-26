'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { PromotionDurationField } from '@/components/provider/listing/promotion-duration-field';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useProviderAuthorization } from '@/features/provider/context/provider-context.hooks';
import {
  useArchiveProviderListing,
  useCreateListingBanner,
  usePublishProviderListing,
} from '@/features/provider/supply/provider-supply.queries';
import { ApiError } from '@/lib/api/core/error';
import type { Listing } from '@/lib/api/listing/listing.types';
import { parseDurationDays } from '@/lib/api/promotion/promotion.validation';

export function ListingActions({ listing }: { listing: Listing }) {
  const t = useTranslations('provider');
  const workspace = useProviderAuthorization();
  const publish = usePublishProviderListing();
  const archive = useArchiveProviderListing();
  const banner = useCreateListingBanner();
  const [bannerOpen, setBannerOpen] = useState(false);
  const [promotionId, setPromotionId] = useState('');
  const [durationDays, setDurationDays] = useState('7');
  const [durationError, setDurationError] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const busy = publish.isPending || archive.isPending || banner.isPending;
  const canPublish = workspace.hasProviderPermission('listing:publish');
  const canArchive = workspace.hasProviderPermission('listing:archive');
  const errorText =
    error instanceof ApiError && error.status === 403
      ? t('permissionDenied')
      : error instanceof ApiError &&
          error.code === 'LISTING_PROPERTY_NOT_ACTIVE'
        ? t('listings.propertyNotActive')
        : t('listings.actionFailed');
  const run = (action: 'publish' | 'archive') => {
    setError(null);
    const options = { onError: (cause: unknown) => setError(cause) };
    if (action === 'publish') publish.mutate(listing.id, options);
    else archive.mutate(listing.id, options);
  };
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {listing.status === 'DRAFT' && canPublish && (
          <Button
            type="button"
            loading={publish.isPending}
            disabled={busy}
            onClick={() => run('publish')}
          >
            {publish.isPending
              ? t('listings.publishing')
              : t('listings.publish')}
          </Button>
        )}
        {listing.status === 'PUBLISHED' && canArchive && (
          <Button
            type="button"
            variant="outline"
            loading={archive.isPending}
            disabled={busy}
            onClick={() => run('archive')}
          >
            {archive.isPending
              ? t('listings.archiving')
              : t('listings.archive')}
          </Button>
        )}
        {listing.status === 'PUBLISHED' && canPublish && (
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => {
              setError(null);
              setDurationDays('7');
              setDurationError(false);
              setBannerOpen(true);
            }}
          >
            {t('listings.createBanner')}
          </Button>
        )}
      </div>
      {error !== null && !bannerOpen && (
        <p role="alert" className="text-sm text-[var(--danger)]">
          {errorText}
        </p>
      )}
      <Modal
        isOpen={bannerOpen}
        onClose={() => setBannerOpen(false)}
        title={t('listings.bannerTitle')}
        footer={
          <>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setBannerOpen(false)}
            >
              {t('listings.cancel')}
            </Button>
            <Button
              type="submit"
              form={`banner-${listing.id}`}
              loading={banner.isPending}
            >
              {t('listings.createBanner')}
            </Button>
          </>
        }
      >
        <form
          id={`banner-${listing.id}`}
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            setError(null);
            const days = parseDurationDays(durationDays);
            setDurationError(days === null);
            if (days === null) return;
            banner.mutate(
              {
                listingId: listing.id,
                data: {
                  promotionId: promotionId.trim(),
                  durationDays: days,
                },
              },
              {
                onSuccess: () => setBannerOpen(false),
                onError: (cause) => setError(cause),
              },
            );
          }}
        >
          <p className="text-sm leading-6 text-[var(--text-muted)]">
            {t('listings.bannerDescription')}
          </p>
          <Input
            label={t('listings.fields.promotionId')}
            value={promotionId}
            onChange={(e) => setPromotionId(e.target.value)}
            required
          />
          <PromotionDurationField
            value={durationDays}
            onChange={(value) => {
              setDurationDays(value);
              setDurationError(false);
            }}
            error={durationError}
          />
          {error !== null && (
            <p role="alert" className="text-sm text-[var(--danger)]">
              {t('listings.bannerFailed')}
            </p>
          )}
        </form>
      </Modal>
    </div>
  );
}
