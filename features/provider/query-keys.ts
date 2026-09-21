export const providerKeys = {
  root: ['provider-workspace'] as const,

  scope: (providerId: string | null) =>
    [...providerKeys.root, providerId ?? 'implicit'] as const,

  account: (providerId: string | null) =>
    [...providerKeys.scope(providerId), 'account'] as const,

  authorization: (providerId: string | null) =>
    [...providerKeys.scope(providerId), 'authorization'] as const,

  properties: (providerId: string | null) =>
    [...providerKeys.scope(providerId), 'properties'] as const,

  listings: (providerId: string | null) =>
    [...providerKeys.scope(providerId), 'listings'] as const,
};
