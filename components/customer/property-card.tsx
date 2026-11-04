'use client';

import type { Listing } from '@/lib/api/listing/listing.types';
import { EstateCard } from './estate-card';

export function PropertyCard({
  listing,
  sponsored = false,
  compact = false,
  variant = 'standard',
}: {
  listing: Listing;
  sponsored?: boolean;
  compact?: boolean;
  variant?: 'standard' | 'promoted';
}) {
  return (
    <EstateCard
      estate={listing.estate}
      href={`/properties/${listing.id}`}
      sponsored={sponsored}
      compact={compact}
      variant={variant}
    />
  );
}
