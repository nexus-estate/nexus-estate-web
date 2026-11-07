'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { listingApi } from '@/lib/api/listing/listing.api';
import { MarketplaceIcon, type MarketplaceIconName } from './marketplace-icon';
import { PromotedListings } from './promoted-listings';
import { PropertyCard } from './property-card';
import './marketplace-home.css';

const needs: { key: string; icon: MarketplaceIconName; href: string }[] = [
  { key: 'buy', icon: 'home', href: '/properties?purpose=SALE' },
  { key: 'rent', icon: 'key', href: '/properties?purpose=RENT' },
  { key: 'apartment', icon: 'building', href: '/properties?type=APARTMENT' },
  { key: 'type', icon: 'grid', href: '/properties#property-type' },
  { key: 'location', icon: 'pin', href: '/properties#property-province' },
];

export function MarketplaceHome() {
  const t = useTranslations('customer');
  const [purpose, setPurpose] = useState('SALE');
  const listings = useQuery({
    queryKey: ['marketplace', 'listings', { sort: 'newest', limit: 8 }],
    queryFn: () => listingApi.list({ sort: 'newest', limit: 8 }),
  });
  const latestListings = listings.data?.items ?? [];

  return (
    <div className="mp-home">
      <section className="mp-hero" aria-labelledby="marketplace-title">
        <Image
          src="/images/hero-villa.webp"
          alt=""
          fill
          preload
          sizes="100vw"
          className="mp-hero-image"
        />
        <div className="mp-hero-shade" />
        <div className="mp-container mp-hero-content">
          <p className="mp-eyebrow">NEXUS ESTATE</p>
          <h1 id="marketplace-title">{t('home.title')}</h1>
          <p className="mp-hero-description">
            {t('home.marketplaceDescription')}
          </p>
          <form action="/properties" method="GET" className="mp-hero-search">
            <fieldset className="mp-search-tabs">
              <legend className="sr-only">{t('properties.purpose')}</legend>
              {(['SALE', 'RENT'] as const).map((value) => (
                <label
                  key={value}
                  className={purpose === value ? 'is-active' : ''}
                >
                  <input
                    className="sr-only"
                    type="radio"
                    name="purpose"
                    value={value}
                    checked={purpose === value}
                    onChange={() => setPurpose(value)}
                  />
                  <MarketplaceIcon name={value === 'SALE' ? 'home' : 'key'} />
                  {t(`properties.${value === 'SALE' ? 'buy' : 'rent'}`)}
                </label>
              ))}
            </fieldset>
            <div className="mp-search-field">
              <label>
                <MarketplaceIcon name="pin" />
                <span className="sr-only">{t('properties.search')}</span>
                <input
                  type="search"
                  name="q"
                  placeholder={t('home.marketplaceSearchPlaceholder')}
                />
              </label>
              <button
                type="submit"
                // Autofill extensions may inject fdprocessedid before hydration.
                suppressHydrationWarning
                className="mp-button"
                aria-label={t('home.search')}
              >
                <MarketplaceIcon name="search" />
              </button>
            </div>
          </form>
        </div>
      </section>
      <div className="mp-container">
        <ul className="mp-highlights" aria-label={t('home.whyNexus')}>
          {(['search', 'images', 'pin', 'message'] as const).map(
            (icon, index) => (
              <li key={icon}>
                <span>
                  <MarketplaceIcon name={icon} />
                </span>
                {t(`home.highlights.${index}`)}
              </li>
            ),
          )}
        </ul>
        <PromotedListings />
        <section
          className="mp-home-section mp-latest"
          aria-labelledby="marketplace-latest-title"
        >
          <div className="mp-section-heading">
            <div className="mp-home-heading">
              <MarketplaceIcon name="clock" />
              <div>
                <h2 id="marketplace-latest-title">{t('home.latestEstates')}</h2>
                <p>{t('home.latestEstatesDescription')}</p>
              </div>
            </div>
            <Link href="/properties">
              {t('home.viewAllShort')}
              <MarketplaceIcon name="arrow" />
            </Link>
          </div>
          {listings.isError ? (
            <div className="mp-empty" role="alert">
              <p>{t('home.unavailable')}</p>
              <button
                className="app-button mt-4"
                onClick={() => void listings.refetch()}
              >
                {t('properties.retry')}
              </button>
            </div>
          ) : latestListings.length ? (
            <div className="mp-property-grid">
              {latestListings.map((listing) => (
                <PropertyCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : listings.isLoading ? (
            <div
              role="status"
              aria-label={t('home.loading')}
              className="mp-property-grid"
            >
              {[0, 1, 2, 3].map((item) => (
                <div key={item} className="skeleton h-64 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="mp-empty" role="status">
              <p>{t('home.empty')}</p>
            </div>
          )}
        </section>
        <section
          className="mp-home-section mp-explore"
          aria-labelledby="marketplace-explore-title"
        >
          <div className="mp-section-heading">
            <h2 id="marketplace-explore-title">{t('home.exploreNeeds')}</h2>
          </div>
          <div className="mp-needs">
            {needs.map((need) => (
              <Link key={need.key} href={need.href}>
                <MarketplaceIcon name={need.icon} />
                <span>{t(`home.needs.${need.key}`)}</span>
                <MarketplaceIcon name="chevron" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
