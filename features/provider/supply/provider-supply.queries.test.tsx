import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';

import { ApiError } from '@/lib/api/core/error';
import { estateApi } from '@/lib/api/estate/estate.api';
import type { Estate } from '@/lib/api/estate/estate.types';
import { listingApi } from '@/lib/api/listing/listing.api';
import { mediaApi } from '@/lib/api/media/media.api';
import { useProviderContext } from '../context/provider-context.provider';
import { providerKeys } from '../query-keys';
import {
  useActivateProviderProperty,
  useProviderListing,
  useProviderProperty,
  useProviderEstateMedia,
  useArchiveProviderProperty,
  useArchiveProviderListing,
  useCreateProviderListing,
  useCreateProviderProperty,
  useListingEligibleProperties,
  useRestoreProviderProperty,
  useUpdateProviderProperty,
} from './provider-supply.queries';

jest.mock('@/lib/api/estate/estate.api', () => ({
  estateApi: {
    getMine: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    activate: jest.fn(),
    archive: jest.fn(),
    restore: jest.fn(),
    remove: jest.fn(),
  },
}));
jest.mock('@/lib/api/listing/listing.api', () => ({
  listingApi: {
    archive: jest.fn(),
    mine: jest.fn(),
    create: jest.fn(),
    eligibleProperties: jest.fn(),
  },
}));
jest.mock('@/lib/api/media/media.api', () => ({
  mediaApi: { listPublic: jest.fn() },
}));
jest.mock('../context/provider-context.provider', () => ({
  useProviderContext: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

const propertyFixture: Estate = {
  id: 'property-1',
  providerId: 'provider-1',
  status: 'DRAFT',
  title: 'Riverside apartment',
  description: null,
  type: 'APARTMENT',
  purpose: 'SALE',
  price: 3500000000,
  area: 82.5,
  bedrooms: 2,
  bathrooms: 2,
  floors: null,
  addressLine: '1 Riverside Street',
  provinceId: 'province-1',
  wardId: 'ward-1',
  latitude: null,
  longitude: null,
  province: { id: 'province-1', code: '79', name: 'Ho Chi Minh City' },
  ward: { id: 'ward-1', code: '26734', name: 'Ben Nghe' },
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

test('refreshes effective provider authorization after a supply 403', async () => {
  jest.mocked(useProviderContext).mockReturnValue({
    providerId: 'provider-1',
    setProviderId: jest.fn(),
  });
  jest
    .mocked(listingApi.archive)
    .mockRejectedValue(new ApiError('Forbidden', { status: 403 }));
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  const invalidateQueries = jest.spyOn(queryClient, 'invalidateQueries');

  const { result } = renderHook(() => useArchiveProviderListing(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });

  await act(async () => {
    await expect(result.current.mutateAsync('listing-1')).rejects.toThrow(
      'Forbidden',
    );
  });

  expect(invalidateQueries).toHaveBeenCalledWith({
    queryKey: providerKeys.authorization('provider-1'),
  });
});

test('loads eligible properties with listing:create as the only capability', async () => {
  jest.mocked(useProviderContext).mockReturnValue({
    providerId: 'provider-1',
    setProviderId: jest.fn(),
  });
  jest
    .mocked(listingApi.eligibleProperties)
    .mockResolvedValue([{ id: 'property-1', title: 'Riverside apartment' }]);
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const { result } = renderHook(() => useListingEligibleProperties(true), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });

  await act(async () => {
    await expect(result.current.refetch()).resolves.toMatchObject({
      data: [{ id: 'property-1' }],
    });
  });
  expect(listingApi.eligibleProperties).toHaveBeenCalledTimes(1);
});

test('refreshes authorization when eligible properties return 403', async () => {
  jest.mocked(useProviderContext).mockReturnValue({
    providerId: 'provider-1',
    setProviderId: jest.fn(),
  });
  jest
    .mocked(listingApi.eligibleProperties)
    .mockRejectedValue(new ApiError('Forbidden', { status: 403 }));
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const invalidateQueries = jest.spyOn(queryClient, 'invalidateQueries');

  const { result } = renderHook(() => useListingEligibleProperties(false), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });

  let refetchResult: Awaited<ReturnType<typeof result.current.refetch>>;
  await act(async () => {
    refetchResult = await result.current.refetch();
  });

  expect(invalidateQueries).toHaveBeenCalledWith({
    queryKey: providerKeys.authorization('provider-1'),
  });
  await waitFor(() => {
    expect(refetchResult.error).toMatchObject({ status: 403 });
  });
});

test.each([
  [
    'create property',
    useCreateProviderProperty,
    () => {
      jest.mocked(estateApi.create).mockResolvedValue({} as never);
      return { data: { title: 'New property' } };
    },
  ],
  [
    'update property',
    useUpdateProviderProperty,
    () => {
      jest
        .mocked(estateApi.update)
        .mockResolvedValue({ id: 'property-1' } as never);
      return {
        data: { id: 'property-1', data: { title: 'Updated property' } },
      };
    },
  ],
  [
    'archive property',
    useArchiveProviderProperty,
    () => {
      jest.mocked(estateApi.archive).mockResolvedValue({
        ...propertyFixture,
        status: 'ARCHIVED',
      });
      return { data: 'property-1' };
    },
  ],
  [
    'activate property',
    useActivateProviderProperty,
    () => {
      jest.mocked(estateApi.activate).mockResolvedValue({
        ...propertyFixture,
        status: 'ACTIVE',
      });
      return { data: 'property-1' };
    },
  ],
  [
    'restore property',
    useRestoreProviderProperty,
    () => {
      jest.mocked(estateApi.restore).mockResolvedValue(propertyFixture);
      return { data: 'property-1' };
    },
  ],
  [
    'create listing',
    useCreateProviderListing,
    () => {
      jest.mocked(listingApi.create).mockResolvedValue({} as never);
      return { data: { estateId: 'property-1' } };
    },
  ],
])(
  '%s invalidates eligible properties after success',
  async (_name, hook, setup) => {
    jest.mocked(useProviderContext).mockReturnValue({
      providerId: 'provider-1',
      setProviderId: jest.fn(),
    });
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    const invalidateQueries = jest.spyOn(queryClient, 'invalidateQueries');
    const { data, ...mutationOptions } = setup();
    const { result } = renderHook(() => hook(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });

    await act(async () => {
      await result.current.mutateAsync(data as never);
    });

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: providerKeys.eligibleProperties('provider-1'),
    });
    void mutationOptions;
  },
);

