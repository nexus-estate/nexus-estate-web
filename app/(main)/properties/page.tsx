'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { PropertyCard } from '@/components/customer/property-card';
import { LoadingState } from '@/components/ui/LoadingState';
import { propertyApi } from '@/lib/api/property/property.api';
import type {
  Property,
  PropertyListResponse,
} from '@/lib/api/property/property.types';

const types = ['apartment', 'house', 'villa', 'land', 'office'] as const;
const purposes = ['buy', 'rent'] as const;

function items(response: PropertyListResponse | Property[]): Property[] {
  if (Array.isArray(response)) return response;
  return response.data ?? response.properties ?? response.items ?? [];
}

export default function PropertiesPage() {
  const t = useTranslations('customer');
  const commonT = useTranslations('common');
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filters, setFilters] = useState({
    type: searchParams.get('type') ?? '',
    purpose: searchParams.get('purpose') ?? '',
    city: searchParams.get('city') ?? '',
    query: searchParams.get('query') ?? '',
    page: 1,
  });
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError(false);
      try {
        const response = await propertyApi.list({
          page: filters.page,
          limit: 12,
          type: filters.type,
          purpose: filters.purpose,
          city: filters.city,
          q: filters.query,
        });
        const result = items(response);
        if (!cancelled) {
          setProperties(result);
          setTotal(
            !Array.isArray(response) && 'total' in response
              ? (response.total ?? result.length)
              : result.length,
          );
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
    (key: 'type' | 'purpose' | 'city' | 'query', value: string) => {
      setFilters((current) => ({ ...current, [key]: value, page: 1 }));
    },
    [],
  );
  const reset = () =>
    setFilters({ type: '', purpose: '', city: '', query: '', page: 1 });

  return (
    <div className="bg-[var(--background)]">
      <div className="mx-auto max-w-[var(--content-max)] px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
        <div className="max-w-2xl">
          <p className="eyebrow">{t('home.eyebrow')}</p>
          <h1 className="mt-4 font-display text-5xl tracking-[-.03em] text-[var(--brand-strong)]">
            {filters.purpose === 'rent'
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
              value={filters.query}
              onChange={(event) => change('query', event.target.value)}
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
                  {t(`properties.${purpose}`)}
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
                  {t(`home.propertyTypes.${type}`)}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold text-[var(--text)]">
            {t('home.quickSearch')}
            <input
              value={filters.city}
              onChange={(event) => change('city', event.target.value)}
              placeholder={t('properties.allCities')}
              className="app-control mt-2 px-3 py-2 text-sm font-normal"
            />
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
              <PropertyCard key={property.id} property={property} />
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
