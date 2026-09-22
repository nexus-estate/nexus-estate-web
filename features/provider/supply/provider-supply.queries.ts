import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { estateApi } from '@/lib/api/estate/estate.api';
import type {
  CreateEstateRequest,
  UpdateEstateRequest,
} from '@/lib/api/estate/estate.types';
import { listingApi } from '@/lib/api/listing/listing.api';
import type { Listing } from '@/lib/api/listing/listing.types';
import { useProviderContext } from '../context/provider-context.provider';
import { providerKeys } from '../query-keys';

export function useProviderProperties(enabled = true) {
  const { providerId } = useProviderContext();
  return useQuery({
    queryKey: providerKeys.properties(providerId),
    queryFn: () => estateApi.listMine(),
    enabled,
  });
}

export function useProviderListings(enabled = true) {
  const { providerId } = useProviderContext();
  return useQuery({
    queryKey: providerKeys.listings(providerId),
    queryFn: () => listingApi.mine(),
    enabled,
  });
}

export function useCreateProviderProperty() {
  const { providerId } = useProviderContext();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEstateRequest) => estateApi.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: providerKeys.properties(providerId),
      });
    },
  });
}

export function useUpdateProviderProperty() {
  const { providerId } = useProviderContext();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEstateRequest }) =>
      estateApi.update(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: providerKeys.properties(providerId),
      });
    },
  });
}

export function useArchiveProviderProperty() {
  const { providerId } = useProviderContext();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => estateApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: providerKeys.properties(providerId),
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
        queryKey: providerKeys.listings(providerId),
      });
      void queryClient.invalidateQueries({
        queryKey: providerKeys.properties(providerId),
      });
      return listing;
    },
  });
}

export function usePublishProviderListing() {
  const { providerId } = useProviderContext();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => listingApi.publish(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: providerKeys.listings(providerId),
      });
    },
  });
}

export function useArchiveProviderListing() {
  const { providerId } = useProviderContext();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => listingApi.unpublish(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: providerKeys.listings(providerId),
      });
    },
  });
}
