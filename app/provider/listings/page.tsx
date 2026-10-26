'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { CollectionToolbar } from '@/components/portal/collection-toolbar';
import { PageHeader } from '@/components/portal/page-header';
import { PromotionDurationField } from '@/components/provider/listing/promotion-duration-field';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useProviderAuthorization } from '@/features/provider/context/provider-context.hooks';
import {
  useArchiveProviderListing,
  useCreateListingBanner,
  useProviderListings,
  usePublishProviderListing,
} from '@/features/provider/supply/provider-supply.queries';
import { ApiError } from '@/lib/api/core/error';
import type { ListingStatus } from '@/lib/api/listing/listing.types';
import { parseDurationDays } from '@/lib/api/promotion/promotion.validation';

function statusTone(status: ListingStatus) {
  if (status === 'PUBLISHED') return 'text-[var(--primary)]';
  if (status === 'ARCHIVED') return 'text-[var(--text-subtle)]';
  return 'text-[var(--text-muted)]';
}

export default function ProviderListingsPage() {
  const locale = useLocale();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const t = useTranslations('provider');
  const workspace = useProviderAuthorization();
  const listings = useProviderListings(
    workspace.hasProviderPermission('listing:read'),
  );
  const publishListing = usePublishProviderListing();
  const archiveListing = useArchiveProviderListing();
  const createBanner = useCreateListingBanner();
  const [actionError, setActionError] = useState<unknown>(null);
  const [bannerListingId, setBannerListingId] = useState<string | null>(null);
  const [promotionId, setPromotionId] = useState('');
  const [durationDays, setDurationDays] = useState('7');
  const [durationError, setDurationError] = useState(false);

  const canCreate = workspace.hasProviderPermission('listing:create');
  const canRead = workspace.hasProviderPermission('listing:read');
  const canPublish = workspace.hasProviderPermission('listing:publish');
  const canArchive = workspace.hasProviderPermission('listing:archive');
  const canCreateBanner = canPublish;
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
      onSuccess: () => setActionError(null),
      onError: (error: unknown) => setActionError(error),
    };
    if (action === 'publish') publishListing.mutate(listingId, options);
    else archiveListing.mutate(listingId, options);
  };

  const openBanner = (listingId: string) => {
    setActionError(null);
    setBannerListingId(listingId);
    setPromotionId('');
    setDurationDays('7');
    setDurationError(false);
  };

  const submitBanner = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!bannerListingId) return;
    setActionError(null);
    const days = parseDurationDays(durationDays);
    setDurationError(days === null);
    if (days === null) return;
    createBanner.mutate(
      {
        listingId: bannerListingId,
        data: {
          promotionId: promotionId.trim(),
          durationDays: days,
        },
      },
      {
        onSuccess: () => setBannerListingId(null),
        onError: (error: unknown) => setActionError(error),
      },
    );
  };

  const filtered = (listings.data ?? []).filter(
    (item) =>
      (!statusFilter || item.status === statusFilter) &&
      item.estate.title
        .toLocaleLowerCase(locale)
        .includes(query.trim().toLocaleLowerCase(locale)),
  );

  return (
    <>
      <PageHeader
        title={t('listings.title')}
        description={t('listings.description')}
        actions={
          <Link
            href="/provider/listings/new"
            aria-disabled={!canCreate}
            tabIndex={canCreate ? undefined : -1}
            className={`provider-button provider-button-primary ${
              canCreate ? 'hover:opacity-90' : 'pointer-events-none opacity-50'
            }`}
          >
            {t('listings.new')}
          </Link>
        }
      />
      {canRead && (
        <CollectionToolbar
          query={query}
          onQuery={setQuery}
          status={statusFilter}
          onStatus={setStatusFilter}
          statuses={['DRAFT', 'PUBLISHED', 'ARCHIVED'].map((value) => ({
            value,
            label: t(`listings.status.${value}`),
          }))}
          onRefresh={() => void listings.refetch()}
          refreshing={listings.isFetching}
        />
      )}
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
      ) : filtered.length === 0 ? (
        <div className="border border-[var(--border)] bg-[var(--surface)] px-6 py-16 text-center text-sm text-[var(--text-muted)]">
          {query || statusFilter
            ? t('controls.noResults')
            : t('listings.empty')}
        </div>
      ) : (
        <ul className="divide-y divide-[var(--border-muted)] border border-[var(--border)] bg-[var(--surface)]">
          {filtered.map((listing) => (
            <li
              key={listing.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              {(() => {
                const pendingAction = pendingActionFor(listing.id);
                return (
                  <>
                    <div className="min-w-0">
                      <Link
                        href={`/provider/listings/${listing.id}`}
                        className="block truncate text-sm font-semibold text-[var(--primary)] hover:underline"
                      >
                        {listing.estate.title}
                      </Link>
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
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/provider/listings/${listing.id}`}
                        className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-semibold text-[var(--primary)] transition-colors hover:border-[var(--primary)] hover:bg-[var(--primary-soft)]"
                      >
                        {t('listingDetail.view')}
                      </Link>
                      {listing.status === 'DRAFT' && canPublish && (
                        <button
                          type="button"
                          disabled={pendingAction !== null}
                          onClick={() => runAction('publish', listing.id)}
                          className="rounded-lg border border-[var(--primary)] px-3 py-2 text-xs font-semibold text-[var(--primary)] transition-colors hover:bg-[var(--primary-soft)] disabled:opacity-50"
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
                          className="rounded-lg border border-[var(--danger)] px-3 py-2 text-xs font-semibold text-[var(--danger)] transition-colors hover:bg-[var(--danger-soft)] disabled:opacity-50"
                        >
                          {pendingAction === 'archive'
                            ? t('listings.archiving')
                            : t('listings.archive')}
                        </button>
                      )}
                      {listing.status === 'PUBLISHED' && canCreateBanner && (
                        <button
                          type="button"
                          onClick={() => openBanner(listing.id)}
                          className="rounded-lg border border-[var(--brand-accent)] px-3 py-2 text-xs font-semibold text-[var(--brand-accent)] transition-colors hover:bg-[var(--brand-accent-soft)]"
                        >
                          {t('listings.createBanner')}
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
        <p role="alert" className="mt-4 text-sm text-[var(--danger)]">
          {actionErrorMessage}
        </p>
      )}
      <Modal
        isOpen={bannerListingId !== null}
        onClose={() => setBannerListingId(null)}
        title={t('listings.bannerTitle')}
        footer={
          <>
            <Button
              variant="ghost"
              type="button"
              onClick={() => setBannerListingId(null)}
            >
              {t('listings.cancel')}
            </Button>
            <Button
              form="create-banner-form"
              type="submit"
              loading={createBanner.isPending}
            >
              {createBanner.isPending
                ? t('listings.bannerSubmitting')
                : t('listings.createBanner')}
            </Button>
          </>
        }
      >
        <form
          id="create-banner-form"
          className="space-y-4"
          onSubmit={submitBanner}
        >
          <p className="text-sm leading-6 text-[var(--text-muted)]">
            {t('listings.bannerDescription')}
          </p>
          <Input
            label={t('listings.fields.promotionId')}
            value={promotionId}
            onChange={(event) => setPromotionId(event.target.value)}
            placeholder={t('listings.fields.promotionIdPlaceholder')}
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
          {actionError !== null && (
            <p role="alert" className="text-sm text-[var(--danger)]">
              {t('listings.bannerFailed')}
            </p>
          )}
        </form>
      </Modal>
    </>
  );
}
