import { providerApiClient } from '../client';
import { assertDurationDays } from './promotion.validation';

export interface CreateBannerRequest {
  promotionId: string;
  durationDays: number;
}

export interface ListingBanner {
  id: string;
  listingId: string;
  promotionId: string;
  priceSnapshot: number;
  startAt: string;
  endAt: string;
}

export const promotionApi = {
  createBanner: (listingId: string, data: CreateBannerRequest) => {
    assertDurationDays(data.durationDays);
    return providerApiClient.post<ListingBanner>(
      `/listings/${encodeURIComponent(listingId)}/promotions/${encodeURIComponent(data.promotionId)}`,
      { durationDays: data.durationDays },
    );
  },
};
