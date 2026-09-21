import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen } from '@testing-library/react';

import { providerSupplyKeys } from '../supply/provider-supply.queries';
import {
  ProviderContextProvider,
  useProviderContext,
} from './provider-context.provider';

function setQueryData(client: QueryClient, key: readonly unknown[]): void {
  client.setQueryData(key, { seeded: true });
}

function Probe({ target, label }: { target: string | null; label: string }) {
  const { providerId, setProviderId } = useProviderContext();
  return (
    <button type="button" onClick={() => setProviderId(target)}>
      {label}:{providerId ?? 'null'}
    </button>
  );
}

function renderContext(initialProviderId: string | null) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  if (initialProviderId !== null) {
    localStorage.setItem('nexus.provider.active_id', initialProviderId);
  } else {
    localStorage.removeItem('nexus.provider.active_id');
  }
  render(
    <QueryClientProvider client={queryClient}>
      <ProviderContextProvider>
        <Probe target="provider-a" label="set-a" />
        <Probe target="provider-b" label="set-b" />
        <Probe target={null} label="clear" />
      </ProviderContextProvider>
    </QueryClientProvider>,
  );
  return queryClient;
}

describe('ProviderContextProvider cache hygiene', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('keeps the private cache when the same provider id is set again', () => {
    const queryClient = renderContext('provider-a');
    const key = providerSupplyKeys.properties('provider-a');
    setQueryData(queryClient, key);

    act(() => {
      screen.getByRole('button', { name: 'set-a:provider-a' }).click();
    });

    expect(queryClient.getQueryData(key)).toEqual({ seeded: true });
    expect(localStorage.getItem('nexus.provider.active_id')).toBe('provider-a');
  });

  it('removes the previous provider private cache when switching providers', () => {
    const queryClient = renderContext('provider-a');
    const oldKey = providerSupplyKeys.properties('provider-a');
    setQueryData(queryClient, oldKey);

    act(() => {
      screen.getByRole('button', { name: 'set-b:provider-a' }).click();
    });

    expect(queryClient.getQueryData(oldKey)).toBeUndefined();
    expect(localStorage.getItem('nexus.provider.active_id')).toBe('provider-b');
    expect(
      screen.getByRole('button', { name: 'set-b:provider-b' }),
    ).toBeTruthy();
  });

  it('removes the private cache when the context is cleared', () => {
    const queryClient = renderContext('provider-a');
    const oldKey = providerSupplyKeys.listings('provider-a');
    setQueryData(queryClient, oldKey);

    act(() => {
      screen.getByRole('button', { name: 'clear:provider-a' }).click();
    });

    expect(queryClient.getQueryData(oldKey)).toBeUndefined();
    expect(localStorage.getItem('nexus.provider.active_id')).toBeNull();
  });
});
