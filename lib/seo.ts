import type { Listing } from '@/lib/api/listing/listing.types';
import { getListingImage } from '@/lib/listing-image';
import { tryGetPlatformBaseUrl } from '@/lib/platform/urls';

/** Public origin of the marketplace, when configured. */
export function getSiteUrl(): string | undefined {
  return tryGetPlatformBaseUrl('marketplace') ?? undefined;
}

/**
 * Absolute URL for metadata/structured data. Falls back to the relative path
 * when the origin is not configured so pages never crash on missing env.
 */
export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return base ? `${base}${normalized}` : normalized;
}

export function truncate(text: string | null | undefined, max = 160): string {
  if (!text) return '';
  const collapsed = text.replace(/\s+/g, ' ').trim();
  return collapsed.length <= max
    ? collapsed
    : `${collapsed.slice(0, max - 1).trimEnd()}…`;
}

export function listingPath(id: string): string {
  return `/properties/${id}`;
}

export function buildListingDescription(listing: Listing, max = 160): string {
  const { estate } = listing;
  const location = [estate.ward?.name, estate.province?.name]
    .filter(Boolean)
    .join(', ');
  const detail = truncate(estate.description, max - location.length - 3);
  return detail ? `${detail} · ${location}` : location;
}

export function buildBreadcrumbJsonLd(
  items: Array<{ name: string; path: string }>,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/**
 * RealEstateListing structured data. Google uses this for rich results on
 * property listings, so it carries price, area and address.
 */
export function buildListingJsonLd(listing: Listing): Record<string, unknown> {
  const { estate } = listing;
  const url = absoluteUrl(listingPath(listing.id));

  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: estate.title,
    description: truncate(estate.description, 300) || estate.title,
    url,
    image: absoluteUrl(listingImagePath(listing)),
    datePosted: listing.publishedAt ?? listing.createdAt,
    address: {
      '@type': 'PostalAddress',
      streetAddress: estate.addressLine,
      addressLocality: estate.ward?.name,
      addressRegion: estate.province?.name,
      addressCountry: 'VN',
    },
    ...(estate.latitude !== null && estate.longitude !== null
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: estate.latitude,
            longitude: estate.longitude,
          },
        }
      : {}),
    ...(estate.area
      ? {
          floorSize: {
            '@type': 'QuantitativeValue',
            value: estate.area,
            unitCode: 'MTK',
          },
        }
      : {}),
    ...(estate.bedrooms ? { numberOfRooms: estate.bedrooms } : {}),
    ...(estate.price
      ? {
          offers: {
            '@type': 'Offer',
            price: estate.price,
            priceCurrency: 'VND',
            availability:
              listing.status === 'PUBLISHED'
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            url,
          },
        }
      : {}),
  };
}

/** Local fallback artwork, shared with the card and detail surfaces. */
function listingImagePath(listing: Listing): string {
  return getListingImage(listing);
}
