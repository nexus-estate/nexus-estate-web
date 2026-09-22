import { MarketplacePageSkeleton } from '@/components/ui/Skeleton';

/**
 * Lives in the (list) group so it is not an ancestor of /properties/[id].
 * A boundary above the detail page would make its `notFound()` return 200.
 */
export default function PropertiesLoading() {
  return <MarketplacePageSkeleton />;
}
