'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { EstateImage } from '@/components/customer/estate-image';
import type { Listing } from '@/lib/api/listing/listing.types';

export function PropertyCard({ listing }: { listing: Listing }) {
  const locale = useLocale();
  const t = useTranslations('customer');
  const property = listing.estate;
  const type = property.type.toLowerCase();
  const price = property.price
    ? new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
      }).format(property.price)
    : t('properties.contact');

  return (
    <Link
      href={`/properties/${listing.id}`}
      className="group block overflow-hidden border border-[#e5e5dc] bg-white transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-[var(--brand)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--surface-muted)]">
        <EstateImage
          estateId={property.id}
          title={property.title}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <span className="absolute left-3 top-3 bg-white px-3 py-1.5 text-[11px] font-semibold text-[var(--brand-strong)]">
          {property.purpose === 'RENT'
            ? t('properties.listingRent')
            : t('properties.listingBuy')}
        </span>
      </div>
      <div className="p-5">
        <p className="text-[10px] font-bold uppercase tracking-[.12em] text-[var(--brand-accent)]">
          {t(`home.propertyTypes.${type}`)}
        </p>
        <h3 className="mt-2 line-clamp-2 min-h-12 text-base font-semibold leading-6 text-[var(--brand-strong)] group-hover:text-[var(--brand)]">
          {property.title}
        </h3>
        <p className="mt-3 border-t border-[#ecece6] pt-3 text-lg font-semibold tracking-tight text-[var(--brand)]">
          {price}
        </p>
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--text-muted)]">
          {property.area !== null && property.area > 0 && (
            <span>{t('properties.area', { value: property.area })}</span>
          )}
          {property.bedrooms !== null && property.bedrooms > 0 && (
            <span>
              {t('properties.bedrooms', { value: property.bedrooms })}
            </span>
          )}
          {property.bathrooms !== null && property.bathrooms > 0 && (
            <span>
              {t('properties.bathrooms', { value: property.bathrooms })}
            </span>
          )}
        </div>
        <p className="mt-3 truncate text-xs text-[var(--text-subtle)]">
          {property.province.name}
          {property.ward ? `, ${property.ward.name}` : ''}
        </p>
      </div>
    </Link>
  );
}
