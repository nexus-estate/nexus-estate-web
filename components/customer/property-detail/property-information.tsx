'use client';

import { useTranslations } from 'next-intl';
import type { ListingEstate } from '@/lib/api/listing/listing.types';
import { MarketplaceIcon, type MarketplaceIconName } from '../marketplace-icon';

export function PropertySummary({ property }: { property: ListingEstate }) {
  const customerT = useTranslations('customer');
  return (
    <header className="mp-property-summary">
      <span className="mp-badge">
        {customerT(`home.propertyTypes.${property.type.toLowerCase()}`)}
      </span>
      <h1>{property.title}</h1>
      <p>
        <MarketplaceIcon name="pin" />
        {[property.addressLine, property.ward.name, property.province.name]
          .filter(Boolean)
          .join(', ')}
      </p>
    </header>
  );
}

export function PropertyInformation({ property }: { property: ListingEstate }) {
  const t = useTranslations('customer.propertyDetail');
  const customerT = useTranslations('customer');
  const purpose = t(
    property.purpose === 'SALE'
      ? 'forSale'
      : property.purpose === 'RENT'
        ? 'forRent'
        : 'forSaleOrRent',
  );
  const propertyType = customerT(
    `home.propertyTypes.${property.type.toLowerCase()}`,
  );
  const facts: {
    value: string | number;
    label: string;
    icon: MarketplaceIconName;
  }[] = [
    ...(property.area !== null
      ? [
          {
            value: `${property.area} m²`,
            label: t('areaLabel'),
            icon: 'area' as const,
          },
        ]
      : []),
    ...(property.bedrooms !== null
      ? [
          {
            value: property.bedrooms,
            label: t('bedrooms'),
            icon: 'bed' as const,
          },
        ]
      : []),
    ...(property.bathrooms !== null
      ? [
          {
            value: property.bathrooms,
            label: t('bathrooms'),
            icon: 'bath' as const,
          },
        ]
      : []),
    { value: propertyType, label: t('typeLabel'), icon: 'building' },
    { value: purpose, label: t('purposeLabel'), icon: 'tag' },
  ];
  const hasDescription = Boolean(property.description?.trim());
  const address = [
    property.addressLine,
    property.ward.name,
    property.province.name,
  ]
    .filter(Boolean)
    .join(', ');
  const hasCoordinates =
    property.latitude !== null && property.longitude !== null;
  const overview = [
    { label: t('typeLabel'), value: propertyType },
    { label: t('purposeLabel'), value: purpose },
    ...facts.filter((fact) => ['area', 'bed', 'bath'].includes(fact.icon)),
    ...(property.floors !== null
      ? [{ label: t('floors'), value: property.floors }]
      : []),
  ];
  return (
    <div className="mp-property-information">
      <dl className="mp-detail-facts">
        {facts.map((fact) => (
          <div key={fact.label}>
            <MarketplaceIcon name={fact.icon} />
            <div>
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          </div>
        ))}
      </dl>
      <nav className="mp-section-nav" aria-label={t('sections')}>
        <a href="#property-overview">{t('overview')}</a>
        {hasDescription && (
          <a href="#property-description">{t('descriptionTitle')}</a>
        )}
        {address && <a href="#property-location">{t('location')}</a>}
      </nav>
      <section id="property-overview" className="mp-detail-section">
        <h2>{t('overviewTitle')}</h2>
        <dl className="mp-overview">
          {overview.map((fact) => (
            <div key={fact.label}>
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
      </section>
      {hasDescription && (
        <section id="property-description" className="mp-detail-section">
          <h2>{t('descriptionTitle')}</h2>
          <p className="whitespace-pre-line break-words">
            {property.description}
          </p>
        </section>
      )}
      {address && (
        <section id="property-location" className="mp-detail-section">
          <h2>{t('location')}</h2>
          <div className="mp-location">
            <MarketplaceIcon name="pin" />
            <p>{address}</p>
          </div>
          {hasCoordinates && (
            <a
              className="mp-map-link"
              href={`https://www.openstreetmap.org/?mlat=${property.latitude}&mlon=${property.longitude}#map=16/${property.latitude}/${property.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('viewMap')} <MarketplaceIcon name="arrow" />
            </a>
          )}
        </section>
      )}
    </div>
  );
}
