import { providerApiClient } from '../client';
import type { ProviderAccount, ProviderAuthorization } from './types';
export const providerApi = {
  register: <T = unknown>(data: Record<string, unknown>) =>
    providerApiClient.post<T>('/providers/register', data),
  registerFromCustomer: <T = unknown>(data: Record<string, unknown>) =>
    providerApiClient.post<T>('/providers/register/from-customer', data),
  profile: () => providerApiClient.get<ProviderAccount>('/providers/me'),
  authorization: () =>
    providerApiClient.get<ProviderAuthorization>('/providers/me/authorization'),
  createAccount: <T = ProviderAccount>(data: Record<string, unknown>) =>
    providerApiClient.post<T>('/provider/account', data),
  account: () => providerApiClient.get<ProviderAccount>('/provider/account'),
  updateAccount: <T = ProviderAccount>(data: Record<string, unknown>) =>
    providerApiClient.patch<T>('/provider/account', data),
};
