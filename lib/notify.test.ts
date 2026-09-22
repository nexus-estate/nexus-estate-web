import toast from 'react-hot-toast';
import { ApiError } from '@/lib/api/core/error';
import { FEEDBACK, notify } from './notify';

// The real default export is callable and carries the helpers, so the mock is
// a function with attached spies rather than a plain object.
jest.mock('react-hot-toast', () => {
  const toast = jest.fn() as jest.Mock & {
    success: jest.Mock;
    error: jest.Mock;
    promise: jest.Mock;
  };
  toast.success = jest.fn();
  toast.error = jest.fn();
  toast.promise = jest.fn();
  return { __esModule: true, default: toast };
});

const mockedToast = toast as unknown as jest.Mock & {
  success: jest.Mock;
  error: jest.Mock;
  promise: jest.Mock;
};

/** Catalog stub so assertions read as the message the user would see. */
const translate = (key: string) => `t:${key}`;

describe('notify', () => {
  beforeEach(() => jest.clearAllMocks());

  it('shows plain messages verbatim', () => {
    notify.success('Saved.');
    notify.info('Heads up.');
    expect(mockedToast.success).toHaveBeenCalledWith('Saved.');
    expect(mockedToast).toHaveBeenCalledWith('Heads up.');
  });

  it('maps a business error code onto the shared catalog', () => {
    const error = new ApiError('raw upstream message', {
      status: 409,
      errorCode: 'AUTHORIZATION_ROLE_VERSION_CONFLICT',
    });

    notify.apiError(error, translate);

    expect(mockedToast.error).toHaveBeenCalledWith(
      't:errors.roleVersionConflict',
    );
  });

  it('appends the request id so support can trace a failure', () => {
    const error = new ApiError('Conflict', {
      status: 409,
      errorCode: 'AUTHORIZATION_ASSIGNMENT_CONFLICT',
      requestId: 'req-42',
    });

    notify.apiError(error, translate);

    expect(mockedToast.error).toHaveBeenCalledWith(
      't:errors.assignmentConflict (req-42)',
    );
  });

  it('passes unmapped API messages through unchanged', () => {
    notify.apiError(
      new ApiError('Estate not found', { status: 404 }),
      translate,
    );
    expect(mockedToast.error).toHaveBeenCalledWith('Estate not found');
  });

  it('falls back to a provided key, then to the generic unexpected error', () => {
    notify.apiError(new Error('boom'), translate, FEEDBACK.created);
    expect(mockedToast.error).toHaveBeenLastCalledWith('t:feedback.created');

    notify.apiError(new Error('boom'), translate);
    expect(mockedToast.error).toHaveBeenLastCalledWith('t:errors.unexpected');
  });

  it('forwards promise messages so long mutations stay visible', () => {
    const promise = Promise.resolve('ok');
    void notify.promise(promise, {
      loading: 'Saving…',
      success: 'Saved.',
      error: 'Failed.',
    });
    expect(mockedToast.promise).toHaveBeenCalledWith(promise, {
      loading: 'Saving…',
      success: 'Saved.',
      error: 'Failed.',
    });
  });
});
