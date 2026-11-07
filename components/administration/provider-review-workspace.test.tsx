import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { providerReviewApi } from '@/lib/api/administration/provider-review.api';
import type { ProviderRegistrationReview } from '@/lib/api/administration/provider-review.types';
import { ApiError } from '@/lib/api/core/error';
import { ProviderReviewWorkspace } from './provider-review-workspace';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: Record<string, string>) =>
    `${key}${values?.name ? ` ${values.name}` : ''}`,
  useFormatter: () => ({ dateTime: () => 'date', relativeTime: () => 'time' }),
}));
jest.mock(
  '@/features/auth/administration/administration-session.provider',
  () => ({
    useAdministrationSession: () => ({
      authorizationReady: true,
      hasPermission: () => true,
    }),
  }),
);
jest.mock('@/lib/api/administration/provider-review.api', () => ({
  providerReviewApi: {
    pending: jest.fn(),
    approve: jest.fn(),
    detail: jest.fn(),
  },
}));
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: { success: jest.fn() },
}));

function request(id: string): ProviderRegistrationReview {
  return {
    id,
    providerAccount: {
      id,
      displayName: `Provider ${id}`,
      type: 'BROKER',
      status: 'ACTIVE',
      verificationStatus: 'PENDING',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
    owner: {
      id,
      email: `${id}@test.com`,
      isEmailVerified: true,
      role: 'CUSTOMER',
      lastLogin: null,
      createdAt: '',
      updatedAt: '',
    },
  };
}
let pending: ProviderRegistrationReview[];
beforeEach(() => {
  jest.resetAllMocks();
  pending = [request('a'), request('b')];
  jest
    .mocked(providerReviewApi.pending)
    .mockImplementation(async () => pending);
});
async function setup() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const result = render(
    <QueryClientProvider client={client}>
      <ProviderReviewWorkspace />
    </QueryClientProvider>,
  );
  await screen.findByRole('heading', { name: 'Provider a' });
  return { ...result, client };
}
test('new arrivals do not move the selection; mobile back keeps the selection', async () => {
  const { client, container } = await setup();
  fireEvent.click(screen.getByRole('button', { name: /Provider b/ }));
  await act(async () => {
    pending = [request('new'), ...pending];
    await client.invalidateQueries({
      queryKey: ['administration', 'provider-requests'],
    });
  });
  expect(
    screen.getByRole('heading', { name: 'Provider b' }),
  ).toBeInTheDocument();
  expect(container.querySelector('.mobile-detail-open')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'backToQueue' }));
  expect(
    container.querySelector('.mobile-detail-open'),
  ).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Provider b/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});
test('locks submission, waits for confirmation, selects next and handles the last item', async () => {
  let confirm!: (value: {
    providerAccount: ProviderRegistrationReview['providerAccount'];
  }) => void;
  jest.mocked(providerReviewApi.approve).mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        confirm = resolve;
      }),
  );
  await setup();
  fireEvent.click(screen.getByRole('button', { name: 'approve' }));
  expect(screen.getByRole('button', { name: 'approving' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'reject' })).toBeDisabled();
  expect(
    screen.getByRole('heading', { name: 'Provider a' }),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'approving' }));
  await waitFor(() =>
    expect(providerReviewApi.approve).toHaveBeenCalledTimes(1),
  );
  await act(async () => {
    pending = [request('b')];
    confirm({
      providerAccount: {
        ...request('a').providerAccount,
        verificationStatus: 'VERIFIED',
      },
    });
  });
  await screen.findByRole('heading', { name: 'Provider b' });
  expect(screen.getByRole('status')).toHaveTextContent('Provider a');
  jest.mocked(providerReviewApi.approve).mockImplementationOnce(async () => {
    pending = [];
    return {
      providerAccount: {
        ...request('b').providerAccount,
        verificationStatus: 'VERIFIED',
      },
    };
  });
  fireEvent.click(screen.getByRole('button', { name: 'approve' }));
  await screen.findByRole('heading', { name: 'processedAll' });
});
test('retains failed application and allows retry', async () => {
  jest
    .mocked(providerReviewApi.approve)
    .mockRejectedValue(new ApiError('Unavailable', { status: 503 }));
  await setup();
  fireEvent.click(screen.getByRole('button', { name: 'approve' }));
  await screen.findByRole('alert');
  expect(
    screen.getByRole('heading', { name: 'Provider a' }),
  ).toBeInTheDocument();
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'approve' })).toBeEnabled(),
  );
});
test('refetches on concurrent decision without inventing a final status', async () => {
  jest.mocked(providerReviewApi.approve).mockImplementation(async () => {
    pending = [request('b')];
    throw new ApiError('Conflict', { status: 409 });
  });
  jest
    .mocked(providerReviewApi.detail)
    .mockRejectedValue(new ApiError('Gone', { status: 404 }));
  await setup();
  fireEvent.click(screen.getByRole('button', { name: 'approve' }));
  await waitFor(() =>
    expect(screen.getByRole('alert')).toHaveTextContent(
      'noLongerPending Provider a',
    ),
  );
  await waitFor(() =>
    expect(
      screen.queryByRole('button', { name: /Provider a/ }),
    ).not.toBeInTheDocument(),
  );
  expect(
    screen.getByRole('button', { name: /Provider b/ }),
  ).toBeInTheDocument();
});
