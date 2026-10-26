'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { EstateCard } from '@/components/customer/estate-card';
import { LoadingState } from '@/components/ui/LoadingState';
import { estateApi, locationApi } from '@/lib/api/estate/estate.api';
import type {
  Estate,
  EstatePurpose,
  EstateType,
  Province,
  Ward,
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
  const t = useTranslations('customer');
  const commonT = useTranslations('common');
  const searchParams = useSearchParams();
  const estates = useQuery({
    queryKey: ['marketplace', 'public-estates'],
    queryFn: estateApi.listPublic,
  });
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [filters, setFilters] = useState<MarketplaceFilters>({
    type: (searchParams.get('type') as EstateType | null) ?? '',
    purpose: (searchParams.get('purpose') as EstatePurpose | null) ?? '',
    provinceId: searchParams.get('provinceId') ?? '',
    wardId: searchParams.get('wardId') ?? '',
    q: searchParams.get('q') ?? '',
    page: 1,
  });
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
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const total = filtered.length;
  const properties = filtered.slice((filters.page - 1) * 12, filters.page * 12);

  useEffect(() => {
    void locationApi
      .provinces()
      .then(setProvinces)
      .catch(() => setProvinces([]));
  }, []);

  useEffect(() => {
    if (!filters.provinceId) return;
    void locationApi
      .wards(filters.provinceId)
      .then(setWards)
      .catch(() => setWards([]));
  }, [filters.provinceId]);

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
    <div className="min-h-screen bg-[#f8f7f3]">
      <div className="border-b border-[#e5e5dc] bg-white">
        <div className="mx-auto max-w-[var(--content-max)] px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-[var(--brand-accent)]">
              {t('home.eyebrow')}
            </p>
            <h1 className="mt-4 font-display text-5xl tracking-[-.04em] text-[var(--brand-strong)] sm:text-6xl">
              {filters.purpose === 'RENT'
                ? t('properties.titleRent')
                : t('properties.title')}
            </h1>
            <p className="mt-4 text-base leading-7 text-[#647069]">
              {t('properties.description')}
            </p>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-[var(--content-max)] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
        <form
          className="grid gap-4 border border-[#e5e5dc] bg-white p-5 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr_auto] lg:items-end"
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
            {t('home.quickSearch')}
            <select
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
            {t('listing.district')}
            <select
              value={filters.wardId}
              disabled={!filters.provinceId}
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
          <button
            type="button"
            onClick={reset}
            style={{ color: '#123b3a' }}
            className="min-h-10 border border-[#d6dcd5] px-4 text-sm font-semibold text-[var(--brand)] transition-colors hover:bg-[#f4f5f0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]"
          >
            {t('properties.reset')}
          </button>
        </form>
        <div className="mt-10 flex flex-col gap-2 border-b border-[#e5e5dc] pb-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-[var(--text)]">
            {t('properties.results', { count: total })}
          </h2>
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
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {properties.map((property) => (
              <EstateCard key={property.id} estate={property} />
            ))}
          </div>
        ) : (
          <div className="mt-6 border border-[#e5e5dc] bg-white px-6 py-16 text-center">
            <p className="font-display text-3xl text-[var(--brand-strong)]">
              {t('properties.empty')}
            </p>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#647069]">
              {t('properties.emptyHint')}
            </p>
            <button
              type="button"
              onClick={reset}
              style={{ color: '#123b3a' }}
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
