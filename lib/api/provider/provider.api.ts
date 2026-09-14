import { providerApiClient } from '../client';
import type {
  CreateProviderAccountRequest,
  ProviderAccount,
  ProviderAuthorization,
  ProviderRegistrationResponse,
  UpdateProviderAccountRequest,
} from './types';
export const providerApi = {
  register: (data: CreateProviderAccountRequest) =>
    providerApiClient.post<ProviderRegistrationResponse>(
      '/providers/register',
      data,
    ),
  registerFromCustomer: (data: CreateProviderAccountRequest) =>
    providerApiClient.post<ProviderRegistrationResponse>(
      '/providers/register/from-customer',
      data,
    ),
  profile: () => providerApiClient.get<ProviderAccount>('/providers/me'),
  authorization: () =>
    providerApiClient.get<ProviderAuthorization>('/providers/me/authorization'),
  createAccount: (data: CreateProviderAccountRequest) =>
    providerApiClient.post<ProviderAccount>('/provider/account', data),
  account: () => providerApiClient.get<ProviderAccount>('/provider/account'),
  updateAccount: (data: UpdateProviderAccountRequest) =>
    providerApiClient.patch<ProviderAccount>('/provider/account', data),
};
