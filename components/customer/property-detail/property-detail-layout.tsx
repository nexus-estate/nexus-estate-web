'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { estateApi } from '@/lib/api/estate/estate.api';
import type { ListingEstate } from '@/lib/api/listing/listing.types';
import { EstateCard } from '../estate-card';
import { MarketplaceIcon } from '../marketplace-icon';
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
  const customerT = useTranslations('customer');
  const estates = useQuery({
    queryKey: ['marketplace', 'public-estates'],
    queryFn: estateApi.listPublic,
  });
  const similar = (estates.data ?? [])
    .filter(
      (estate) =>
        estate.id !== property.id &&
        (estate.type === property.type ||
          estate.provinceId === property.provinceId) &&
        (estate.purpose === property.purpose ||
          estate.purpose === 'SALE_OR_RENT' ||
          property.purpose === 'SALE_OR_RENT'),
    )
    .slice(0, 3);
  return (
    <div className="mp-detail">
      <div className="mp-container mp-detail-container">
        <nav aria-label={t('breadcrumb')} className="mp-breadcrumb">
          <Link href="/">
            <MarketplaceIcon name="home" />
            <span>{t('home')}</span>
          </Link>
          <MarketplaceIcon name="chevron" />
          <Link href="/properties">{t('properties')}</Link>
          <MarketplaceIcon name="chevron" />
          <span aria-current="page" className="truncate">
            {property.title}
          </span>
        </nav>
        <div className="mp-detail-grid">
          <div className="mp-detail-main">
            <PropertyGallery
              key={property.id}
              estateId={property.id}
              title={property.title}
            />
            <PropertySummary property={property} />
            <PropertyInformation property={property} />
          </div>
          <div className="mp-detail-sidebar">
            <PropertyContactCard
              key={listingId ?? property.id}
              price={price}
              purpose={property.purpose}
              listingId={listingId}
            />
            {similar.length > 0 && (
              <section className="mp-similar">
                <div className="mp-section-heading">
                  <h2>{t('similar')}</h2>
                  <Link href={`/properties?provinceId=${property.provinceId}`}>
                    {customerT('home.viewAllShort')}
                    <MarketplaceIcon name="arrow" />
                  </Link>
                </div>
                <div>
                  {similar.map((estate) => (
                    <EstateCard estate={estate} key={estate.id} compact />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
