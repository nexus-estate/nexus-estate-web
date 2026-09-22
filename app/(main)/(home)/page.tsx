import { MarketplaceHome } from '@/components/customer/marketplace-home';
import { listingApi } from '@/lib/api/listing/listing.api';
import type { Listing } from '@/lib/api/listing/listing.types';

/** Public catalogue data: serve from cache and revalidate instead of refetching. */
const HOME_REVALIDATE_SECONDS = 60;

async function getProperties(filters: { limit: number; sort?: string }) {
  try {
    return (
      await listingApi.list(
        {
          ...filters,
          sort: filters.sort as
            'newest' | 'price_asc' | 'price_desc' | undefined,
        },
        { next: { revalidate: HOME_REVALIDATE_SECONDS } },
      )
    ).items;
  } catch {
    return [] as Listing[];
  }
}

export default async function HomePage() {
  const [featured, properties] = await Promise.all([
    getProperties({ sort: 'newest', limit: 4 }),
    getProperties({ limit: 8 }),
  ]);
  return <MarketplaceHome featured={featured} properties={properties} />;
}
