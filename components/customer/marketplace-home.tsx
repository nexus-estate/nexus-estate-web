'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { estateApi } from '@/lib/api/estate/estate.api';
import type { EstateType } from '@/lib/api/estate/estate.types';
import { listingApi } from '@/lib/api/listing/listing.api';
import { getProviderUrl } from '@/lib/platform/urls';
import { EstateCard } from './estate-card';
import { EstateImage } from './estate-image';
import { PropertyCard } from './property-card';

const propertyTypes: EstateType[] = [
  'APARTMENT',
  'HOUSE',
  'VILLA',
  'TOWNHOUSE',
  'LAND',
  'OFFICE',
  'SHOPHOUSE',
  'WAREHOUSE',
  'COMMERCIAL',
  'HOTEL',
  'RESORT',
  'FARM',
  'OTHER',
];

export function MarketplaceHome() {
  const t = useTranslations('customer');
  const estates = useQuery({
    queryKey: ['marketplace', 'public-estates'],
    queryFn: estateApi.listPublic,
  });
  const promoted = useQuery({
    queryKey: ['marketplace', 'promoted-listings'],
    queryFn: listingApi.promoted,
  });
  const banner = promoted.data?.[0];

  return (
    <div className="min-h-screen bg-[#f5f7f3] text-[#183c31]">
      <section className="border-b border-[#e4eae3] bg-white">
        <div className="mx-auto max-w-[var(--content-max)] px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[#1d7457]">
              {t('home.eyebrow')}
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-[-.04em] sm:text-5xl">
              {t('home.title')}
            </h1>
            <p className="mt-3 text-sm leading-7 text-[#64756b] sm:text-base">
              {t('home.description')}
            </p>
          </div>
          <form
            action="/properties"
            method="GET"
            className="mt-7 grid gap-3 rounded-2xl border border-[#dfe8df] bg-white p-3 shadow-[0_10px_30px_rgb(20_53_38_/_0.06)] sm:grid-cols-[minmax(0,1fr)_11rem_11rem_auto]"
          >
            <label className="min-w-0">
              <span className="sr-only">{t('properties.search')}</span>
              <input
                name="q"
                type="search"
                placeholder={t('home.searchPlaceholder')}
                className="h-11 w-full rounded-lg border border-[#e2e9e1] px-4 text-sm outline-none focus:border-[#258264]"
              />
            </label>
            <label>
              <span className="sr-only">{t('properties.purpose')}</span>
              <select
                name="purpose"
                defaultValue=""
                className="h-11 w-full rounded-lg border border-[#e2e9e1] px-3 text-sm outline-none focus:border-[#258264]"
              >
                <option value="">{t('properties.all')}</option>
                <option value="SALE">{t('properties.buy')}</option>
                <option value="RENT">{t('properties.rent')}</option>
              </select>
            </label>
            <label>
              <span className="sr-only">{t('home.searchType')}</span>
              <select
                name="type"
                defaultValue=""
                className="h-11 w-full rounded-lg border border-[#e2e9e1] px-3 text-sm outline-none focus:border-[#258264]"
              >
                <option value="">{t('home.allTypes')}</option>
                {propertyTypes.map((type) => (
                  <option key={type} value={type}>
                    {t(`home.propertyTypes.${type.toLowerCase()}`)}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className="app-button app-button-primary min-h-11 px-6"
            >
              {t('home.search')} <span aria-hidden="true">→</span>
            </button>
          </form>
        </div>
      </section>

      <div className="mx-auto max-w-[var(--content-max)] space-y-12 px-5 py-9 sm:px-8 lg:px-10 lg:py-12">
        <section aria-labelledby="marketplace-banner-title">
          <div className="mb-4 flex items-center justify-between">
            <h2
              id="marketplace-banner-title"
              className="text-sm font-bold uppercase tracking-[.11em] text-[#345b4b]"
            >
              {t('home.bannerArea')}
            </h2>
            <span className="text-xs text-[#77867b]">
              {t('home.sponsoredLabel')}
            </span>
          </div>
          {banner ? (
            <Link
              href={`/properties/${banner.id}`}
              className="group relative isolate flex min-h-[230px] overflow-hidden rounded-2xl bg-[#103e34] p-7 text-white sm:min-h-[270px] sm:p-10"
            >
              <EstateImage
                estateId={banner.estate.id}
                title={banner.estate.title}
                sizes="100vw"
                className="-z-10 object-cover opacity-45 transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0c352b] via-[#0c352b]/75 to-transparent" />
              <div className="relative my-auto max-w-2xl">
                <span className="inline-flex rounded-full bg-[#d7bd7d] px-3 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-[#213f2e]">
                  {t('home.sponsoredLabel')}
                </span>
                <h3 className="mt-4 text-2xl font-bold tracking-tight sm:text-4xl">
                  {banner.estate.title}
                </h3>
                <p className="mt-2 text-sm text-white/80">
                  {banner.estate.province.name} · {banner.estate.ward.name}
                </p>
                <span className="mt-5 inline-flex rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#164d3c]">
                  {t('home.viewDetails')} →
                </span>
              </div>
            </Link>
          ) : (
            <div className="flex min-h-[180px] flex-col justify-center rounded-2xl border border-dashed border-[#bed3c3] bg-[linear-gradient(120deg,#e4f0e4,#f6f7ec)] px-7 py-7 sm:px-10">
              <p className="text-xl font-bold text-[#22523f]">
                {t('home.bannerEmptyTitle')}
              </p>
              <p className="mt-2 max-w-xl text-sm leading-6 text-[#627769]">
                {t('home.bannerEmptyDescription')}
              </p>
              <a
                className="mt-4 inline-flex w-fit text-sm font-semibold text-[#17664c] underline underline-offset-4"
                href={getProviderUrl('/provider/listings')}
              >
                {t('home.bannerAction')} →
              </a>
            </div>
          )}
        </section>

        {Boolean(promoted.data?.length) && (
          <section aria-labelledby="marketplace-sponsored-title">
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-[.14em] text-[#a07332]">
                {t('home.sponsoredLabel')}
              </p>
              <h2
                id="marketplace-sponsored-title"
                className="mt-1 text-2xl font-bold tracking-tight"
              >
                {t('home.sponsoredTitle')}
              </h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {promoted.data?.map((listing) => (
                <PropertyCard key={listing.id} listing={listing} />
              ))}
            </div>
          </section>
        )}

        <section aria-labelledby="marketplace-estates-title">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.14em] text-[#1d7457]">
                {t('home.fromDatabase')}
              </p>
              <h2
                id="marketplace-estates-title"
                className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl"
              >
                {t('home.allEstates')}
              </h2>
              <p className="mt-1 text-sm text-[#69786e]">
                {t('home.allEstatesDescription')}
              </p>
            </div>
            <Link
              href="/properties"
              className="text-sm font-semibold text-[#17664c] hover:underline"
            >
              {t('home.viewAll')} →
            </Link>
          </div>
          {estates.isLoading ? (
            <p
              role="status"
              className="rounded-xl bg-white p-8 text-sm text-[#66776e]"
            >
              {t('home.loading')}
            </p>
          ) : estates.isError ? (
            <div
              role="alert"
              className="rounded-xl border border-[#e2e8e3] bg-white p-8"
            >
              <p className="text-sm text-[#9a392e]">{t('home.unavailable')}</p>
              <button
                type="button"
                onClick={() => void estates.refetch()}
                className="mt-4 rounded-lg border border-[#c7d7ca] px-4 py-2 text-sm font-semibold text-[#17664c]"
              >
                {t('properties.retry')}
              </button>
            </div>
          ) : estates.data?.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {estates.data.slice(0, 8).map((estate) => (
                <EstateCard key={estate.id} estate={estate} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-[#e2e8e3] bg-white p-8 text-sm text-[#66776e]">
              {t('home.empty')}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
