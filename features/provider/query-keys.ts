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

  property: (providerId: string | null, propertyId: string) =>
    [...providerKeys.properties(providerId), propertyId] as const,

  listings: (providerId: string | null) =>
    [...providerKeys.scope(providerId), 'listings'] as const,

  eligibleProperties: (providerId: string | null) =>
    [...providerKeys.scope(providerId), 'eligible-properties'] as const,
};
