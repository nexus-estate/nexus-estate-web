import { ApiError } from './core/error';
import { getApiErrorDisplayMessage, getApiErrorMessage } from './error-message';

test('renders assignment conflicts with an operator message and request ID', () => {
  const translate = (key: string) =>
    key === 'errors.assignmentConflict'
      ? 'Refresh the subject roles before saving.'
      : key;
  const error = new ApiError('backend message', {
    status: 409,
    errorCode: 'AUTHORIZATION_ASSIGNMENT_CONFLICT',
    requestId: 'authorization-request-17',
  });

  expect(getApiErrorMessage(error, translate)).toBe(
    'Refresh the subject roles before saving.',
  );
  expect(getApiErrorDisplayMessage(error, translate)).toBe(
    'Refresh the subject roles before saving. (authorization-request-17)',
  );
});
