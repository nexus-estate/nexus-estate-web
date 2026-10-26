import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { getEstateImages } from '@/lib/api/media/estate-images';
import { mediaApi, type EstateMedia } from '@/lib/api/media/media.api';
import { PropertyGallery } from './property-gallery';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: Record<string, unknown>) =>
    values ? `${key} ${JSON.stringify(values)}` : key,
}));
jest.mock('@/lib/api/media/media.api', () => ({
  mediaApi: {
    listPublic: jest.fn(),
    imageUrl: (estateId: string, id: string) => `/estates/${estateId}/${id}`,
  },
}));

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open');
  };
});

function images(count: number): EstateMedia[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `image-${i}`,
    estateId: 'estate-1',
    mediaUrl: `storage/${i}.jpg`,
    type: 'image' as const,
    sortOrder: i,
  })).reverse();
}
function showGallery() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <PropertyGallery estateId="estate-1" title="Property" />
    </QueryClientProvider>,
  );
}

test('filters estate identity and media type, sorts ascending without mutating input', () => {
  const source = [
    ...images(3),
    { ...images(1)[0], id: 'foreign', estateId: 'estate-2' },
    { ...images(1)[0], id: 'video', type: 'video' },
  ] as EstateMedia[];
  const original = [...source];
  expect(getEstateImages(source, 'estate-1').map((image) => image.id)).toEqual([
    'image-0',
    'image-1',
    'image-2',
  ]);
  expect(source).toEqual(original);
});

test.each([1, 2, 5, 8, 12])(
  '%i images remain accessible through the viewer',
  async (count) => {
    jest.mocked(mediaApi.listPublic).mockResolvedValue(images(count));
    showGallery();
    const buttons = await screen.findAllByRole('button', { name: /^open / });
    expect(buttons).toHaveLength(Math.min(count, 4));
    expect(screen.getAllByRole('img')[0]).toHaveAttribute(
      'src',
      'http://localhost/estates/estate-1/image-0',
    );
    const start = Math.min(count, 4);
    fireEvent.click(buttons[start - 1]);
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText(`${start} / ${count}`)).toBeInTheDocument();
    for (let i = start; i < count; i++)
      fireEvent.keyDown(dialog, { key: 'ArrowRight' });
    expect(within(dialog).getByText(`${count} / ${count}`)).toBeInTheDocument();
    fireEvent.keyDown(dialog, { key: 'ArrowRight' });
    expect(within(dialog).getByText(`1 / ${count}`)).toBeInTheDocument();
    fireEvent.keyDown(dialog, { key: 'ArrowLeft' });
    expect(within(dialog).getByText(`${count} / ${count}`)).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: 'close' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe('');
  },
);

test('shows an empty state without sample photos', async () => {
  jest.mocked(mediaApi.listPublic).mockResolvedValue([]);
  showGallery();
  expect(await screen.findByText('empty')).toBeInTheDocument();
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
});

test('exposes a media error and supports retry', async () => {
  jest
    .mocked(mediaApi.listPublic)
    .mockRejectedValueOnce(new Error('Failed'))
    .mockResolvedValueOnce(images(2));
  showGallery();
  expect(await screen.findByRole('alert')).toHaveTextContent('error');
  fireEvent.click(screen.getByRole('button', { name: 'retry' }));
  expect(await screen.findAllByRole('img')).toHaveLength(2);
});

test('a failed image keeps its gallery slot and viewer navigation', async () => {
  jest.mocked(mediaApi.listPublic).mockResolvedValue(images(2));
  showGallery();
  const image = (await screen.findAllByRole('img'))[0];
  fireEvent.error(image);
  expect(screen.getByText('imageError')).toBeInTheDocument();
  fireEvent.click(screen.getAllByRole('button', { name: /^open / })[0]);
  fireEvent.click(screen.getByRole('button', { name: 'next' }));
  expect(screen.getByRole('dialog')).toHaveTextContent('2 / 2');
});
