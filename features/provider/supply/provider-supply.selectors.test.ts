import type { Estate } from '@/lib/api/estate/estate.types';
import { getListingEligibleProperties } from './provider-supply.selectors';

function estate(id: string): Estate {
  return {
    id,
    providerId: 'provider-1',
    title: `Estate ${id}`,
    description: null,
    type: 'APARTMENT',
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
    province: { id: 'province-1', code: '79', name: 'Ho Chi Minh City' },
    ward: { id: 'ward-1', code: '26734', name: 'Ben Nghe' },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

describe('getListingEligibleProperties', () => {
  it('returns every property when no listing exists', () => {
    const properties = [estate('e1'), estate('e2')];

    expect(getListingEligibleProperties(properties, [])).toEqual(properties);
  });

  it('excludes properties that already back a listing', () => {
    const properties = [estate('e1'), estate('e2'), estate('e3')];
    const listings = [{ estateId: 'e2' }, { estateId: 'e1' }];

    expect(getListingEligibleProperties(properties, listings)).toEqual([
      estate('e3'),
    ]);
  });

  it('excludes every property when all are already listed', () => {
    const properties = [estate('e1'), estate('e2')];
    const listings = [{ estateId: 'e2' }, { estateId: 'e1' }];

    expect(getListingEligibleProperties(properties, listings)).toEqual([]);
  });

  it('returns an empty array without properties', () => {
    expect(getListingEligibleProperties([], [{ estateId: 'e1' }])).toEqual([]);
  });

  it('ignores listing rows without a matching property', () => {
    const properties = [estate('e1')];

    expect(
      getListingEligibleProperties(properties, [{ estateId: 'ghost' }]),
    ).toEqual(properties);
  });
});
