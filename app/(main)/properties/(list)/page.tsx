import { Suspense } from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { PropertyCard } from '@/components/customer/property-card';
import { PropertyFilters } from '@/components/customer/property-filters';
import { JsonLd } from '@/components/ui/JsonLd';
import { Pagination } from '@/components/ui/Pagination';
import { locationApi } from '@/lib/api/estate/estate.api';
import type {
  EstatePurpose,
  EstateType,
  Province,
  Ward,
} from '@/lib/api/estate/estate.types';
import { listingApi } from '@/lib/api/listing/listing.api';
import type { Listing, ListingQuery } from '@/lib/api/listing/listing.types';

const PAGE_SIZE = 12;
/** Public catalogue data: cache briefly instead of refetching per request. */
const LISTING_REVALIDATE = 60;
const LOCATION_REVALIDATE = 60 * 60;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function readParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
): string {
  const value = params[key];
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? '';
}

function readPage(params: Record<string, string | string[] | undefined>) {
  const parsed = Number.parseInt(readParam(params, 'page'), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('customer');
  return {
    title: t('properties.title'),
    description: t('properties.description'),
    alternates: { canonical: '/properties' },
    robots: { index: true, follow: true },
  };
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const t = await getTranslations('customer');
  const commonT = await getTranslations('common');

  const filters = {
    q: readParam(params, 'q'),
    purpose: readParam(params, 'purpose') as EstatePurpose | '',
    type: readParam(params, 'type') as EstateType | '',
    provinceId: readParam(params, 'provinceId'),
    wardId: readParam(params, 'wardId'),
  };
  const page = readPage(params);

  const query: ListingQuery = {
    page,
    limit: PAGE_SIZE,
    q: filters.q || undefined,
    purpose: filters.purpose || undefined,
    type: filters.type || undefined,
    provinceId: filters.provinceId || undefined,
    wardId: filters.wardId || undefined,
  };

  const [result, provinces, wards] = await Promise.all([
    listingApi
      .list(query, { next: { revalidate: LISTING_REVALIDATE } })
      .catch(() => null),
    locationApi
      .provinces({ next: { revalidate: LOCATION_REVALIDATE } })
      .catch(() => [] as Province[]),
    filters.provinceId
      ? locationApi
          .wards(filters.provinceId, {
            next: { revalidate: LOCATION_REVALIDATE },
          })
          .catch(() => [] as Ward[])
      : Promise.resolve([] as Ward[]),
  ]);

  const listings: Listing[] = result?.items ?? [];
  const total = result?.meta.total ?? 0;
  const totalPages = result?.meta.totalPages ?? 1;
  const failed = result === null;

  const hrefForPage = (target: number) => {
    const next = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) next.set(key, value);
    });
    if (target > 1) next.set('page', String(target));
    const queryString = next.toString();
    return queryString ? `/properties?${queryString}` : '/properties';
  };

  const heading =
    filters.purpose === 'RENT'
      ? t('properties.titleRent')
      : t('properties.title');

  return (
    <div className="bg-[var(--background)]">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: t('nav.home'),
              item: '/',
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: heading,
              item: hrefForPage(1),
            },
          ],
        }}
      />

      <div className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto max-w-[var(--content-max)] px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text)]">
            {heading}
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">
            {t('properties.description')}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[var(--content-max)] px-4 py-8 sm:px-6 lg:px-8">
        <Suspense
          fallback={<div className="panel h-[92px] p-4" aria-hidden="true" />}
        >
          <PropertyFilters provinces={provinces} wards={wards} />
        </Suspense>

        <div className="mt-6 flex flex-col gap-2 border-b border-[var(--border-muted)] pb-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-semibold text-[var(--text)]">
            {t('properties.results', { count: total })}
          </h2>
          {failed && (
            <p role="alert" className="text-sm text-[var(--danger)]">
              {commonT('status.error')}
            </p>
          )}
        </div>

        {listings.length > 0 ? (
          <>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {listings.map((listing) => (
                <PropertyCard key={listing.id} listing={listing} />
              ))}
            </div>
            <Pagination
              page={page}
              totalPages={totalPages}
              hrefForPage={hrefForPage}
              labels={{
                previous: commonT('pagination.previous'),
                next: commonT('pagination.next'),
                pageOf: commonT('pagination.pageOf', {
                  current: page,
                  total: totalPages,
                }),
              }}
            />
          </>
        ) : (
          <div className="mt-5">
            {failed ? (
              <div className="panel-muted flex flex-col items-center px-6 py-14 text-center">
                <p className="text-sm font-semibold text-[var(--text)]">
                  {commonT('status.error')}
                </p>
                <Link href={hrefForPage(1)} className="btn btn-secondary mt-4">
                  {t('properties.reset')}
                </Link>
              </div>
            ) : (
              <div className="panel-muted flex flex-col items-center px-6 py-14 text-center">
                <span
                  className="grid h-11 w-11 place-items-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-subtle)]"
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                    <circle
                      cx="11"
                      cy="11"
                      r="7"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />
                    <path
                      d="m16 16 4.5 4.5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <p className="mt-3 text-sm font-semibold text-[var(--text)]">
                  {t('properties.empty')}
                </p>
                <Link href="/properties" className="btn btn-secondary mt-4">
                  {t('properties.reset')}
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