test('reflects each property lifecycle transition in list and detail cache', async () => {
  jest.mocked(useProviderContext).mockReturnValue({
    providerId: 'provider-1',
    setProviderId: jest.fn(),
  });
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  queryClient.setQueryData(providerKeys.properties('provider-1'), [
    propertyFixture,
  ]);
  queryClient.setQueryData(
    providerKeys.property('provider-1', propertyFixture.id),
    propertyFixture,
  );
  const { result: activate } = renderHook(() => useActivateProviderProperty(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });
  jest.mocked(estateApi.activate).mockResolvedValue({
    ...propertyFixture,
    status: 'ACTIVE',
  });
  await act(async () => {
    await activate.current.mutateAsync(propertyFixture.id);
  });
  expect(
    queryClient.getQueryData<Estate[]>(providerKeys.properties('provider-1')),
  ).toEqual([expect.objectContaining({ status: 'ACTIVE' })]);
  expect(
    queryClient.getQueryData<Estate>(
      providerKeys.property('provider-1', propertyFixture.id),
    ),
  ).toEqual(expect.objectContaining({ status: 'ACTIVE' }));

  const { result: archive } = renderHook(() => useArchiveProviderProperty(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });
  jest.mocked(estateApi.archive).mockResolvedValue({
    ...propertyFixture,
    status: 'ARCHIVED',
  });
  await act(async () => {
    await archive.current.mutateAsync(propertyFixture.id);
  });
  expect(
    queryClient.getQueryData<Estate[]>(providerKeys.properties('provider-1')),
  ).toEqual([expect.objectContaining({ status: 'ARCHIVED' })]);

  const { result: restore } = renderHook(() => useRestoreProviderProperty(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });
  jest.mocked(estateApi.restore).mockResolvedValue(propertyFixture);
  await act(async () => {
    await restore.current.mutateAsync(propertyFixture.id);
  });
  expect(
    queryClient.getQueryData<Estate[]>(providerKeys.properties('provider-1')),
  ).toEqual([expect.objectContaining({ status: 'DRAFT' })]);
});

test('does not query eligible properties when listing:create is absent', async () => {
  jest.mocked(useProviderContext).mockReturnValue({
    providerId: 'provider-1',
    setProviderId: jest.fn(),
  });
  const queryClient = new QueryClient();

  renderHook(() => useListingEligibleProperties(false), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });

  expect(listingApi.eligibleProperties).not.toHaveBeenCalled();
});

test('detail selects the provider listing and waits for its estate identity', async () => {
  jest.mocked(useProviderContext).mockReturnValue({
    providerId: 'provider-detail',
    setProviderId: jest.fn(),
  });
  const mineListing = {
    id: 'draft-listing',
    estateId: propertyFixture.id,
    status: 'DRAFT',
  };
  jest
    .mocked(listingApi.mine)
    .mockResolvedValue([mineListing] as Awaited<
      ReturnType<typeof listingApi.mine>
    >);
  jest.mocked(estateApi.getMine).mockResolvedValue(propertyFixture);
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  const { result, rerender } = renderHook(
    ({ enabled }) => {
      const listing = useProviderListing('draft-listing', enabled);
      const estate = useProviderProperty(
        listing.data?.estateId ?? '',
        enabled && Boolean(listing.data?.estateId),
      );
      return { listing, estate };
    },
    { wrapper, initialProps: { enabled: false } },
  );
  expect(listingApi.mine).not.toHaveBeenCalled();
  expect(estateApi.getMine).not.toHaveBeenCalled();
  rerender({ enabled: true });
  await waitFor(() =>
    expect(result.current.estate.data?.id).toBe(propertyFixture.id),
  );
  expect(result.current.listing.data?.status).toBe('DRAFT');
  expect(listingApi.mine).toHaveBeenCalledTimes(1);
  expect(estateApi.getMine).toHaveBeenCalledWith(propertyFixture.id);
  expect(client.getQueryData(providerKeys.listings('provider-detail'))).toEqual(
    [mineListing],
  );
});

test('media does not fetch without estate ID or permission and stays provider scoped', async () => {
  jest.mocked(useProviderContext).mockReturnValue({
    providerId: 'provider-media',
    setProviderId: jest.fn(),
  });
  jest.mocked(mediaApi.listPublic).mockResolvedValue([]);
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  const { result, rerender } = renderHook(
    ({ id, enabled }) => useProviderEstateMedia(id, enabled),
    { wrapper, initialProps: { id: '', enabled: true } },
  );
  expect(mediaApi.listPublic).not.toHaveBeenCalled();
  rerender({ id: 'estate-media', enabled: false });
  expect(mediaApi.listPublic).not.toHaveBeenCalled();
  rerender({ id: 'estate-media', enabled: true });
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(mediaApi.listPublic).toHaveBeenCalledWith('estate-media');
  expect(
    client.getQueryData(providerKeys.media('provider-media', 'estate-media')),
  ).toEqual([]);
});
