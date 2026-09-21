'use client';
import { useQuery } from '@tanstack/react-query';
import { ApiError } from '@/lib/api/core/error';
import { providerApi } from '@/lib/api/provider/provider.api';
import { resolveProviderLifecycle } from '../provider-lifecycle';
import { providerKeys } from '../query-keys';
import { useProviderContext } from './provider-context.provider';
export function useProviderAuthorization() {
  const { providerId } = useProviderContext();
  const query = useQuery({
    queryKey: providerKeys.authorization(providerId),
    queryFn: providerApi.authorization,
    enabled: true,
  });
  const value = query.data;
  const state = resolveProviderLifecycle({
    authorization: value,
    authorizationError: query.error instanceof ApiError ? query.error : null,
    loading: query.isLoading,
  });
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
