import { render, screen } from '@testing-library/react';

import { useProviderAuthorization } from '@/features/provider/context/provider-context.hooks';
import {
  useCreateProviderListing,
  useListingEligibleProperties,
} from '@/features/provider/supply/provider-supply.queries';
import { ApiError } from '@/lib/api/core/error';
import NewProviderListingPage from './page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));
jest.mock('@/components/portal/page-header', () => ({
  PageHeader: ({
    title,
    description,
  }: {
    title: string;
    description: string;
  }) => (
    <header>
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  ),
}));
jest.mock('@/features/provider/context/provider-context.hooks', () => ({
  useProviderAuthorization: jest.fn(),
}));
jest.mock('@/features/provider/supply/provider-supply.queries', () => ({
  useCreateProviderListing: jest.fn(),
  useListingEligibleProperties: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useProviderAuthorization).mockReturnValue({
    state: 'ACTIVE_VERIFIED',
    hasProviderPermission: () => true,
  } as never);
  jest.mocked(useCreateProviderListing).mockReturnValue({
    isPending: false,
    isError: false,
  } as never);
});

test('renders permission denied when eligible-properties is forbidden', () => {
  jest.mocked(useListingEligibleProperties).mockReturnValue({
    isLoading: false,
    isError: true,
    error: new ApiError('Forbidden', { status: 403 }),
    data: undefined,
  } as never);

  render(<NewProviderListingPage />);

  expect(screen.getByRole('alert')).toHaveTextContent('permissionDenied');
  expect(screen.getByRole('alert')).not.toHaveTextContent(
    'listings.loadFailed',
  );
});
