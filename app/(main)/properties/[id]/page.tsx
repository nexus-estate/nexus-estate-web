'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { PropertyDetailLayout } from '@/components/customer/property-detail/property-detail-layout';
import { listingApi } from '@/lib/api/listing/listing.api';
import type { Listing } from '@/lib/api/listing/listing.types';

export default function PropertyDetailPage() {
  const locale = useLocale();
  const t = useTranslations('customer.propertyDetail');
  const params = useParams();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function fetch() {
      try {
        setListing(await listingApi.getById(params.id as string));
      } catch (err) {
        console.error('Failed to fetch property:', err);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [params.id]);

  if (loading)
    return (
      <div className="min-h-screen bg-[var(--background)]">
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
            {t('notFound')}
          </h1>
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
