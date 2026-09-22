import type { Listing } from './api/listing/listing.types';
import {
  absoluteUrl,
  buildBreadcrumbJsonLd,
  buildListingDescription,
  buildListingJsonLd,
  listingPath,
  truncate,
} from './seo';

function makeListing(overrides: Partial<Listing['estate']> = {}): Listing {
  return {
    id: 'listing-1',
    estateId: 'estate-1',
    providerId: 'provider-1',
    status: 'PUBLISHED',
    publishedAt: '2026-02-01T00:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-02-01T00:00:00.000Z',
    estate: {
      id: 'estate-1',
      title: 'Sunrise apartment',
      description: 'Two bedroom apartment with a river view.',
      type: 'APARTMENT',
      purpose: 'SALE',
      price: 3500000000,
      area: 82,
      bedrooms: 2,
      bathrooms: 2,
      floors: 1,
      addressLine: '12 Riverside Road',
      provinceId: 'province-1',
      wardId: 'ward-1',
      latitude: 10.7769,
      longitude: 106.7009,
      province: { id: 'province-1', code: 'P1', name: 'Ho Chi Minh City' },
      ward: { id: 'ward-1', code: 'W1', name: 'Ward 1' },
      ...overrides,
    },
  };
}

describe('SEO helpers', () => {
  describe('absoluteUrl', () => {
    afterEach(() => {
      delete process.env.NEXT_PUBLIC_MARKETPLACE_URL;
    });

    it('prefixes the configured marketplace origin', () => {
      process.env.NEXT_PUBLIC_MARKETPLACE_URL = 'https://nexus.example.com/';
      expect(absoluteUrl('/properties/1')).toBe(
        'https://nexus.example.com/properties/1',
      );
      expect(absoluteUrl('properties/1')).toBe(
        'https://nexus.example.com/properties/1',
      );
    });

    it('degrades to a relative path when the origin is not configured', () => {
      expect(absoluteUrl('/properties/1')).toBe('/properties/1');
    });
  });

  describe('truncate', () => {
    it('collapses whitespace and clamps to the limit', () => {
      expect(truncate('  a\n\n b  ')).toBe('a b');
      const result = truncate('x'.repeat(50), 10);
      expect(result).toHaveLength(10);
      expect(result.endsWith('…')).toBe(true);
    });

    it('returns an empty string for missing input', () => {
      expect(truncate(null)).toBe('');
      expect(truncate(undefined)).toBe('');
    });
  });

  describe('buildListingDescription', () => {
    it('joins the description with the ward and province', () => {
      expect(buildListingDescription(makeListing())).toBe(
        'Two bedroom apartment with a river view. · Ward 1, Ho Chi Minh City',
      );
    });

    it('falls back to the location when there is no description', () => {
      expect(buildListingDescription(makeListing({ description: null }))).toBe(
        'Ward 1, Ho Chi Minh City',
      );
    });
  });

  describe('listingPath', () => {
    it('builds the public detail path', () => {
      expect(listingPath('abc')).toBe('/properties/abc');
    });
  });

  describe('buildBreadcrumbJsonLd', () => {
    it('numbers the items in order', () => {
      const jsonLd = buildBreadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name: 'Properties', path: '/properties' },
      ]);
      expect(jsonLd['@type']).toBe('BreadcrumbList');
      expect(jsonLd.itemListElement).toEqual([
        { '@type': 'ListItem', position: 1, name: 'Home', item: '/' },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Properties',
          item: '/properties',
        },
      ]);
    });
  });

  describe('buildListingJsonLd', () => {
    it('describes the listing with price, area and address', () => {
      const jsonLd = buildListingJsonLd(makeListing());
      expect(jsonLd['@type']).toBe('RealEstateListing');
      expect(jsonLd.name).toBe('Sunrise apartment');
      expect(jsonLd.datePosted).toBe('2026-02-01T00:00:00.000Z');
      expect(jsonLd.address).toEqual({
        '@type': 'PostalAddress',
        streetAddress: '12 Riverside Road',
        addressLocality: 'Ward 1',
        addressRegion: 'Ho Chi Minh City',
        addressCountry: 'VN',
      });
      expect(jsonLd.floorSize).toEqual({
        '@type': 'QuantitativeValue',
        value: 82,
        unitCode: 'MTK',
      });
      expect(jsonLd.offers).toMatchObject({
        price: 3500000000,
        priceCurrency: 'VND',
        availability: 'https://schema.org/InStock',
      });
      expect(jsonLd.geo).toEqual({
        '@type': 'GeoCoordinates',
        latitude: 10.7769,
        longitude: 106.7009,
      });
    });

    it('marks non-published listings as out of stock', () => {
      const listing = makeListing();
      listing.status = 'ARCHIVED';
      const jsonLd = buildListingJsonLd(listing);
      expect(jsonLd.offers).toMatchObject({
        availability: 'https://schema.org/OutOfStock',
      });
    });

    it('omits optional blocks the catalogue cannot provide', () => {
      const jsonLd = buildListingJsonLd(
        makeListing({
          area: null,
          price: 0,
          latitude: null,
          longitude: null,
          description: null,
        }),
      );
      expect(jsonLd.floorSize).toBeUndefined();
      expect(jsonLd.offers).toBeUndefined();
      expect(jsonLd.geo).toBeUndefined();
      // Falls back to the title so the structured data is never empty.
      expect(jsonLd.description).toBe('Sunrise apartment');
    });
  });
});
