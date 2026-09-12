import { apiClient } from '../client';
import type { PaymentOrder, PostingPackage } from './payment.types';

export const paymentApi = {
  getPackages() {
    return apiClient.get<PostingPackage[]>('/payments/packages');
  },

  create(data: { listingId: string; packageId: string; provider?: string }) {
    return apiClient.post<PaymentOrder>('/payments/create', data);
  },
};
