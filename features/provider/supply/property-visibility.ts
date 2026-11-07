import type { Estate } from '@/lib/api/estate/estate.types';
import type { Listing } from '@/lib/api/listing/listing.types';

/** Mirrors ListingRepo.findPublic/findById(publicOnly), not estate activation. */
export function publicListings(estate: Estate, listings: Listing[]) {
  return estate.status === 'ACTIVE'
    ? listings.filter(
        (listing) =>
          listing.estateId === estate.id &&
          listing.providerId === estate.providerId &&
          listing.status === 'PUBLISHED',
      )
    : [];
}

export function estateListings(estate: Estate, listings: Listing[]) {
  return listings.filter(
    (listing) =>
      listing.estateId === estate.id &&
      listing.providerId === estate.providerId,
  );
}
