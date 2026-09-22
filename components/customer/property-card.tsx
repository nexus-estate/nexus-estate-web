'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import type { Listing } from '@/lib/api/listing/listing.types';
import { getListingImage, getListingImageType } from '@/lib/listing-image';

export function PropertyCard({ listing }: { listing: Listing }) {
  const locale = useLocale();
  const t = useTranslations('customer');
  const property = listing.estate;
  const type = getListingImageType(listing);
  const image = getListingImage(listing);
  const price = property.price
    ? new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
      }).format(property.price)
    : t('properties.contact');
  const specs = [
    property.area !== null && property.area > 0
      ? t('properties.area', { value: property.area })
      : null,
    property.bedrooms !== null && property.bedrooms > 0
      ? t('properties.bedrooms', { value: property.bedrooms })
      : null,
    property.bathrooms !== null && property.bathrooms > 0
      ? t('properties.bathrooms', { value: property.bathrooms })
      : null,
  ].filter(Boolean);

  return (
    <Link
      href={`/properties/${listing.id}`}
      className="group flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] transition-[border-color,box-shadow] duration-200 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-sm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--surface-muted)]">
        <Image
          src={image}
          alt=""
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
        <span className="badge absolute left-3 top-3 border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur">
          {property.purpose === 'RENT'
            ? t('properties.listingRent')
            : t('properties.listingBuy')}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs text-[var(--text-subtle)]">
          {t(`home.propertyTypes.${type}`)}
        </p>
        <h3 className="mt-1 line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-[var(--text)] transition-colors group-hover:text-[var(--primary)]">
          {property.title}
        </h3>
        <p className="mt-2 text-base font-semibold tracking-tight text-[var(--primary)]">
          {price}
        </p>
        {specs.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-[var(--border-muted)] pt-3 text-xs text-[var(--text-muted)]">
            {specs.map((spec, index) => (
              <span key={spec} className="flex items-center gap-2">
                {index > 0 && (
                  <span
                    aria-hidden="true"
                    className="text-[var(--text-subtle)]"
                  >
                    ·
                  </span>
                )}
                {spec}
              </span>
            ))}
          </div>
        )}
        <p className="mt-2 truncate text-xs text-[var(--text-subtle)]">
          {property.province.name}
          {property.ward ? `, ${property.ward.name}` : ''}
        </p>
      </div>
    </Link>
  );
}
