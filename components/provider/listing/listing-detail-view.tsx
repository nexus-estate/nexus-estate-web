'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { MarketplaceIcon } from '@/components/customer/marketplace-icon';
import { EstateGallery } from '@/components/shared/estate-gallery';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useProviderAuthorization } from '@/features/provider/context/provider-context.hooks';
import { useProviderEstateMedia } from '@/features/provider/supply/provider-supply.queries';
import type { Estate } from '@/lib/api/estate/estate.types';
import type { Listing } from '@/lib/api/listing/listing.types';
import { getMarketplaceUrl } from '@/lib/platform/urls';
import { ListingActions } from './listing-actions';

type DetailTab = 'details' | 'description' | 'location';

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="provider-detail-row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export function ListingDetailView({
  listing,
  estate,
}: {
  listing: Listing;
  estate: Estate;
}) {
  const t = useTranslations('provider');
  const locale = useLocale();
  const [tab, setTab] = useState<DetailTab>('details');
  const workspace = useProviderAuthorization();
  const canReadEstate = workspace.hasProviderPermission('property:read');
  const canUpdateEstate = workspace.hasProviderPermission('property:update');
  const media = useProviderEstateMedia(
    estate.id,
    canReadEstate && estate.status === 'ACTIVE',
  );
  const address = [estate.addressLine, estate.ward.name, estate.province.name]
    .filter(Boolean)
    .join(', ');
  const formatDate = (value: string) =>
    new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(
      new Date(value),
    );
  let marketplaceUrl: string | null = null;
  if (listing.status === 'PUBLISHED') {
    try {
      marketplaceUrl = getMarketplaceUrl(`/properties/${listing.id}`);
    } catch {
      marketplaceUrl = null;
    }
  }
  const facts = [
    estate.area !== null && {
      icon: 'area' as const,
      label: t('properties.fields.area'),
      value: `${estate.area} m²`,
    },
    estate.bedrooms !== null && {
      icon: 'bed' as const,
      label: t('properties.fields.bedrooms'),
      value: estate.bedrooms,
    },
    estate.bathrooms !== null && {
      icon: 'bath' as const,
      label: t('properties.fields.bathrooms'),
      value: estate.bathrooms,
    },
    {
      icon: 'building' as const,
      label: t('properties.fields.type'),
      value: t(`properties.types.${estate.type}`),
    },
    {
      icon: 'tag' as const,
      label: t('properties.fields.purpose'),
      value: t(`properties.purposes.${estate.purpose}`),
    },
  ].filter(Boolean) as Array<{
    icon: 'area' | 'bed' | 'bath' | 'building' | 'tag';
    label: string;
    value: React.ReactNode;
  }>;

  return (
    <div className="provider-detail-page space-y-5 pb-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[2rem] font-bold leading-tight tracking-[-0.03em] text-[#102c2b]">
            {t('listingDetail.title')}
          </h1>
          <p className="mt-1 text-sm text-[#657570]">
            {t('listingDetail.description')}
          </p>
        </div>
      </header>

      <div className="grid items-start gap-7 xl:grid-cols-[minmax(0,1fr)_25rem]">
        <main className="min-w-0 space-y-5">
          <section className="provider-detail-panel p-3 sm:p-4">
            {estate.status === 'ACTIVE' ? (
              <EstateGallery
                key={estate.id}
                estateId={estate.id}
                title={estate.title}
                media={media.data}
                loading={media.isLoading}
                error={media.isError}
                onRetry={() => void media.refetch()}
                provider
              />
            ) : (
              <div className="flex min-h-64 items-center justify-center rounded-lg border border-dashed border-[#cddbd5] bg-[#f3f7f5] p-6 text-center text-sm text-[#657570]">
                {t('listingDetail.privateMediaUnavailable')}
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#dff2e8] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#08704e]">
                {t(`properties.types.${estate.type}`)}
              </span>
              <StatusBadge
                status={listing.status}
                size="sm"
                label={t(`listings.status.${listing.status}`)}
              />
            </div>
            <h2 className="mt-2 text-[1.65rem] font-bold leading-tight text-[#102c2b] sm:text-[2rem]">
              {estate.title}
            </h2>
            <p className="mt-2 flex items-start gap-2 text-sm text-[#3d4f49]">
              <MarketplaceIcon
                name="pin"
                className="mt-0.5 h-4 w-4 shrink-0 text-[#08704e]"
              />
              <span>{address}</span>
            </p>
            <p className="mt-3 text-[1.45rem] font-bold text-[#087b55] sm:text-[1.7rem]">
              {new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: 'VND',
                maximumFractionDigits: 0,
              }).format(estate.price)}
            </p>
          </section>

          <section className="grid grid-cols-2 border-y border-[#dce5e2] py-2 sm:grid-cols-5">
            {facts.map((fact) => (
              <div key={fact.label} className="provider-detail-fact">
                <MarketplaceIcon
                  name={fact.icon}
                  className="provider-detail-fact-icon h-5 w-5 shrink-0"
                />
                <div className="min-w-0">
                  <div className="provider-detail-fact-value truncate">
                    {fact.value}
                  </div>
                  <div className="provider-detail-fact-label truncate">
                    {fact.label}
                  </div>
                </div>
              </div>
            ))}
          </section>

          <section className="pt-1">
            <div className="provider-detail-tabs" role="tablist">
              {(['details', 'description', 'location'] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  role="tab"
                  aria-selected={tab === item}
                  className={`provider-detail-tab ${tab === item ? 'provider-detail-tab-active' : ''}`}
                  onClick={() => setTab(item)}
                >
                  {t(`listingDetail.sections.${item}`)}
                </button>
              ))}
            </div>
            <div className="pt-4">
              {tab === 'details' && (
                <dl className="grid gap-x-8 sm:grid-cols-2">
                  <DetailRow
                    label={t('listingDetail.estateId')}
                    value={estate.id}
                  />
                  <DetailRow
                    label={t('properties.fields.type')}
                    value={t(`properties.types.${estate.type}`)}
                  />
                  <DetailRow
                    label={t('properties.fields.purpose')}
                    value={t(`properties.purposes.${estate.purpose}`)}
                  />
                  {estate.area !== null && (
                    <DetailRow
                      label={t('properties.fields.area')}
                      value={`${estate.area} m²`}
                    />
                  )}
                  {estate.bedrooms !== null && (
                    <DetailRow
                      label={t('properties.fields.bedrooms')}
                      value={estate.bedrooms}
                    />
                  )}
                  {estate.bathrooms !== null && (
                    <DetailRow
                      label={t('properties.fields.bathrooms')}
                      value={estate.bathrooms}
                    />
                  )}
                  {estate.floors !== null && (
                    <DetailRow
                      label={t('listingDetail.floors')}
                      value={estate.floors}
                    />
                  )}
                  <DetailRow
                    label={t('listingDetail.estateStatus')}
                    value={t(`properties.status.${estate.status}`)}
                  />
                </dl>
              )}
              {tab === 'description' && (
                <p className="whitespace-pre-line text-sm leading-7 text-[#51635d]">
                  {estate.description?.trim() ||
                    t('listingDetail.noDescription')}
                </p>
              )}
              {tab === 'location' && (
                <div className="space-y-3 text-sm leading-7 text-[#51635d]">
                  <p>{address}</p>
                  {estate.latitude !== null && estate.longitude !== null && (
                    <p>
                      {t('listingDetail.coordinates')}: {estate.latitude},{' '}
                      {estate.longitude}
                    </p>
                  )}
                </div>
              )}
            </div>
          </section>
        </main>

        <aside className="space-y-5 xl:sticky xl:top-20">
          <section className="provider-detail-panel p-5">
            <div className="flex items-center justify-between gap-3 border-b border-[#e1e9e5] pb-4">
              <h2 className="flex items-center gap-2 text-lg font-bold text-[#102c2b]">
                <span className="text-[#08704e]">◈</span>
                {t('listingDetail.sidebarInfo')}
              </h2>
              <StatusBadge
                status={listing.status}
                size="sm"
                label={t(`listings.status.${listing.status}`)}
              />
            </div>
            <dl className="mt-2">
              <DetailRow
                label={t('listingDetail.listingId')}
                value={listing.id}
              />
              <DetailRow
                label={t('listingDetail.estateId')}
                value={listing.estateId}
              />
              <DetailRow
                label={t('listingDetail.createdAt')}
                value={formatDate(listing.createdAt)}
              />
              <DetailRow
                label={t('listingDetail.updatedAt')}
                value={formatDate(listing.updatedAt)}
              />
              {listing.publishedAt && (
                <DetailRow
                  label={t('listingDetail.publishedAt')}
                  value={formatDate(listing.publishedAt)}
                />
              )}
            </dl>
            <div className="mt-5 border-t border-[#e1e9e5] pt-5">
              <ListingActions listing={listing} />
            </div>
          </section>

          <section className="provider-detail-panel p-5">
            <h2 className="flex items-center gap-2 text-lg font-bold text-[#102c2b]">
              <span className="text-[#08704e]">↗</span>
              {t('listingDetail.links')}
            </h2>
            <div className="mt-4 space-y-2 border-t border-[#e1e9e5] pt-3 text-sm">
              <Link
                href="/provider/properties"
                className="flex items-center justify-between rounded-lg border border-[#dce5e2] bg-[#f7faf8] px-3 py-3 font-semibold text-[#205047] hover:border-[#9ccbb6]"
              >
                <span>
                  {t('listingDetail.viewEstate')}
                  <br />
                  <small className="font-normal text-[#667a72]">
                    {estate.id} · {estate.title}
                  </small>
                </span>
                <span aria-hidden="true">↗</span>
              </Link>
              {canUpdateEstate && (
                <Link
                  href={`/provider/properties/${estate.id}/edit`}
                  className="block rounded-lg border border-[#dce5e2] bg-[#f7faf8] px-3 py-3 font-semibold text-[#205047] hover:border-[#9ccbb6]"
                >
                  {t('listingDetail.editEstate')}
                </Link>
              )}
              {marketplaceUrl && (
                <a
                  href={marketplaceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-lg border border-[#dce5e2] bg-[#f7faf8] px-3 py-3 font-semibold text-[#205047] hover:border-[#9ccbb6]"
                >
                  {t('listingDetail.viewMarketplace')}{' '}
                  <span aria-hidden="true">↗</span>
                </a>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
