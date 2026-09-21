import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { estateApi } from '@/lib/api/estate/estate.api';
import type { CreateEstateRequest } from '@/lib/api/estate/estate.types';
import { listingApi } from '@/lib/api/listing/listing.api';
import type { Listing } from '@/lib/api/listing/listing.types';
import { useProviderContext } from '../context/provider-context.provider';

/**
 * Provider-private query keys. Every key is scoped by the active provider id
 * (`null` while the context is implicit) so switching provider context
 * invalidates or removes exactly one provider's cache and never leaks private
 * supply data across providers.
 */
export const providerSupplyKeys = {
  all: (providerId: string | null) => [
    'provider-workspace',
    providerId ?? 'implicit',
  ],
  properties: (providerId: string | null) => [
    'provider-workspace',
    providerId ?? 'implicit',
    'properties',
  ],
  listings: (providerId: string | null) => [
    'provider-workspace',
    providerId ?? 'implicit',
    'listings',
  ],
};

export function useProviderProperties() {
  const { providerId } = useProviderContext();
  return useQuery({
    queryKey: providerSupplyKeys.properties(providerId),
    queryFn: () => estateApi.listMine(),
  });
}

export function useProviderListings() {
  const { providerId } = useProviderContext();
  return useQuery({
    queryKey: providerSupplyKeys.listings(providerId),
    queryFn: () => listingApi.mine(),
  });
}

export function useCreateProviderProperty() {
  const { providerId } = useProviderContext();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEstateRequest) => estateApi.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: providerSupplyKeys.properties(providerId),
      });
    },
  });
}

/**
 * Creates a DRAFT listing. Publishing is an explicit lifecycle command and is
 * never part of the create flow.
 */
export function useCreateProviderListing() {
  const { providerId } = useProviderContext();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { estateId: string }) => listingApi.create(data),
    onSuccess: (listing: Listing) => {
      void queryClient.invalidateQueries({
        queryKey: providerSupplyKeys.listings(providerId),
      });
      void queryClient.invalidateQueries({
        queryKey: providerSupplyKeys.properties(providerId),
      });
      return listing;
    },
  });
}
