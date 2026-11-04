'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { MarketplaceIcon } from '@/components/customer/marketplace-icon';
import {
  useProviderEstateMedia,
  useProviderListings,
  useProviderProperties,
} from '@/features/provider/supply/provider-supply.queries';
import { useProviderEntryState } from '@/features/provider/use-provider-entry-state';
import type { Listing, ListingStatus } from '@/lib/api/listing/listing.types';
import { getEstateImages } from '@/lib/api/media/estate-images';
import { mediaApi } from '@/lib/api/media/media.api';

type ListingFilter = 'ALL' | ListingStatus;

function ListingCover({
  listing,
  enabled,
}: {
  listing: Listing;
  enabled: boolean;
}) {
  const media = useProviderEstateMedia(listing.estateId, enabled);
  const cover = getEstateImages(media.data ?? [], listing.estateId)[0];
  const [failed, setFailed] = useState(false);

  return (
    <span className="provider-dashboard-cover">
      {cover && !failed ? (
        <Image
          src={mediaApi.imageUrl(listing.estateId, cover.id)}
          alt=""
          fill
          unoptimized
          sizes="64px"
          className="object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <MarketplaceIcon name="images" className="h-5 w-5 text-[#7a9b8d]" />
      )}
    </span>
  );
}

function ListingIdentity({
  listing,
  mediaEnabled,
  canOpen,
}: {
  listing: Listing;
  mediaEnabled: boolean;
  canOpen: boolean;
}) {
  const content = (
    <>
      <ListingCover listing={listing} enabled={mediaEnabled} />
      <span className="min-w-0">
        <strong>{listing.estate.title}</strong>
        <small>
          <MarketplaceIcon name="pin" className="h-3 w-3 shrink-0" />
          {[
            listing.estate.addressLine,
            listing.estate.ward?.name,
            listing.estate.province?.name,
          ]
            .filter(Boolean)
            .join(', ')}
        </small>
      </span>
    </>
  );

  return canOpen ? (
    <Link
      href={`/provider/listings/${listing.id}`}
      className="provider-dashboard-listing-link"
    >
      {content}
    </Link>
  ) : (
    <span className="provider-dashboard-listing-link">{content}</span>
  );
}

export default function ProviderPage() {
  const t = useTranslations('provider');
  const locale = useLocale();
  const workspace = useProviderEntryState();
  const [filter, setFilter] = useState<ListingFilter>('ALL');
  const [search, setSearch] = useState('');
  const isActive = workspace.state === 'ACTIVE';
  const permissions = new Set(
    workspace.authorization.data?.permissions.map((item) => item.code) ?? [],
  );
  const canReadListings = isActive && permissions.has('listing:read');
  const canReadProperties = isActive && permissions.has('property:read');
  const canCreateListing = isActive && permissions.has('listing:create');
  const canCreateProperty = isActive && permissions.has('property:create');
  const listings = useProviderListings(canReadListings);
  const properties = useProviderProperties(canReadProperties);
  const allListings = listings.data ?? [];
  const published = allListings.filter(
    (listing) => listing.status === 'PUBLISHED',
  ).length;
  const drafts = allListings.filter(
    (listing) => listing.status === 'DRAFT',
  ).length;
  const sorted = [...allListings].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
  const query = search.trim().toLocaleLowerCase(locale);
  const visible = sorted
    .filter(
      (listing) =>
        (filter === 'ALL' || listing.status === filter) &&
        (!query ||
          [
            listing.estate.title,
            listing.estate.addressLine,
            listing.estate.ward?.name,
            listing.estate.province?.name,
          ].some((part) => part?.toLocaleLowerCase(locale).includes(query))),
    )
    .slice(0, 8);
  const estateStatus = new Map(
    properties.data?.map((estate) => [estate.id, estate.status]) ?? [],
  );
  const price = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  });
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'short' });

  if (workspace.state === 'LOADING') {
    return (
      <div role="status" className="provider-dashboard-message">
        {t('loading')}
      </div>
    );
  }

  if (workspace.state === 'NO_PROVIDER') {
    return (
      <div className="provider-dashboard-message">
        <h1 className="text-xl font-semibold">
          {t('overview.noProviderTitle')}
        </h1>
        <p className="mt-2 text-[var(--text-muted)]">
          {t('overview.noProviderBody')}
        </p>
        <Link
          className="provider-button provider-button-primary mt-5"
          href="/provider/onboarding"
        >
          {t('onboarding.start')}
        </Link>
      </div>
    );
  }

  if (!isActive) {
    const lifecycleKey =
      workspace.state === 'PENDING'
        ? 'pending_verification'
        : workspace.state.toLowerCase();
    return (
      <div className="provider-dashboard-message">
        <h1 className="text-xl font-semibold">{t('overview.nextStep')}</h1>
        <p className="mt-2 text-[var(--text-muted)]">
          {t(`lifecycle.${lifecycleKey}`)}
        </p>
        {workspace.state === 'ERROR' ? (
          <button
            type="button"
            className="provider-button provider-button-primary mt-5"
            onClick={() => {
              void workspace.account.refetch();
              void workspace.authorization.refetch();
            }}
          >
            {t('overview.retry')}
          </button>
        ) : (
          <Link
            className="provider-button provider-button-primary mt-5"
            href="/provider/account"
          >
            {t('nav.account')}
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="provider-dashboard space-y-5 pb-8">
      <header className="provider-dashboard-hero">
        <Image
          src="/images/hero-villa.webp"
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 1200px, 100vw"
          className="object-cover object-center"
        />
        <div className="provider-dashboard-hero-content">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#17624c]">
            Nexus Estate Provider
          </p>
          <h1 className="mt-2 text-2xl font-bold text-[#10352b] sm:text-3xl">
            {t('overview.dashboardTitle')}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#3f564c]">
            {t('overview.dashboardDescription')}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {canCreateListing && (
              <Link
                href="/provider/listings/new"
                className="provider-button provider-button-primary"
              >
                <span aria-hidden="true" className="text-lg leading-none">
                  +
                </span>
                {t('listings.newTitle')}
              </Link>
            )}
            {canCreateProperty && (
              <Link
                href="/provider/properties/new"
                className="provider-button border border-[#93b7a7] bg-white text-[#164c3b]"
              >
                <MarketplaceIcon name="building" className="h-4 w-4" />
                {t('properties.new')}
              </Link>
            )}
          </div>
        </div>
      </header>

      {(listings.isSuccess || properties.isSuccess) && (
        <section
          className="provider-dashboard-kpis"
          aria-label={t('overview.inventory')}
        >
          {listings.isSuccess && (
            <>
              <div className="provider-dashboard-kpi">
                <span className="provider-dashboard-kpi-icon">
                  <MarketplaceIcon name="grid" />
                </span>
                <span className="text-xs text-[#4d6258]">
                  {t('overview.totalListings')}
                </span>
                <strong>{allListings.length}</strong>
              </div>
              <div className="provider-dashboard-kpi">
                <span className="provider-dashboard-kpi-icon">
                  <MarketplaceIcon name="check" />
                </span>
                <span className="text-xs text-[#4d6258]">
                  {t('overview.activeListings')}
                </span>
                <strong>{published}</strong>
              </div>
              <div className="provider-dashboard-kpi">
                <span className="provider-dashboard-kpi-icon">
                  <MarketplaceIcon name="clock" />
                </span>
                <span className="text-xs text-[#4d6258]">
                  {t('overview.draftListings')}
                </span>
                <strong>{drafts}</strong>
              </div>
            </>
          )}
          {properties.isSuccess && (
            <div className="provider-dashboard-kpi">
              <span className="provider-dashboard-kpi-icon">
                <MarketplaceIcon name="building" />
              </span>
              <span className="text-xs text-[#4d6258]">
                {t('overview.totalProperties')}
              </span>
              <strong>{properties.data.length}</strong>
            </div>
          )}
        </section>
      )}

      {canReadListings && drafts > 0 && (
        <button
          type="button"
          className="provider-dashboard-task"
          onClick={() => setFilter('DRAFT')}
        >
          <MarketplaceIcon
            name="clock"
            className="h-4 w-4 shrink-0 text-[#0a7a55]"
          />
          <span>{t('overview.draftWork', { count: drafts })}</span>
          <MarketplaceIcon name="arrow" className="ml-auto h-4 w-4 shrink-0" />
        </button>
      )}

      {canReadListings && (
        <section
          className="provider-dashboard-listings"
          aria-labelledby="dashboard-listings-title"
        >
          <div className="provider-dashboard-listings-header">
            <h2
              id="dashboard-listings-title"
              className="flex items-center gap-2 text-lg font-bold text-[#14362b]"
            >
              <MarketplaceIcon name="grid" className="h-5 w-5 text-[#0a7854]" />
              {t('overview.recentListings')}
            </h2>
            <div className="flex items-center gap-3">
              <Link
                href="/provider/listings"
                className="text-sm font-semibold text-[#0a704e] hover:underline"
              >
                {t('overview.viewAll')} <span aria-hidden="true">→</span>
              </Link>
              {canCreateListing && (
                <Link
                  href="/provider/listings/new"
                  className="provider-button provider-button-primary hidden sm:inline-flex"
                >
                  <span aria-hidden="true">+</span>
                  {t('listings.newTitle')}
                </Link>
              )}
            </div>
          </div>
          <div className="provider-dashboard-tools">
            <div
              className="provider-dashboard-filters"
              role="group"
              aria-label={t('controls.status')}
            >
              {(['ALL', 'PUBLISHED', 'DRAFT', 'ARCHIVED'] as const).map(
                (value) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={filter === value}
                    className={filter === value ? 'is-active' : ''}
                    onClick={() => setFilter(value)}
                  >
                    {value === 'ALL'
                      ? t('overview.allListings', { count: allListings.length })
                      : `${t(`listings.status.${value}`)} (${allListings.filter((listing) => listing.status === value).length})`}
                  </button>
                ),
              )}
            </div>
            <label className="provider-dashboard-search">
              <MarketplaceIcon name="search" className="h-4 w-4 shrink-0" />
              <span className="sr-only">{t('overview.searchListings')}</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t('overview.searchListings')}
              />
            </label>
          </div>
          {listings.isLoading ? (
            <p role="status" className="provider-dashboard-empty">
              {t('loading')}
            </p>
          ) : listings.isError ? (
            <div role="alert" className="provider-dashboard-empty">
              <p>{t('listings.loadFailed')}</p>
              <button
                type="button"
                className="mt-3 text-[#0a704e] underline"
                onClick={() => void listings.refetch()}
              >
                {t('controls.refresh')}
              </button>
            </div>
          ) : visible.length === 0 ? (
            <p className="provider-dashboard-empty">
              {search || filter !== 'ALL'
                ? t('controls.noResults')
                : t('listings.empty')}
            </p>
          ) : (
            <div className="provider-dashboard-table-wrap">
              <table className="provider-dashboard-table">
                <thead>
                  <tr>
                    <th>{t('nav.listings')}</th>
                    <th>{t('properties.fields.type')}</th>
                    <th>{t('properties.fields.price')}</th>
                    <th>{t('controls.status')}</th>
                    <th>{t('listingDetail.updatedAt')}</th>
                    {canReadProperties && <th>{t('overview.action')}</th>}
                  </tr>
                </thead>
                <tbody>
                  {visible.map((listing) => (
                    <tr key={listing.id}>
                      <td data-label={t('nav.listings')}>
                        <ListingIdentity
                          listing={listing}
                          canOpen={canReadProperties}
                          mediaEnabled={
                            listing.status === 'PUBLISHED' ||
                            (canReadProperties &&
                              estateStatus.get(listing.estateId) === 'ACTIVE')
                          }
                        />
                      </td>
                      <td data-label={t('properties.fields.type')}>
                        {t(`properties.types.${listing.estate.type}`)}
                      </td>
                      <td
                        data-label={t('properties.fields.price')}
                        className="provider-dashboard-price"
                      >
                        {price.format(listing.estate.price)}
                      </td>
                      <td data-label={t('controls.status')}>
                        <span
                          className={`provider-dashboard-badge provider-dashboard-badge-${listing.status.toLowerCase()}`}
                        >
                          {t(`listings.status.${listing.status}`)}
                        </span>
                      </td>
                      <td
                        data-label={t('listingDetail.updatedAt')}
                        className="whitespace-nowrap"
                      >
                        {date.format(new Date(listing.updatedAt))}
                      </td>
                      {canReadProperties && (
                        <td
                          data-label={t('overview.action')}
                          className="provider-dashboard-action-cell"
                        >
                          <Link
                            href={`/provider/listings/${listing.id}`}
                            className="provider-dashboard-view"
                            aria-label={`${t('listingDetail.view')}: ${listing.estate.title}`}
                            title={t('listingDetail.view')}
                          >
                            <MarketplaceIcon name="arrow" className="h-4 w-4" />
                          </Link>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {sorted.length > 8 && (
            <div className="border-t border-[#e6ece8] px-5 py-3 text-right">
              <Link
                href="/provider/listings"
                className="text-sm font-semibold text-[#0a704e] hover:underline"
              >
                {t('overview.viewAll')} →
              </Link>
            </div>
          )}
        </section>
      )}
      {!canReadListings && (
        <div role="status" className="provider-dashboard-message">
          {t('permissionDenied')}
        </div>
      )}
    </div>
  );
}
