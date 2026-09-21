'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { PropertyCard } from '@/components/customer/property-card';
import { LoadingState } from '@/components/ui/LoadingState';
import { locationApi } from '@/lib/api/estate/estate.api';
import type {
  EstatePurpose,
  EstateType,
  Province,
  Ward,
} from '@/lib/api/estate/estate.types';
import { listingApi } from '@/lib/api/listing/listing.api';
import type { Listing } from '@/lib/api/listing/listing.types';

const types: EstateType[] = ['APARTMENT', 'HOUSE', 'VILLA', 'LAND', 'OFFICE'];
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
  const [properties, setProperties] = useState<Listing[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filters, setFilters] = useState<MarketplaceFilters>({
    type: (searchParams.get('type') as EstateType | null) ?? '',
    purpose: (searchParams.get('purpose') as EstatePurpose | null) ?? '',
    provinceId: searchParams.get('provinceId') ?? '',
    wardId: searchParams.get('wardId') ?? '',
    q: searchParams.get('q') ?? '',
    page: 1,
  });
  const [total, setTotal] = useState(0);

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

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError(false);
      try {
        const response = await listingApi.list({
          page: filters.page,
          limit: 12,
          type: filters.type || undefined,
          purpose: filters.purpose || undefined,
          provinceId: filters.provinceId,
          wardId: filters.wardId,
          q: filters.q,
        });
        const result = response.items;
        if (!cancelled) {
          setProperties(result);
          setTotal(response.meta.total);
        }
      } catch {
        if (!cancelled) {
          setProperties([]);
          setTotal(0);
          setError(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [filters]);

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
    <div className="bg-[var(--background)]">
      <div className="mx-auto max-w-[var(--content-max)] px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
        <div className="max-w-2xl">
          <p className="eyebrow">{t('home.eyebrow')}</p>
          <h1 className="mt-4 font-display text-5xl tracking-[-.03em] text-[var(--brand-strong)]">
            {filters.purpose === 'RENT'
              ? t('properties.titleRent')
              : t('properties.title')}
          </h1>
          <p className="mt-4 text-base leading-7 text-[var(--text-muted)]">
            {t('properties.description')}
          </p>
        </div>
        <form
          className="app-panel mt-9 grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto] lg:items-end"
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
            className="min-h-10 rounded-[var(--radius-md)] border border-[var(--border)] px-4 text-sm font-semibold text-[var(--text-muted)] hover:bg-[var(--surface-hover)]"
          >
            {t('properties.reset')}
          </button>
        </form>
        <div className="mt-8 flex flex-col gap-2 border-b border-[var(--border-muted)] pb-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-[var(--text)]">
            {t('properties.results', { count: total })}
          </h2>
          {error && (
            <p role="alert" className="text-sm text-[var(--danger)]">
              {commonT('status.error')}
            </p>
          )}
        </div>
        {loading ? (
          <LoadingState label={commonT('status.loading')} />
        ) : properties.length ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <PropertyCard key={property.id} listing={property} />
            ))}
          </div>
        ) : (
          <div className="app-panel-muted mt-6 px-6 py-16 text-center text-sm text-[var(--text-muted)]">
            {t('properties.empty')}
          </div>
        )}
      </div>
    </div>
  );
}
