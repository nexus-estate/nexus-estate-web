import { administrationApiClient } from '../client';
import type {
  ProviderRegistrationResponse,
  ProviderRegistrationReview,
} from '../provider/types';
export const providerReviewApi = {
  pending: () =>
    administrationApiClient.get<ProviderRegistrationReview[]>(
      '/administration/provider-registrations',
    ),
  detail: (accountId: string) =>
    administrationApiClient.get<ProviderRegistrationReview>(
      `/administration/provider-registrations/${accountId}`,
    ),
  approve: (accountId: string) =>
    administrationApiClient.post<ProviderRegistrationResponse>(
      `/administration/provider-registrations/${accountId}/approve`,
    ),
};
