'use client';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ApiError } from '@/lib/api/core/error';
import { providerApi } from '@/lib/api/provider/provider.api';
import { resolveProviderLifecycle } from './provider-lifecycle';
export type ProviderEntryState =
  | 'LOADING'
  | 'NO_PROVIDER'
  | 'PENDING'
  | 'REJECTED'
  | 'SUSPENDED'
  | 'ACTIVE'
  | 'CONTEXT_REQUIRED'
  | 'ERROR';
export function useProviderEntryState(enabled = true) {
  const account = useQuery({
    queryKey: ['customer', 'provider-entry', 'account'],
    queryFn: providerApi.profile,
    enabled,
  });
  const authorization = useQuery({
    queryKey: ['customer', 'provider-entry', 'authorization'],
    queryFn: providerApi.authorization,
    enabled: enabled && Boolean(account.data),
  });
  const accountError = account.error instanceof ApiError ? account.error : null;
  const authorizationError =
    authorization.error instanceof ApiError ? authorization.error : null;
  useEffect(() => {
    if (authorization.data?.providerId)
      localStorage.setItem(
        'nexus.provider.active_id',
        authorization.data.providerId,
      );
  }, [authorization.data?.providerId]);
  const lifecycle = resolveProviderLifecycle({
    account: account.data,
    authorization: authorization.data,
    accountError,
    authorizationError,
    loading: account.isLoading || authorization.isLoading,
  });
  const state: ProviderEntryState =
    lifecycle === 'PENDING_VERIFICATION'
      ? 'PENDING'
      : lifecycle === 'ACTIVE_VERIFIED'
        ? 'ACTIVE'
        : lifecycle;
  return {
    account,
    authorization,
    state,
    isLoading: account.isLoading || authorization.isLoading,
  };
}
