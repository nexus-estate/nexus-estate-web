import type { Estate } from '@/lib/api/estate/estate.types';
import type { Listing } from '@/lib/api/listing/listing.types';
import { estateListings, publicListings } from './property-visibility';
const estate = {
  id: 'estate',
  providerId: 'provider',
  status: 'ACTIVE',
} as Estate;
const listing = {
  id: 'draft',
  estateId: 'estate',
  providerId: 'provider',
  status: 'DRAFT',
} as Listing;
it('does not treat an active estate or a draft as public', () => {
  expect(publicListings(estate, [])).toEqual([]);
  expect(publicListings(estate, [listing])).toEqual([]);
});
it('matches public visibility independently of promotions', () => {
  const published = { ...listing, status: 'PUBLISHED' as const };
  expect(publicListings(estate, [published])).toEqual([published]);
  expect(publicListings({ ...estate, status: 'DRAFT' }, [published])).toEqual(
    [],
  );
  expect(
    publicListings({ ...estate, status: 'ARCHIVED' }, [published]),
  ).toEqual([]);
});
it('groups multiple listings without crossing estate or provider ownership', () => {
  const published = { ...listing, id: 'public', status: 'PUBLISHED' as const };
  const all = [
    listing,
    published,
    { ...published, providerId: 'other' },
    { ...published, estateId: 'other' },
  ];
  expect(estateListings(estate, all)).toEqual([listing, published]);
  expect(publicListings(estate, all)).toEqual([published]);
});
