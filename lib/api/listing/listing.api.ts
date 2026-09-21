import { publicApiClient, providerApiClient } from '../client';
import type {
  CreateListingInput,
  Listing,
  ListingPageResponse,
  ListingQuery,
} from './listing.types';

export const listingApi = {
  list(query: ListingQuery = {}) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '')
        params.set(key, String(value));
    });
    const queryString = params.toString();
    return publicApiClient.get<ListingPageResponse>(
      `/listings${queryString ? `?${queryString}` : ''}`,
    );
  },

  getById(id: string) {
    return publicApiClient.get<Listing>(`/listings/${id}`);
  },

  create(data: CreateListingInput) {
    return providerApiClient.post<Listing>('/listings', data);
  },

  publish(id: string) {
    return providerApiClient.post<Listing>(`/listings/${id}/publish`);
  },

  mine() {
    return providerApiClient.get<Listing[]>('/listings/mine');
  },
};
