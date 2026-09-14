import { ApiError } from '@/lib/api/core/error';
import { resolveProviderLifecycle } from './provider-lifecycle';
const account = {
  id: 'p',
  type: 'AGENCY' as const,
  displayName: 'Nexus',
  status: 'ACTIVE' as const,
  verificationStatus: 'PENDING' as const,
  createdAt: '',
  updatedAt: '',
};
const auth = {
  platform: 'PROVIDER' as const,
  providerId: 'p',
  membershipId: 'm',
  roles: [],
  permissions: [],
  providerStatus: 'ACTIVE' as const,
  verificationStatus: 'VERIFIED' as const,
  membershipStatus: 'ACTIVE' as const,
  authorizationVersion: '1',
};
test.each([
  ['loading', 'LOADING', { loading: true }],
  [
    'no account',
    'NO_PROVIDER',
    {
      loading: false,
      accountError: new ApiError('', {
        status: 404,
        errorCode: 'PROVIDER_ACCOUNT_NOT_FOUND',
      }),
    },
  ],
  ['pending', 'PENDING_VERIFICATION', { loading: false, account }],
  [
    'rejected',
    'REJECTED',
    {
      loading: false,
      account: { ...account, verificationStatus: 'REJECTED' as const },
    },
  ],
  [
    'suspended',
    'SUSPENDED',
    { loading: false, account: { ...account, status: 'SUSPENDED' as const } },
  ],
  [
    'active',
    'ACTIVE_VERIFIED',
    {
      loading: false,
      account: { ...account, verificationStatus: 'VERIFIED' as const },
      authorization: auth,
    },
  ],
  [
    'context',
    'CONTEXT_REQUIRED',
    {
      loading: false,
      account,
      authorizationError: new ApiError('', {
        status: 400,
        errorCode: 'PROVIDER_CONTEXT_REQUIRED',
      }),
    },
  ],
] as const)('%s resolves', (_, expected, input) =>
  expect(resolveProviderLifecycle(input)).toBe(expected),
);
