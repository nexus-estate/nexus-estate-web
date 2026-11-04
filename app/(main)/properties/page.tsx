'use client';

import { useCallback, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { EstateCard } from '@/components/customer/estate-card';
import { MarketplaceIcon } from '@/components/customer/marketplace-icon';
import { LoadingState } from '@/components/ui/LoadingState';
import { useLocations } from '@/hooks/use-locations';
import { estateApi } from '@/lib/api/estate/estate.api';
import type {
  Estate,
  EstatePurpose,
  EstateType,
} from '@/lib/api/estate/estate.types';

const types: EstateType[] = [
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
const purposes: EstatePurpose[] = ['SALE', 'RENT'];
type MarketplaceFilters = {
  type: EstateType | '';
  purpose: EstatePurpose | '';
  provinceId: string;
  wardId: string;
  q: string;
  page: number;
};

export default function PropertiesPage() {
  const searchParams = useSearchParams();
  return <PropertyResults key={searchParams.toString()} />;
}

function PropertyResults() {
  const t = useTranslations('customer');
  const commonT = useTranslations('common');
  const searchParams = useSearchParams();
  const estates = useQuery({
    queryKey: ['marketplace', 'public-estates'],
    queryFn: estateApi.listPublic,
  });
  const [filters, setFilters] = useState<MarketplaceFilters>({
    type: (searchParams.get('type') as EstateType | null) ?? '',
    purpose: (searchParams.get('purpose') as EstatePurpose | null) ?? '',
    provinceId: searchParams.get('provinceId') ?? '',
    wardId: searchParams.get('wardId') ?? '',
    q: searchParams.get('q') ?? '',
    page: 1,
  });
  const [sort, setSort] = useState('newest');
  const query = filters.q.trim().toLocaleLowerCase();
  const filtered = (estates.data ?? [])
    .filter(
      (estate: Estate) =>
        (!filters.type || estate.type === filters.type) &&
        (!filters.purpose ||
          estate.purpose === filters.purpose ||
          estate.purpose === 'SALE_OR_RENT') &&
        (!filters.provinceId || estate.provinceId === filters.provinceId) &&
        (!filters.wardId || estate.wardId === filters.wardId) &&
        (!query ||
          [
            estate.title,
            estate.description,
            estate.addressLine,
            estate.province.name,
            estate.ward.name,
          ].some((value) => value?.toLocaleLowerCase().includes(query))),
    )
    .sort((a, b) =>
      sort === 'price_asc'
        ? a.price - b.price
        : sort === 'price_desc'
          ? b.price - a.price
          : b.createdAt.localeCompare(a.createdAt),
    );
  const total = filtered.length;
  const properties = filtered.slice((filters.page - 1) * 12, filters.page * 12);

  const { provinces, wards, wardsPending } = useLocations(filters.provinceId);

  const change = useCallback(
    (
      key: 'type' | 'purpose' | 'provinceId' | 'wardId' | 'q',
      value: string,
    ) => {
      setFilters((current) => ({ ...current, [key]: value, page: 1 }));
    },
    [],
  );
  const reset = () =>
    setFilters({
      type: '',
      purpose: '',
      provinceId: '',
      wardId: '',
      q: '',
      page: 1,
    });

  return (
    <div className="mp-container mp-browse">
      <div className="mp-browse-heading">
        <h1>
          {filters.purpose === 'RENT'
            ? t('properties.titleRent')
            : t('properties.title')}
        </h1>
        <p>{t('properties.description')}</p>
      </div>
      <div>
        <form
          className="mp-filter-bar"
          onSubmit={(event) => event.preventDefault()}
        >
          <label className="block text-sm font-semibold text-[var(--text)] lg:col-span-1">
            {t('properties.search')}
            <input
              type="search"
              value={filters.q}
              onChange={(event) => change('q', event.target.value)}
              placeholder={t('properties.searchPlaceholder')}
              className="app-control mt-2 px-3 py-2 text-sm font-normal"
            />
          </label>
          <label className="block text-sm font-semibold text-[var(--text)]">
            {t('properties.purpose')}
            <select
              value={filters.purpose}
              onChange={(event) => change('purpose', event.target.value)}
              className="app-control mt-2 px-3 py-2 text-sm font-normal"
            >
              <option value="">{t('properties.all')}</option>
              {purposes.map((purpose) => (
                <option key={purpose} value={purpose}>
                  {t(`properties.${purpose === 'SALE' ? 'buy' : 'rent'}`)}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold text-[var(--text)]">
            {t('properties.type')}
            <select
              id="property-type"
              value={filters.type}
              onChange={(event) => change('type', event.target.value)}
              className="app-control mt-2 px-3 py-2 text-sm font-normal"
            >
              <option value="">{t('properties.allTypes')}</option>
              {types.map((type) => (
                <option key={type} value={type}>
                  {t(`home.propertyTypes.${type.toLowerCase()}`)}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold text-[var(--text)]">
            {t('listing.city')}
            <select
              id="property-province"
              value={filters.provinceId}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  provinceId: event.target.value,
                  wardId: '',
                  page: 1,
                }))
              }
              className="app-control mt-2 px-3 py-2 text-sm font-normal"
            >
              <option value="">{t('properties.allCities')}</option>
              {provinces.map((province) => (
                <option key={province.id} value={province.id}>
                  {province.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold text-[var(--text)]">
            {t('listing.ward')}
            <select
              value={filters.wardId}
              disabled={!filters.provinceId || wardsPending}
              onChange={(event) => change('wardId', event.target.value)}
              className="app-control mt-2 px-3 py-2 text-sm font-normal"
            >
              <option value="">{t('properties.all')}</option>
              {wards.map((ward) => (
                <option key={ward.id} value={ward.id}>
                  {ward.name}
                </option>
              ))}
            </select>
          </label>
          <button type="button" onClick={reset} className="mp-filter-reset">
            {t('properties.reset')}
          </button>
        </form>
        <div
          className="mp-active-filters"
          aria-label={t('properties.activeFilters')}
        >
          {(['q', 'purpose', 'type', 'provinceId', 'wardId'] as const)
            .filter((key) => filters[key])
            .map((key) => {
              const value = filters[key];
              const label =
                key === 'purpose'
                  ? t(`properties.${value === 'RENT' ? 'rent' : 'buy'}`)
                  : key === 'type'
                    ? t(`home.propertyTypes.${value.toLowerCase()}`)
                    : key === 'provinceId'
                      ? (provinces.find((province) => province.id === value)
                          ?.name ?? value)
                      : key === 'wardId'
                        ? (wards.find((ward) => ward.id === value)?.name ??
                          value)
                        : value;
              return (
                <button
                  key={key}
                  aria-label={t('properties.removeFilter', { label })}
                  onClick={() =>
                    setFilters((current) => ({
                      ...current,
                      [key]: '',
                      ...(key === 'provinceId' ? { wardId: '' } : {}),
                      page: 1,
                    }))
                  }
                >
                  {label}
                  <MarketplaceIcon name="close" />
                </button>
              );
            })}
        </div>
        <div className="mp-results-heading">
          <h2 aria-live="polite">
            {estates.isLoading
              ? commonT('status.loading')
              : estates.isError
                ? t('properties.title')
                : t('properties.results', { count: total })}
          </h2>
          <label>
            {t('properties.sort')}
            <select
              value={sort}
              onChange={(event) => {
                setSort(event.target.value);
                setFilters((current) => ({ ...current, page: 1 }));
              }}
            >
              <option value="newest">{t('properties.sortNewest')}</option>
              <option value="price_asc">{t('properties.sortPriceAsc')}</option>
              <option value="price_desc">
                {t('properties.sortPriceDesc')}
              </option>
            </select>
          </label>
        </div>
        {estates.isLoading ? (
          <LoadingState label={commonT('status.loading')} />
        ) : estates.isError ? (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-[#e5e5dc] bg-white px-6 py-12 text-center"
          >
            <p className="text-sm text-[var(--danger)]">
              {t('properties.tryAgain')}
            </p>
            <button
              type="button"
              onClick={() => void estates.refetch()}
              className="mt-5 rounded-lg border border-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-[var(--brand)]"
            >
              {t('properties.retry')}
            </button>
          </div>
        ) : properties.length ? (
          <div className="mp-property-grid">
            {properties.map((property) => (
              <EstateCard key={property.id} estate={property} />
            ))}
          </div>
        ) : (
          <div className="mp-empty">
            <p className="text-xl font-semibold text-[var(--brand-strong)]">
              {t('properties.empty')}
            </p>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#647069]">
              {t('properties.emptyHint')}
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-6 border border-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-[var(--brand)] transition-colors hover:bg-[#f4f5f0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]"
            >
              {t('properties.reset')}
            </button>
          </div>
        )}
        {total > 12 && !estates.isError && (
          <nav
            aria-label={t('properties.pagination')}
            className="mt-8 flex items-center justify-center gap-4"
          >
            <button
              type="button"
              disabled={filters.page === 1}
              onClick={() =>
                setFilters((current) => ({
                  ...current,
                  page: current.page - 1,
                }))
              }
              className="rounded-lg border border-[#cfdcd0] bg-white px-4 py-2 text-sm font-semibold text-[#245845] disabled:opacity-40"
            >
              {t('properties.previous')}
            </button>
            <span className="text-sm text-[#68796d]">
              {filters.page} / {Math.ceil(total / 12)}
            </span>
            <button
              type="button"
              disabled={filters.page >= Math.ceil(total / 12)}
              onClick={() =>
                setFilters((current) => ({
                  ...current,
                  page: current.page + 1,
                }))
              }
              className="rounded-lg border border-[#cfdcd0] bg-white px-4 py-2 text-sm font-semibold text-[#245845] disabled:opacity-40"
            >
              {t('properties.next')}
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}
