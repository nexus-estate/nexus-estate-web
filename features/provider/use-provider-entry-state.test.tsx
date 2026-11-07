import type { ReactNode } from 'react';
import {
  focusManager,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { providerApi } from '@/lib/api/provider/provider.api';
import type {
  ProviderAccount,
  ProviderAuthorization,
} from '@/lib/api/provider/types';
import { useProviderEntryState } from './use-provider-entry-state';

jest.mock('./context/provider-context.provider', () => ({
  useProviderContext: () => ({ providerId: 'p', setProviderId: jest.fn() }),
}));
jest.mock('@/lib/api/provider/provider.api', () => ({
  providerApi: { profile: jest.fn(), authorization: jest.fn() },
}));
const account: ProviderAccount = {
  id: 'p',
  displayName: 'Provider',
  type: 'BROKER',
  status: 'ACTIVE',
  verificationStatus: 'PENDING',
  createdAt: '',
  updatedAt: '',
};
const auth: ProviderAuthorization = {
  platform: 'PROVIDER',
  providerId: 'p',
  membershipId: 'm',
  providerStatus: 'ACTIVE',
  membershipStatus: 'ACTIVE',
  verificationStatus: 'PENDING',
  roles: [],
  permissions: [],
  authorizationVersion: '1',
};
beforeEach(() => {
  jest.useFakeTimers();
  jest.resetAllMocks();
  focusManager.setFocused(true);
  jest.mocked(providerApi.profile).mockResolvedValue(account);
  jest.mocked(providerApi.authorization).mockResolvedValue(auth);
});
afterEach(() => {
  focusManager.setFocused(undefined);
  jest.useRealTimers();
});
async function tick(ms = 50) {
  await act(async () => {
    await jest.advanceTimersByTimeAsync(ms);
  });
}
function setup(poll = true) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return renderHook(() => useProviderEntryState(true, poll), { wrapper });
}
test('polls pending status and stops after server approval', async () => {
  const { result } = setup();
  await tick();
  expect(result.current.state).toBe('PENDING');
  jest
    .mocked(providerApi.profile)
    .mockResolvedValue({ ...account, verificationStatus: 'VERIFIED' });
  jest
    .mocked(providerApi.authorization)
    .mockResolvedValue({ ...auth, verificationStatus: 'VERIFIED' });
  await tick(10_100);
  expect(result.current.state).toBe('ACTIVE');
  const calls = jest.mocked(providerApi.profile).mock.calls.length;
  await tick(30_000);
  expect(providerApi.profile).toHaveBeenCalledTimes(calls);
});
test('pauses while hidden, refreshes on return, and stops on unmount', async () => {
  const { unmount } = setup();
  await tick();
  const calls = jest.mocked(providerApi.profile).mock.calls.length;
  act(() => focusManager.setFocused(false));
  await tick(20_100);
  expect(providerApi.profile).toHaveBeenCalledTimes(calls);
  act(() => focusManager.setFocused(true));
  await tick();
  expect(providerApi.profile).toHaveBeenCalledTimes(calls + 1);
  unmount();
  await tick(20_100);
  expect(providerApi.profile).toHaveBeenCalledTimes(calls + 1);
});
test('layout observers do not enable polling', async () => {
  setup(false);
  await tick();
  await tick(30_000);
  expect(providerApi.profile).toHaveBeenCalledTimes(1);
});
test('shows server rejection despite a stale pending authorization snapshot', async () => {
  const { result } = setup();
  await tick();
  jest
    .mocked(providerApi.profile)
    .mockResolvedValue({ ...account, verificationStatus: 'REJECTED' });
  await tick(10_100);
  expect(result.current.state).toBe('REJECTED');
  const calls = jest.mocked(providerApi.authorization).mock.calls.length;
  await tick(30_000);
  expect(providerApi.authorization).toHaveBeenCalledTimes(calls);
});
