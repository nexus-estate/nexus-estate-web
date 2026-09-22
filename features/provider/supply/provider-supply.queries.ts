import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { ApiError } from '@/lib/api/core/error';
import { estateApi } from '@/lib/api/estate/estate.api';
import type {
  CreateEstateRequest,
  UpdateEstateRequest,
} from '@/lib/api/estate/estate.types';
import { listingApi } from '@/lib/api/listing/listing.api';
import type {
  Listing,
  ListingEligibleProperty,
} from '@/lib/api/listing/listing.types';
import { useProviderContext } from '../context/provider-context.provider';
import { providerKeys } from '../query-keys';

function refreshAuthorizationOnForbidden(
  error: unknown,
  queryClient: ReturnType<typeof useQueryClient>,
  providerId: string | null,
) {
  if (error instanceof ApiError && error.status === 403) {
    void queryClient.invalidateQueries({
      queryKey: providerKeys.authorization(providerId),
    });
  }
}

function invalidateEligibleProperties(
  queryClient: ReturnType<typeof useQueryClient>,
  providerId: string | null,
) {
  void queryClient.invalidateQueries({
    queryKey: providerKeys.eligibleProperties(providerId),
  });
}

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

export function useListingEligibleProperties(enabled = true) {
  const { providerId } = useProviderContext();
  const queryClient = useQueryClient();
  return useQuery<ListingEligibleProperty[]>({
    queryKey: providerKeys.eligibleProperties(providerId),
    queryFn: async () => {
      try {
        return await listingApi.eligibleProperties();
      } catch (error) {
        refreshAuthorizationOnForbidden(error, queryClient, providerId);
        throw error;
      }
    },
    enabled,
  });
}

export function useProviderProperty(id: string, enabled = true) {
  const { providerId } = useProviderContext();
  return useQuery({
    queryKey: providerKeys.property(providerId, id),
    queryFn: () => estateApi.getMine(id),
    enabled: enabled && Boolean(id),
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
      invalidateEligibleProperties(queryClient, providerId);
    },
    onError: (error) =>
      refreshAuthorizationOnForbidden(error, queryClient, providerId),
  });
}

export function useUpdateProviderProperty() {
  const { providerId } = useProviderContext();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEstateRequest }) =>
      estateApi.update(id, data),
    onSuccess: (updated) => {
      void queryClient.invalidateQueries({
        queryKey: providerKeys.properties(providerId),
      });
      void queryClient.invalidateQueries({
        queryKey: providerKeys.property(providerId, updated.id),
      });
      invalidateEligibleProperties(queryClient, providerId);
    },
    onError: (error) =>
      refreshAuthorizationOnForbidden(error, queryClient, providerId),
  });
}

export function useArchiveProviderProperty() {
  const { providerId } = useProviderContext();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => estateApi.remove(id),
    onSuccess: (_result, id) => {
      void queryClient.invalidateQueries({
        queryKey: providerKeys.properties(providerId),
      });
      void queryClient.invalidateQueries({
        queryKey: providerKeys.property(providerId, id),
      });
      invalidateEligibleProperties(queryClient, providerId);
    },
    onError: (error) =>
      refreshAuthorizationOnForbidden(error, queryClient, providerId),
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
      invalidateEligibleProperties(queryClient, providerId);
      return listing;
    },
    onError: (error) =>
      refreshAuthorizationOnForbidden(error, queryClient, providerId),
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
    onError: (error) =>
      refreshAuthorizationOnForbidden(error, queryClient, providerId),
  });
}

export function useArchiveProviderListing() {
  const { providerId } = useProviderContext();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => listingApi.archive(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: providerKeys.listings(providerId),
      });
    },
    onError: (error) =>
      refreshAuthorizationOnForbidden(error, queryClient, providerId),
  });
}
