'use client';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ApiError } from '@/lib/api/core/error';
import { providerApi } from '@/lib/api/provider/provider.api';
import { useProviderContext } from './context/provider-context.provider';
import { resolveProviderLifecycle } from './provider-lifecycle';
import { providerKeys } from './query-keys';
export type ProviderEntryState =
  | 'LOADING'
  | 'NO_PROVIDER'
  | 'PENDING'
  | 'REJECTED'
  | 'SUSPENDED'
  | 'ACTIVE'
  | 'CONTEXT_REQUIRED'
  | 'ERROR';
export function useProviderEntryState(enabled = true, pollPending = false) {
  const context = useProviderContext();
  const providerId = context.providerId;
  const account = useQuery({
    queryKey: providerKeys.account(providerId),
    queryFn: providerApi.profile,
    enabled,
    staleTime: pollPending ? 0 : undefined,
    refetchInterval: (query) =>
      pollPending && query.state.data?.verificationStatus === 'PENDING'
        ? 10_000
        : false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: (query) =>
      pollPending && query.state.data?.verificationStatus === 'PENDING'
        ? 'always'
        : false,
  });
  const authorization = useQuery({
    queryKey: providerKeys.authorization(providerId),
    queryFn: providerApi.authorization,
    enabled: enabled && Boolean(account.data),
    staleTime: pollPending ? 0 : undefined,
    refetchInterval: (query) =>
      pollPending &&
      account.data?.verificationStatus !== 'REJECTED' &&
      query.state.data?.verificationStatus === 'PENDING'
        ? 10_000
        : false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: (query) =>
      pollPending &&
      account.data?.verificationStatus !== 'REJECTED' &&
      query.state.data?.verificationStatus === 'PENDING'
        ? 'always'
        : false,
  });
  const accountError = account.error instanceof ApiError ? account.error : null;
  const authorizationError =
    authorization.error instanceof ApiError ? authorization.error : null;
  useEffect(() => {
    if (
      authorization.data?.providerId &&
      authorization.data.providerId !== providerId
    )
      context.setProviderId(authorization.data.providerId);
  }, [authorization.data?.providerId, context, providerId]);
  const lifecycle = resolveProviderLifecycle({
    account: account.data,
    authorization:
      account.data?.verificationStatus === 'REJECTED'
        ? undefined
        : authorization.data,
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
