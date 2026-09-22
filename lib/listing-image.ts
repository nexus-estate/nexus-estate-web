import type { Listing } from '@/lib/api/listing/listing.types';

/**
 * Placeholder artwork per estate type.
 *
 * The API contract still has no media collection, so listings render curated
 * fallback photography. Replace this module with the real gallery once
 * `images` is available on `ListingEstate`.
 */
const FALLBACK_IMAGES = {
  apartment: '/images/properties/residence-danang.webp',
  house: '/images/properties/penthouse-saigon.webp',
  villa: '/images/properties/villa-dalat.webp',
  land: '/images/hero-villa.webp',
  office: '/images/properties/residence-danang.webp',
} as const;

export type ListingImageType = keyof typeof FALLBACK_IMAGES;

export function getListingImageType(listing: Listing): ListingImageType {
  const type = listing.estate.type.toLowerCase();
  return (type in FALLBACK_IMAGES ? type : 'house') as ListingImageType;
}

export function getListingImage(listing: Listing): string {
  return FALLBACK_IMAGES[getListingImageType(listing)];
}
