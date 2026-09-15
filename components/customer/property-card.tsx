'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import type { Property } from '@/lib/api/property/property.types';

const fallbackImages = {
  apartment: '/images/properties/residence-danang.webp',
  house: '/images/properties/penthouse-saigon.webp',
  villa: '/images/properties/villa-dalat.webp',
  land: '/images/hero-villa.webp',
  office: '/images/properties/residence-danang.webp',
} as const;

export function PropertyCard({ property }: { property: Property }) {
  const locale = useLocale();
  const t = useTranslations('customer');
  const type = property.type.toLowerCase() as keyof typeof fallbackImages;
  const image = property.images?.[0]?.startsWith('/')
    ? property.images[0]
    : (fallbackImages[type] ?? fallbackImages.house);
  const price = property.price
    ? new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
      }).format(property.price)
    : t('properties.contact');

  return (
    <Link
      href={`/properties/${property.id}`}
      className="group block overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-xs)] transition-[box-shadow,transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-md)] focus-visible:outline-none"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--surface-muted)]">
        <Image
          src={image}
          alt=""
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <span className="absolute left-3 top-3 rounded-full bg-[var(--surface)]/90 px-2.5 py-1 text-[11px] font-semibold text-[var(--text)] shadow-[var(--shadow-xs)] backdrop-blur">
          {property.purpose === 'rent'
            ? t('properties.listingRent')
            : t('properties.listingBuy')}
        </span>
      </div>
      <div className="p-4">
        <p className="text-xs font-medium text-[var(--text-subtle)]">
          {t(`home.propertyTypes.${type}`)}
        </p>
        <h3 className="mt-1 line-clamp-2 min-h-12 text-base font-semibold leading-6 text-[var(--text)] group-hover:text-[var(--brand)]">
          {property.title}
        </h3>
        <p className="mt-3 text-lg font-semibold tracking-tight text-[var(--brand)]">
          {price}
        </p>
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--text-muted)]">
          {property.area > 0 && (
            <span>{t('properties.area', { value: property.area })}</span>
          )}
          {property.bedrooms > 0 && (
            <span>
              {t('properties.bedrooms', { value: property.bedrooms })}
            </span>
          )}
          {property.bathrooms > 0 && (
            <span>
              {t('properties.bathrooms', { value: property.bathrooms })}
            </span>
          )}
        </div>
        <p className="mt-3 truncate text-xs text-[var(--text-subtle)]">
          {property.city}
          {property.district ? `, ${property.district}` : ''}
        </p>
      </div>
    </Link>
  );
}
