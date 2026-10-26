import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { mediaApi } from '@/lib/api/media/media.api';
import { EstateMediaUpload } from './estate-media-upload';

jest.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));
jest.mock('@/lib/api/media/media.api', () => ({
  MAX_IMAGE_BYTES: 5 * 1024 * 1024,
  mediaApi: { upload: jest.fn() },
}));

beforeEach(() => {
  jest.clearAllMocks();
  let previewId = 0;
  URL.createObjectURL = jest.fn(() => `blob:test-${++previewId}`);
  URL.revokeObjectURL = jest.fn();
});

test('rejects invalid images before sending a request', () => {
  render(<EstateMediaUpload estateId="estate-1" />);
  fireEvent.change(screen.getByLabelText('choose'), {
    target: { files: [new File(['text'], 'note.txt', { type: 'text/plain' })] },
  });
  expect(screen.getByRole('alert')).toHaveTextContent('invalidFile');
  expect(mediaApi.upload).not.toHaveBeenCalled();
});

test('retries a failed upload without uploading previously saved images again', async () => {
  const first = new File(['one'], 'one.png', { type: 'image/png' });
  const second = new File(['two'], 'two.png', { type: 'image/png' });
  jest
    .mocked(mediaApi.upload)
    .mockResolvedValueOnce({} as never)
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValueOnce({} as never);
  const { unmount } = render(<EstateMediaUpload estateId="estate-1" />);
  fireEvent.change(screen.getByLabelText('choose'), {
    target: { files: [first, second] },
  });
  fireEvent.click(screen.getByRole('button', { name: 'upload' }));
  await waitFor(() =>
    expect(screen.getByRole('alert')).toHaveTextContent('uploadFailed'),
  );
  expect(screen.getAllByRole('status').map((item) => item.textContent)).toEqual(
    ['status.uploaded', 'status.failed'],
  );
  fireEvent.click(screen.getByRole('button', { name: 'upload' }));
  await waitFor(() =>
    expect(
      screen.getAllByRole('status').map((item) => item.textContent),
    ).toEqual(['status.uploaded', 'status.uploaded']),
  );
  expect(mediaApi.upload).toHaveBeenCalledTimes(3);
  expect(
    jest.mocked(mediaApi.upload).mock.calls.map((call) => call[1]),
  ).toEqual([first, second, second]);
  unmount();
  expect(URL.revokeObjectURL).toHaveBeenCalledTimes(2);
});
