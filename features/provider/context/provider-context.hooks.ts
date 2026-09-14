'use client';
import { useQuery } from '@tanstack/react-query';
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
    enabled: providerId !== null,
  });
  const value = query.data;
  let state: ProviderLifecycleState = providerId
    ? 'PENDING_VERIFICATION'
    : 'CONTEXT_REQUIRED';
  if (!providerId && !query.isFetching) state = 'NO_PROVIDER';
  if (value?.providerStatus === 'SUSPENDED') state = 'SUSPENDED';
  else if (
    value?.verificationStatus === 'VERIFIED' &&
    value.providerStatus === 'ACTIVE' &&
    value.membershipStatus === 'ACTIVE'
  )
    state = 'ACTIVE_VERIFIED';
  else if (value?.verificationStatus === 'REJECTED') state = 'REJECTED';
  const permissions =
    value?.permissionCodes ??
    value?.permissions?.map((permission) => permission.code) ??
    [];
  return {
    ...query,
    state,
    hasProviderPermission: (code: string) =>
      state === 'ACTIVE_VERIFIED' && permissions.includes(code),
    canMutate: state === 'ACTIVE_VERIFIED',
  };
}
