import { customerApiClient } from '../client';
import type { EffectiveMarketplaceAuthorization } from './types';
export const customerAuthorizationApi = {
  effective: () =>
    customerApiClient.get<EffectiveMarketplaceAuthorization>(
      '/customers/me/authorization',
    ),
};
