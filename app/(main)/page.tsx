import { MarketplaceHome } from '@/components/customer/marketplace-home';
import { propertyApi } from '@/lib/api/property/property.api';
import type {
  Property,
  PropertyListResponse,
} from '@/lib/api/property/property.types';

function items(response: PropertyListResponse | Property[]): Property[] {
  if (Array.isArray(response)) return response;
  return response.data ?? response.properties ?? response.items ?? [];
}

async function getProperties(filters: { limit: number; sort?: string }) {
  try {
    return items(await propertyApi.list(filters, { next: { revalidate: 60 } }));
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [featured, properties] = await Promise.all([
    getProperties({ sort: 'views', limit: 4 }),
    getProperties({ limit: 8 }),
  ]);
  return <MarketplaceHome featured={featured} properties={properties} />;
}
