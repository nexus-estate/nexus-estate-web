import { customerApiClient } from '../client';
import type { EffectiveAuthorization } from './types';
export const customerAuthorizationApi = {
  effective: () =>
    customerApiClient.get<EffectiveAuthorization>(
      '/customers/me/authorization',
    ),
};
