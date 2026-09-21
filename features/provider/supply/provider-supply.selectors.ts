import type { Estate } from '@/lib/api/estate/estate.types';
import type { Listing } from '@/lib/api/listing/listing.types';

/**
 * The API allows one non-deleted Listing per Estate, so an Estate already
 * referenced by a Listing cannot back another one. The backend conflict check
 * remains authoritative for races; this selector only narrows the UI options.
 */
export function getListingEligibleProperties(
  properties: readonly Estate[],
  listings: readonly Pick<Listing, 'estateId'>[],
): Estate[] {
  const listedEstateIds = new Set(listings.map((listing) => listing.estateId));
  return properties.filter((estate) => !listedEstateIds.has(estate.id));
}
