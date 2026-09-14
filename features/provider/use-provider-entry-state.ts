'use client';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ApiError } from '@/lib/api/core/error';
import { providerApi } from '@/lib/api/provider/provider.api';
export type ProviderEntryState =
  | 'LOADING'
  | 'NO_PROVIDER'
  | 'PENDING'
  | 'REJECTED'
  | 'SUSPENDED'
  | 'ACTIVE'
  | 'CONTEXT_REQUIRED'
  | 'ERROR';
export function useProviderEntryState() {
  const account = useQuery({
    queryKey: ['customer', 'provider-entry', 'account'],
    queryFn: providerApi.profile,
  });
  const authorization = useQuery({
    queryKey: ['customer', 'provider-entry', 'authorization'],
    queryFn: providerApi.authorization,
    enabled: Boolean(account.data),
  });
  const accountError =
    account.error instanceof ApiError ? account.error.errorCode : undefined;
  const authorizationError =
    authorization.error instanceof ApiError
      ? authorization.error.errorCode
      : undefined;
  useEffect(() => {
    if (authorization.data?.providerId)
      localStorage.setItem(
        'nexus.provider.active_id',
        authorization.data.providerId,
      );
  }, [authorization.data?.providerId]);
  let state: ProviderEntryState = 'LOADING';
  if (accountError === 'PROVIDER_ACCOUNT_NOT_FOUND') state = 'NO_PROVIDER';
  else if (accountError && accountError !== 'PROVIDER_CONTEXT_REQUIRED')
    state = 'ERROR';
  else if (account.data && authorizationError === 'PROVIDER_CONTEXT_REQUIRED')
    state = 'CONTEXT_REQUIRED';
  else if (account.data && authorization.data) {
    if (authorization.data.providerStatus === 'SUSPENDED') state = 'SUSPENDED';
    else if (authorization.data.verificationStatus === 'REJECTED')
      state = 'REJECTED';
    else if (
      authorization.data.providerStatus === 'ACTIVE' &&
      authorization.data.verificationStatus === 'VERIFIED' &&
      authorization.data.membershipStatus === 'ACTIVE'
    )
      state = 'ACTIVE';
    else state = 'PENDING';
  } else if (account.isError || authorization.isError) state = 'ERROR';
  return {
    account,
    authorization,
    state,
    isLoading: account.isLoading || authorization.isLoading,
  };
}
