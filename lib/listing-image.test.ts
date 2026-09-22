import type { Listing } from './api/listing/listing.types';
import { getListingImage, getListingImageType } from './listing-image';

function makeListing(type: string): Listing {
  return {
    id: 'listing-1',
    estateId: 'estate-1',
    providerId: 'provider-1',
    status: 'PUBLISHED',
    publishedAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    estate: {
      id: 'estate-1',
      title: 'Test estate',
      description: null,
      type: type as Listing['estate']['type'],
      purpose: 'SALE',
      price: 1000,
      area: null,
      bedrooms: null,
      bathrooms: null,
      floors: null,
      addressLine: '1 Main Street',
      provinceId: 'province-1',
      wardId: 'ward-1',
      latitude: null,
      longitude: null,
      province: { id: 'province-1', code: 'P1', name: 'Province' },
      ward: { id: 'ward-1', code: 'W1', name: 'Ward' },
    },
  };
}

describe('listing fallback artwork', () => {
  it('maps estate types to curated artwork', () => {
    expect(getListingImageType(makeListing('apartment'))).toBe('apartment');
    expect(getListingImage(makeListing('villa'))).toMatch(/villa/);
  });

  it('accepts lowercase API values and unknown types fall back to house', () => {
    expect(getListingImageType(makeListing('APARTMENT'))).toBe('apartment');
    expect(getListingImageType(makeListing('castle'))).toBe('house');
    expect(getListingImage(makeListing('castle'))).toBe(
      getListingImage(makeListing('house')),
    );
  });
});
