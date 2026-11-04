import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { mediaApi } from '@/lib/api/media/media.api';
import { EstateImage } from './estate-image';

jest.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));
jest.mock('@/lib/api/media/media.api', () => ({
  mediaApi: {
    listPublic: jest.fn(),
    imageUrl: (estateId: string, mediaId: string) =>
      `http://localhost:3001/api/v1/estates/${estateId}/media/${mediaId}/content`,
  },
}));

function showImage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <EstateImage estateId="estate-1" title="Actual estate" sizes="100vw" />
    </QueryClientProvider>,
  );
}

test('uses the first ordered image belonging to the estate', async () => {
  jest.mocked(mediaApi.listPublic).mockResolvedValue([
    {
      id: 'other',
      estateId: 'estate-2',
      mediaUrl: 'other.png',
      type: 'image',
      sortOrder: 0,
    },
    {
      id: 'second',
      estateId: 'estate-1',
      mediaUrl: 'second.png',
      type: 'image',
      sortOrder: 2,
    },
    {
      id: 'first',
      estateId: 'estate-1',
      mediaUrl: 'first.png',
      type: 'image',
      sortOrder: 1,
    },
  ]);
  showImage();
  const image = await screen.findByRole('img', { name: 'Actual estate' });
  expect(image).toHaveAttribute(
    'src',
    'http://localhost:3001/api/v1/estates/estate-1/media/first/content',
  );
  expect(mediaApi.listPublic).toHaveBeenCalledWith('estate-1');
  fireEvent.error(image);
  expect(screen.getByText('noImage')).toBeInTheDocument();
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
});

test('shows an empty state when the estate has no images', async () => {
  jest.mocked(mediaApi.listPublic).mockResolvedValue([]);
  showImage();
  expect(await screen.findByText('noImage')).toBeInTheDocument();
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
});

test('does not substitute a rendered image when media cannot be fetched', async () => {
  jest.mocked(mediaApi.listPublic).mockRejectedValue(new Error('Unavailable'));
  showImage();
  await waitFor(() => expect(screen.getByText('noImage')).toBeInTheDocument());
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
});
