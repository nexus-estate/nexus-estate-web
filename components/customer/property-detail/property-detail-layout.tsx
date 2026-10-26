'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { ListingEstate } from '@/lib/api/listing/listing.types';
import { PropertyGallery } from '../property-gallery';
import { PropertyContactCard } from './property-contact-card';
import { PropertyInformation, PropertySummary } from './property-information';

export function PropertyDetailLayout({
  property,
  price,
  listingId,
}: {
  property: ListingEstate;
  price: string;
  listingId?: string;
}) {
  const t = useTranslations('customer.propertyDetail');
  return (
    <div className="min-h-screen bg-[var(--background)] pb-14 text-[var(--text)] lg:pb-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <nav
          aria-label={t('breadcrumb')}
          className="flex min-w-0 items-center gap-2 py-5 text-xs text-[var(--text-muted)] sm:py-6"
        >
          <Link href="/" className="shrink-0 hover:text-[var(--brand)]">
            {t('home')}
          </Link>
          <span aria-hidden="true">/</span>
          <Link
            href="/properties"
            className="shrink-0 hover:text-[var(--brand)]"
          >
            {t('properties')}
          </Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="truncate text-[var(--brand)]">
            {property.title}
          </span>
        </nav>
        <PropertyGallery
          key={property.id}
          estateId={property.id}
          title={property.title}
        />
        <div className="mt-7 grid items-start gap-y-7 lg:mt-9 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-x-12 lg:gap-y-8 xl:gap-x-16">
          <PropertySummary property={property} />
          <PropertyContactCard
            key={listingId ?? property.id}
            price={price}
            purpose={property.purpose}
            listingId={listingId}
          />
          <PropertyInformation property={property} />
        </div>
      </div>
    </div>
  );
}
