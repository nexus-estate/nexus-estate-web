import { publicApiClient, providerApiClient } from '../client';
import type {
  CreateProviderAccountRequest,
  RegisterProviderRequest,
  RegisterProviderFromCustomerRequest,
  ProviderAccount,
  ProviderAuthorization,
  ProviderRegistrationResponse,
  UpdateProviderAccountRequest,
} from './types';
export const providerApi = {
  register: (data: RegisterProviderRequest) =>
    publicApiClient.post<ProviderRegistrationResponse>(
      '/providers/register',
      data,
    ),
  registerFromCustomer: (data: RegisterProviderFromCustomerRequest) =>
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
