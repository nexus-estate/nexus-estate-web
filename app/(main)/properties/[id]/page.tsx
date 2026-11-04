'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
import { PropertyDetailLayout } from '@/components/customer/property-detail/property-detail-layout';
import { ApiError } from '@/lib/api/core/error';
import { listingApi } from '@/lib/api/listing/listing.api';

export default function PropertyDetailPage() {
  const locale = useLocale();
  const t = useTranslations('customer.propertyDetail');
  const customerT = useTranslations('customer');
  const params = useParams<{ id: string }>();
  const query = useQuery({
    queryKey: ['marketplace', 'listing', params.id],
    queryFn: () => listingApi.getById(params.id),
    enabled: Boolean(params.id),
  });
  const listing = query.data;
  const notFound =
    query.error instanceof ApiError && query.error.status === 404;

  if (query.isLoading)
    return (
      <div
        role="status"
        aria-label={customerT('home.loading')}
        className="min-h-screen bg-[var(--background)]"
      >
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
          <div className="skeleton aspect-[16/7] w-full rounded-[var(--radius-xl)]" />
          <div className="skeleton mt-8 h-10 max-w-xl" />
        </div>
      </div>
    );

  if (!listing)
    return (
      <div className="flex min-h-[55vh] items-center justify-center bg-[var(--background)] px-5 text-center">
        <div>
          <h1 className="font-display text-4xl text-[var(--brand-strong)]">
            {notFound ? t('notFound') : customerT('home.unavailable')}
          </h1>
          {!notFound && (
            <button
              type="button"
              onClick={() => void query.refetch()}
              className="mp-button mt-5"
            >
              {customerT('properties.retry')}
            </button>
          )}
          <Link
            href="/properties"
            className="mt-5 inline-block border-b border-[var(--brand)] pb-1 text-sm font-semibold text-[var(--brand)]"
          >
            {t('back')} ↗
          </Link>
        </div>
      </div>
    );

  const p = listing.estate;
  const price = p.price
    ? new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
      }).format(p.price)
    : t('contact');

  return (
    <PropertyDetailLayout property={p} price={price} listingId={listing.id} />
  );
}
