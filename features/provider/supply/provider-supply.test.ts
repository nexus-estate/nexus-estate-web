import {
  getPortalBreadcrumbs,
  getPortalRouteMetadata,
} from '@/components/portal/route-metadata';
import { providerSupplyKeys } from '@/features/provider/supply/provider-supply.queries';
import type { Estate } from '@/lib/api/estate/estate.types';

describe('provider supply routes', () => {
  it('resolves provider supply breadcrumbs in navigation order', () => {
    expect(
      getPortalBreadcrumbs('/provider/properties/new').map(
        ({ labelKey }) => labelKey,
      ),
    ).toEqual([
      'navigation.provider',
      'navigation.providerProperties',
      'navigation.providerPropertyNew',
    ]);
    expect(
      getPortalBreadcrumbs('/provider/listings/new').map(
        ({ labelKey }) => labelKey,
      ),
    ).toEqual([
      'navigation.provider',
      'navigation.providerListings',
      'navigation.providerListingNew',
    ]);
    expect(getPortalRouteMetadata('/provider/properties')?.labelKey).toBe(
      'navigation.providerProperties',
    );
    expect(getPortalRouteMetadata('/provider/listings')?.labelKey).toBe(
      'navigation.providerListings',
    );
  });

  it('keeps the generic provider route as fallback for supply lists', () => {
    expect(getPortalRouteMetadata('/provider/properties')?.match).toBe(
      'prefix',
    );
    expect(getPortalRouteMetadata('/provider/listings/extra')?.labelKey).toBe(
      'navigation.providerListings',
    );
  });
});

describe('provider supply query keys', () => {
  it('scopes every key by the active provider id', () => {
    expect(providerSupplyKeys.properties('provider-1')).toEqual([
      'provider-workspace',
      'provider-1',
      'properties',
    ]);
    expect(providerSupplyKeys.listings('provider-1')).toEqual([
      'provider-workspace',
      'provider-1',
      'listings',
    ]);
  });

  it('falls back to the implicit bucket when no provider id is set', () => {
    expect(providerSupplyKeys.properties(null)).toEqual([
      'provider-workspace',
      'implicit',
      'properties',
    ]);
    expect(providerSupplyKeys.listings(null)).toEqual([
      'provider-workspace',
      'implicit',
      'listings',
    ]);
  });

  it('never exposes generic private keys', () => {
    for (const providerId of ['provider-1', null]) {
      for (const key of [
        providerSupplyKeys.properties(providerId),
        providerSupplyKeys.listings(providerId),
      ]) {
        expect(key[0]).toBe('provider-workspace');
        expect(key).toHaveLength(3);
      }
    }
  });
});

describe('estate wire contract (API #37)', () => {
  const estate = {
    id: 'estate-1',
    providerId: 'provider-1',
    title: 'Contract estate',
    description: null,
    type: 'APARTMENT' as const,
    purpose: 'SALE' as const,
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
  } satisfies Estate;

  it('uses providerId as the canonical owner', () => {
    expect(estate.providerId).toBe('provider-1');
  });

  it('always hydrates the required province and ward references', () => {
    expect(estate.province).toEqual({
      id: 'province-1',
      code: '79',
      name: 'Ho Chi Minh City',
    });
    expect(estate.ward).toEqual({
      id: 'ward-1',
      code: '26734',
      name: 'Ben Nghe',
    });
    const wire: Record<string, unknown> = { ...estate };
    // Contract requires non-null relations, never a null fallback.
    expect(wire).not.toHaveProperty('province', null);
    expect(wire).not.toHaveProperty('ward', null);
  });

  it('never carries legacy ownership or internal wire fields', () => {
    const wire: Record<string, unknown> = { ...estate };
    expect(wire).not.toHaveProperty('customerId');
    expect(wire).not.toHaveProperty('deletedAt');
    expect(wire).not.toHaveProperty('createdBy');
    expect(wire).not.toHaveProperty('updatedBy');
  });
});
