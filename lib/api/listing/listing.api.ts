import { publicApiClient, providerApiClient } from '../client';
import type {
  CreateListingInput,
  ListingEligibleProperty,
  Listing,
  ListingPageResponse,
  ListingQuery,
} from './listing.types';

export const listingApi = {
  /**
   * `init` is forwarded so Server Components can opt into caching
   * (`{ next: { revalidate } }`) instead of fetching on every request.
   */
  list(query: ListingQuery = {}, init?: RequestInit) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '')
        params.set(key, String(value));
    });
    const queryString = params.toString();
    return publicApiClient.get<ListingPageResponse>(
      `/listings${queryString ? `?${queryString}` : ''}`,
      init,
    );
  },

  getById(id: string, init?: RequestInit) {
    return publicApiClient.get<Listing>(`/listings/${id}`, init);
  },

  create(data: CreateListingInput) {
    return providerApiClient.post<Listing>('/listings', data);
  },

  eligibleProperties() {
    return providerApiClient.get<ListingEligibleProperty[]>(
      '/listings/eligible-properties',
    );
  },

  publish(id: string) {
    return providerApiClient.post<Listing>(`/listings/${id}/publish`);
  },

  archive(id: string) {
    return providerApiClient.post<Listing>(`/listings/${id}/archive`);
  },

  mine() {
    return providerApiClient.get<Listing[]>('/listings/mine');
  },
};
