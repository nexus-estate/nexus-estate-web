'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { listingApi } from '@/lib/api/listing/listing.api';
import { MarketplaceIcon } from './marketplace-icon';
import { PropertyCard } from './property-card';

/** Promotion eligibility and ordering are owned by the public promoted endpoint. */
export function PromotedListings() {
  const t = useTranslations('customer');
  const query = useQuery({
    queryKey: ['marketplace', 'promoted-listings'],
    queryFn: listingApi.promoted,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchInterval: 60_000,
  });
  const listings = query.isError ? [] : (query.data ?? []);
  const [expanded, setExpanded] = useState(false);
  const [edges, setEdges] = useState({ previous: false, next: false });
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const measure = () =>
      setEdges({
        previous: element.scrollLeft > 2,
        next:
          element.scrollLeft + element.clientWidth < element.scrollWidth - 2,
      });
    const frame = requestAnimationFrame(measure);
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    element.addEventListener('scroll', measure, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      element.removeEventListener('scroll', measure);
    };
  }, [listings.length, expanded]);

  function move(direction: number) {
    const element = track.current;
    if (!element) return;
    const card = element.querySelector('a');
    const step = card
      ? card.getBoundingClientRect().width +
        parseFloat(getComputedStyle(element).columnGap || '0')
      : element.clientWidth;
    element.scrollBy({
      left: direction * step,
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
    });
  }

  return (
    <section
      className="mp-promotions"
      aria-labelledby="marketplace-promotions-title"
    >
      <div className="mp-promotion-heading">
        <div className="mp-home-heading">
          <MarketplaceIcon name="crown" />
          <div>
            <h2 id="marketplace-promotions-title">{t('home.promotedTitle')}</h2>
            <p>{t('home.promotedDescription')}</p>
          </div>
        </div>
        {listings.length > 1 && (
          <div className="mp-promotion-actions">
            <button
              type="button"
              className="mp-promotion-view-all"
              aria-expanded={expanded}
              aria-controls="marketplace-promotion-track"
              onClick={() => setExpanded((value) => !value)}
            >
              {t(expanded ? 'home.collapsePromoted' : 'home.viewAllPromoted')}
              <MarketplaceIcon name="arrow" />
            </button>
            {!expanded && (
              <div className="mp-carousel-buttons">
                <button
                  type="button"
                  aria-label={t('home.previousPromoted')}
                  aria-controls="marketplace-promotion-track"
                  disabled={!edges.previous}
                  onClick={() => move(-1)}
                >
                  <MarketplaceIcon name="chevron" className="rotate-180" />
                </button>
                <button
                  type="button"
                  aria-label={t('home.nextPromoted')}
                  aria-controls="marketplace-promotion-track"
                  disabled={!edges.next}
                  onClick={() => move(1)}
                >
                  <MarketplaceIcon name="chevron" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {query.isLoading ? (
        <div
          role="status"
          aria-label={t('home.loading')}
          className="mp-promotion-loading"
        >
          {[0, 1, 2].map((index) => (
            <div key={index} className="skeleton" />
          ))}
        </div>
      ) : query.isError ? (
        <div className="mp-promotion-empty" role="alert">
          <p>{t('home.promotedUnavailable')}</p>
          <button
            type="button"
            className="app-button mt-3"
            onClick={() => void query.refetch()}
          >
            {t('properties.retry')}
          </button>
        </div>
      ) : listings.length ? (
        <div
          ref={track}
          id="marketplace-promotion-track"
          className={`mp-promotion-track${expanded ? ' is-expanded' : ''}`}
          role="region"
          aria-label={t('home.promotedTitle')}
          tabIndex={expanded ? undefined : 0}
          onKeyDown={(event) => {
            if (expanded || event.target !== event.currentTarget) return;
            if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
              event.preventDefault();
              move(event.key === 'ArrowRight' ? 1 : -1);
            }
          }}
        >
          {listings.map((listing) => (
            <PropertyCard
              key={listing.id}
              listing={listing}
              variant="promoted"
            />
          ))}
        </div>
      ) : (
        <div className="mp-promotion-empty" role="status">
          <MarketplaceIcon name="crown" />
          <p>{t('home.promotedEmpty')}</p>
        </div>
      )}
    </section>
  );
}
