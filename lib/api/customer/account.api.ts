import { customerApiClient } from '../client';
import type { CustomerAccount } from './types';
export const customerAccountApi = {
  me: () => customerApiClient.get<CustomerAccount>('/customers/me'),
};
