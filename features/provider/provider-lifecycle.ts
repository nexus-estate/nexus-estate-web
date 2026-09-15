import type { ApiError } from '@/lib/api/core/error';
import type {
  ProviderAccount,
  ProviderAuthorization,
} from '@/lib/api/provider/types';
export type ProviderLifecycleState =
  | 'LOADING'
  | 'NO_PROVIDER'
  | 'PENDING_VERIFICATION'
  | 'REJECTED'
  | 'SUSPENDED'
  | 'ACTIVE_VERIFIED'
  | 'CONTEXT_REQUIRED'
  | 'ERROR';
export function resolveProviderLifecycle(input: {
  account?: ProviderAccount | null;
  authorization?: ProviderAuthorization | null;
  accountError?: ApiError | null;
  authorizationError?: ApiError | null;
  loading: boolean;
}): ProviderLifecycleState {
  if (input.loading) return 'LOADING';
  if (
    input.accountError?.errorCode === 'PROVIDER_CONTEXT_REQUIRED' ||
    input.authorizationError?.errorCode === 'PROVIDER_CONTEXT_REQUIRED'
  )
    return 'CONTEXT_REQUIRED';
  if (
    input.accountError?.errorCode === 'PROVIDER_ACCOUNT_NOT_FOUND' &&
    !input.account
  )
    return 'NO_PROVIDER';
  const status = input.authorization?.providerStatus ?? input.account?.status;
  const verification =
    input.authorization?.verificationStatus ??
    input.account?.verificationStatus;
  if (status === 'SUSPENDED') return 'SUSPENDED';
  if (verification === 'REJECTED') return 'REJECTED';
  if (
    input.account &&
    verification === 'VERIFIED' &&
    status === 'ACTIVE' &&
    input.authorization?.membershipStatus === 'ACTIVE'
  )
    return 'ACTIVE_VERIFIED';
  if (
    input.account &&
    (verification === 'UNVERIFIED' || verification === 'PENDING')
  )
    return 'PENDING_VERIFICATION';
  return input.accountError || input.authorizationError ? 'ERROR' : 'ERROR';
}
