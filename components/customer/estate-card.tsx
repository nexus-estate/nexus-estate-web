'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import type { ListingEstate } from '@/lib/api/listing/listing.types';
import { EstateImage } from './estate-image';
import { MarketplaceIcon } from './marketplace-icon';

/** One card for estates and published listings; callers retain their route identity. */
export function EstateCard({
  estate,
  href,
  sponsored = false,
  compact = false,
  variant = 'standard',
}: {
  estate: ListingEstate;
  href?: string;
  sponsored?: boolean;
  compact?: boolean;
  variant?: 'standard' | 'promoted';
}) {
  const locale = useLocale();
  const t = useTranslations('customer');
  const price = estate.price
    ? new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
      }).format(estate.price)
    : t('properties.contact');
  return (
    <Link
      href={href ?? `/properties/estate/${estate.id}`}
      className={`mp-property-card group${compact ? ' mp-property-card-compact' : ''}${variant === 'promoted' ? ' mp-property-card-promoted' : ''}`}
    >
      <div className="mp-property-cover">
        <EstateImage
          estateId={estate.id}
          title={estate.title}
          sizes={
            compact
              ? '120px'
              : variant === 'promoted'
                ? '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 90vw'
                : '(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw'
          }
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        {!compact && (
          <span className="mp-cover-badge">
            {t(`home.propertyTypes.${estate.type.toLowerCase()}`)}
          </span>
        )}
        {variant === 'promoted' && (
          <span className="mp-promotion-badge">
            <MarketplaceIcon name="flame" />
            {t('home.promotionBadge')}
          </span>
        )}
        {sponsored && variant !== 'promoted' && (
          <span className="mp-sponsored">{t('home.sponsoredLabel')}</span>
        )}
      </div>
      <div className="mp-property-body">
        <h3 className="line-clamp-1" title={estate.title}>
          {estate.title}
        </h3>
        <p className="mp-property-location">
          <MarketplaceIcon name="pin" />
          <span className="truncate">
            {[estate.ward.name, estate.province.name]
              .filter(Boolean)
              .join(', ')}
          </span>
        </p>
        <p className="mp-property-price">{price}</p>
        {!compact && (
          <div className="mp-card-facts">
            {estate.area !== null && (
              <span aria-label={t('properties.area', { value: estate.area })}>
                <MarketplaceIcon name="area" />
                {estate.area} m²
              </span>
            )}
            {estate.bedrooms !== null && (
              <span
                aria-label={t('properties.bedrooms', {
                  value: estate.bedrooms,
                })}
              >
                <MarketplaceIcon name="bed" />
                {estate.bedrooms}
              </span>
            )}
            {estate.bathrooms !== null && (
              <span
                aria-label={t('properties.bathrooms', {
                  value: estate.bathrooms,
                })}
              >
                <MarketplaceIcon name="bath" />
                {estate.bathrooms}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
