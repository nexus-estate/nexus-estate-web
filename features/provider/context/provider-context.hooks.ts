'use client';
import { useQuery } from '@tanstack/react-query';
import { ApiError } from '@/lib/api/core/error';
import { providerApi } from '@/lib/api/provider/provider.api';
import { useProviderContext } from './provider-context.provider';
export type ProviderLifecycleState =
  | 'NO_PROVIDER'
  | 'PENDING_VERIFICATION'
  | 'REJECTED'
  | 'SUSPENDED'
  | 'ACTIVE_VERIFIED'
  | 'CONTEXT_REQUIRED';
export function useProviderAuthorization() {
  const { providerId } = useProviderContext();
  const query = useQuery({
    queryKey: ['provider', providerId, 'authorization'],
    queryFn: providerApi.authorization,
    enabled: true,
  });
  const value = query.data;
  const errorCode =
    query.error instanceof ApiError ? query.error.errorCode : undefined;
  let state: ProviderLifecycleState =
    errorCode === 'PROVIDER_CONTEXT_REQUIRED'
      ? 'CONTEXT_REQUIRED'
      : errorCode === 'PROVIDER_ACCOUNT_NOT_FOUND'
        ? 'NO_PROVIDER'
        : value
          ? 'PENDING_VERIFICATION'
          : providerId
            ? 'PENDING_VERIFICATION'
            : 'CONTEXT_REQUIRED';
  if (value?.providerStatus === 'SUSPENDED') state = 'SUSPENDED';
  else if (
    value?.verificationStatus === 'VERIFIED' &&
    value.providerStatus === 'ACTIVE' &&
    value.membershipStatus === 'ACTIVE'
  )
    state = 'ACTIVE_VERIFIED';
  else if (value?.verificationStatus === 'REJECTED') state = 'REJECTED';
  const permissions =
    value?.permissions.map((permission) => permission.code) ?? [];
  return {
    ...query,
    state,
    hasProviderPermission: (code: string) =>
      state === 'ACTIVE_VERIFIED' && permissions.includes(code),
    canMutate: state === 'ACTIVE_VERIFIED',
  };
}
