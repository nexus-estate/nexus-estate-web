import { cache } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { PropertyLeadForm } from '@/components/customer/property-lead-form';
import { Badge } from '@/components/ui/Badge';
import { JsonLd } from '@/components/ui/JsonLd';
import { listingApi } from '@/lib/api/listing/listing.api';
import type { Listing } from '@/lib/api/listing/listing.types';
import { formatCurrency } from '@/lib/format';
import { getListingImage } from '@/lib/listing-image';
import {
  absoluteUrl,
  buildBreadcrumbJsonLd,
  buildListingDescription,
  buildListingJsonLd,
  listingPath,
} from '@/lib/seo';

/** Detail pages are stable catalogue data; revalidate instead of refetching. */
const REVALIDATE_SECONDS = 60;

/** Deduped per request so metadata and the page share one upstream call. */
const loadListing = cache(async (id: string): Promise<Listing | null> => {
  try {
    return await listingApi.getById(id, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
  } catch {
    // 404s and upstream failures both render the not-found surface.
    return null;
  }
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const listing = await loadListing(id);

  if (!listing) {
    // Resolved before streaming starts, so the response is a real 404 rather
    // than a soft 404 (which the route's loading.tsx would otherwise cause).
    notFound();
  }

  const { estate } = listing;
  const description = buildListingDescription(listing);
  const image = absoluteUrl(getListingImage(listing));

  return {
    title: estate.title,
    description,
    alternates: { canonical: listingPath(listing.id) },
    openGraph: {
      type: 'article',
      title: estate.title,
      description,
      url: absoluteUrl(listingPath(listing.id)),
      images: [{ url: image, alt: estate.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: estate.title,
      description,
      images: [image],
    },
  };
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [listing, t, customerT, locale] = await Promise.all([
    loadListing(id),
    getTranslations('customer.propertyDetail'),
    getTranslations('customer'),
    getLocale(),
  ]);

  if (!listing) notFound();

  const estate = listing.estate;
  const price = formatCurrency(estate.price, locale, {
    fallback: t('contact'),
  });
  const specs = [
    estate.area ? [String(estate.area), t('squareMeters')] : null,
    estate.bedrooms ? [String(estate.bedrooms), t('bedrooms')] : null,
    estate.bathrooms ? [String(estate.bathrooms), t('bathrooms')] : null,
  ].filter((spec): spec is string[] => spec !== null);

  const breadcrumbs = [
    { name: t('home'), path: '/' },
    { name: t('properties'), path: '/properties' },
    { name: estate.title, path: listingPath(listing.id) },
  ];

  return (
    <div className="bg-[var(--background)]">
      <JsonLd data={buildListingJsonLd(listing)} />
      <JsonLd data={buildBreadcrumbJsonLd(breadcrumbs)} />

      <div className="mx-auto max-w-[var(--content-max)] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <nav
          className="mb-4 flex flex-wrap items-center gap-1.5 text-xs text-[var(--text-muted)]"
          aria-label={customerT('nav.navigation')}
        >
          <Link
            href="/"
            className="transition-colors hover:text-[var(--primary)]"
          >
            {t('home')}
          </Link>
          <span aria-hidden="true" className="text-[var(--text-subtle)]">
            /
          </span>
          <Link
            href="/properties"
            className="transition-colors hover:text-[var(--primary)]"
          >
            {t('properties')}
          </Link>
          <span aria-hidden="true" className="text-[var(--text-subtle)]">
            /
          </span>
          <span className="truncate text-[var(--text)]">{estate.title}</span>
        </nav>

        <div className="grid gap-6 lg:grid-cols-[1.9fr_1fr]">
          <div className="space-y-5">
            <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)]">
              <Image
                src={getListingImage(listing)}
                alt=""
                fill
                priority
                sizes="(min-width: 1024px) 62vw, 100vw"
                className="object-cover"
              />
              <span className="badge absolute left-4 top-4 border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur">
                {estate.purpose === 'SALE' ? t('forSale') : t('forRent')}
              </span>
            </div>

            <div className="panel p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-[var(--text-subtle)]">
                    {customerT(
                      `home.propertyTypes.${estate.type.toLowerCase()}`,
                    )}
                  </p>
                  <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--text)]">
                    {estate.title}
                  </h1>
                </div>
                <p className="text-2xl font-semibold tracking-tight text-[var(--primary)]">
                  {price}
                </p>
              </div>

              {specs.length > 0 && (
                <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--border-muted)] sm:grid-cols-3">
                  {specs.map(([value, label]) => (
                    <div key={label} className="bg-[var(--surface)] px-4 py-3">
                      <dt className="text-xs text-[var(--text-muted)]">
                        {label}
                      </dt>
                      <dd className="mt-0.5 text-lg font-semibold text-[var(--text)]">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}

              <div className="mt-5 space-y-4 text-sm leading-6 text-[var(--text-muted)]">
                {estate.description && (
                  <div>
                    <h2 className="text-sm font-semibold text-[var(--text)]">
                      {t('descriptionTitle')}
                    </h2>
                    <p className="mt-1 whitespace-pre-line">
                      {estate.description}
                    </p>
                  </div>
                )}
                <div>
                  <h2 className="text-sm font-semibold text-[var(--text)]">
                    {t('address')}
                  </h2>
                  <p className="mt-1">
                    {estate.province.name}
                    {estate.ward ? `, ${estate.ward.name}` : ''} ·{' '}
                    {estate.addressLine}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="panel sticky top-24 p-5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-semibold text-[var(--text)]">
                  {t('contactNow')}
                </h2>
                <Badge>{t('broker')}</Badge>
              </div>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                {t('contactPrompt')}
              </p>
              <PropertyLeadForm listingId={listing.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
