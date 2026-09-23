import type { MetadataRoute } from 'next';
import { listingApi } from '@/lib/api/listing/listing.api';
import { tryGetWebPlatform } from '@/lib/platform/config';
import { absoluteUrl, listingPath } from '@/lib/seo';

/**
 * Generated on request (the catalogue is empty during a database-less build),
 * while the upstream listing calls stay cached for an hour.
 */
export const dynamic = 'force-dynamic';

const PAGE_SIZE = 100;
const MAX_PAGES = 5;
const LISTING_REVALIDATE_SECONDS = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const platform = tryGetWebPlatform();

  // Internal runtimes expose no public catalogue.
  if (platform && platform !== 'marketplace') return [];

  const entries: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl('/'),
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: absoluteUrl('/properties'),
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
  ];

  const listings: MetadataRoute.Sitemap = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    try {
      const response = await listingApi.list(
        { page, limit: PAGE_SIZE, sort: 'newest' },
        { next: { revalidate: LISTING_REVALIDATE_SECONDS } },
      );
      listings.push(
        ...response.items.map((listing) => ({
          url: absoluteUrl(listingPath(listing.id)),
          lastModified: new Date(listing.updatedAt ?? listing.createdAt),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        })),
      );
      if (!response.meta.hasNextPage) break;
    } catch {
      // The catalogue is unavailable (e.g. during a build without the API
      // running). Ship the static routes instead of failing the build.
      break;
    }
  }

  return [...entries, ...listings];
}
