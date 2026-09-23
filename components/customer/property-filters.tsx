'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type {
  EstatePurpose,
  EstateType,
  Province,
  Ward,
} from '@/lib/api/estate/estate.types';

const types: EstateType[] = ['APARTMENT', 'HOUSE', 'VILLA', 'LAND', 'OFFICE'];
const purposes: EstatePurpose[] = ['SALE', 'RENT'];

/**
 * Filters live in the URL, not component state: results are server-rendered,
 * shareable, bookmarkable, and the back button restores the previous search.
 */
export function PropertyFilters({
  provinces,
  wards,
}: {
  provinces: Province[];
  wards: Ward[];
}) {
  const t = useTranslations('customer');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const current = useMemo(
    () => ({
      q: searchParams.get('q') ?? '',
      purpose: searchParams.get('purpose') ?? '',
      type: searchParams.get('type') ?? '',
      provinceId: searchParams.get('provinceId') ?? '',
      wardId: searchParams.get('wardId') ?? '',
    }),
    [searchParams],
  );

  const [query, setQuery] = useState(current.q);

  // Keep the input in sync when navigation changes the URL (back/forward).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuery(current.q);
  }, [current.q]);

  const navigate = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    // Any filter change invalidates the current page offset.
    params.delete('page');
    const queryString = params.toString();
    startTransition(() => {
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    });
  };

  // Debounce free-text search so typing does not trigger a request per keypress.
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (query === current.q) return;
    debounce.current = setTimeout(() => navigate({ q: query }), 350);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const hasFilters = Object.values(current).some(Boolean);

  return (
    <form
      className="panel grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr_auto] lg:items-end"
      onSubmit={(event) => event.preventDefault()}
      aria-busy={isPending}
    >
      <div>
        <label className="field-label" htmlFor="filter-q">
          {t('properties.search')}
        </label>
        <input
          id="filter-q"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('properties.searchPlaceholder')}
          className="field"
        />
      </div>

      <div>
        <label className="field-label" htmlFor="filter-purpose">
          {t('properties.purpose')}
        </label>
        <select
          id="filter-purpose"
          value={current.purpose}
          onChange={(event) => navigate({ purpose: event.target.value })}
          className="field"
        >
          <option value="">{t('properties.all')}</option>
          {purposes.map((purpose) => (
            <option key={purpose} value={purpose}>
              {t(`properties.${purpose === 'SALE' ? 'buy' : 'rent'}`)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="field-label" htmlFor="filter-type">
          {t('properties.type')}
        </label>
        <select
          id="filter-type"
          value={current.type}
          onChange={(event) => navigate({ type: event.target.value })}
          className="field"
        >
          <option value="">{t('properties.allTypes')}</option>
          {types.map((type) => (
            <option key={type} value={type}>
              {t(`home.propertyTypes.${type.toLowerCase()}`)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="field-label" htmlFor="filter-province">
          {t('home.quickSearch')}
        </label>
        <select
          id="filter-province"
          value={current.provinceId}
          onChange={(event) =>
            navigate({ provinceId: event.target.value, wardId: '' })
          }
          className="field"
        >
          <option value="">{t('properties.allCities')}</option>
          {provinces.map((province) => (
            <option key={province.id} value={province.id}>
              {province.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="field-label" htmlFor="filter-ward">
          {t('listing.district')}
        </label>
        <select
          id="filter-ward"
          value={current.wardId}
          disabled={!current.provinceId}
          onChange={(event) => navigate({ wardId: event.target.value })}
          className="field"
        >
          <option value="">{t('properties.all')}</option>
          {wards.map((ward) => (
            <option key={ward.id} value={ward.id}>
              {ward.name}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        disabled={!hasFilters && !isPending}
        onClick={() => {
          setQuery('');
          startTransition(() => router.replace(pathname, { scroll: false }));
        }}
        className="btn btn-secondary"
      >
        {isPending ? (
          <span
            className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[var(--border-strong)] border-t-[var(--primary)]"
            aria-hidden="true"
          />
        ) : null}
        {t('properties.reset')}
      </button>
    </form>
  );
}
