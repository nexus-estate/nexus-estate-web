/**
 * Thin wrappers are still worth pinning: a wrong path or verb here is an
 * integration bug that only shows up in production traffic.
 */
test('customer API wrappers target the authenticated client', async () => {
  const { customerApiClient, publicApiClient } = await import('./client');
  const { customerAccountApi } = await import('./customer/account.api');
  const { customerAuthenticationApi } =
    await import('./customer/authentication.api');
  const { customerAuthorizationApi } =
    await import('./customer/authorization.api');

  const publicPost = jest
    .spyOn(publicApiClient, 'post')
    .mockResolvedValue({} as never);
  const customerGet = jest
    .spyOn(customerApiClient, 'get')
    .mockResolvedValue({} as never);
  const customerPost = jest
    .spyOn(customerApiClient, 'post')
    .mockResolvedValue({} as never);

  await customerAccountApi.me();
  await customerAuthorizationApi.effective();
  await customerAuthenticationApi.profile();
  await customerAuthenticationApi.login({
    email: 'customer@example.com',
    password: 'password123',
  });
  await customerAuthenticationApi.register({
    email: 'customer@example.com',
    password: 'password123',
  });
  await customerAuthenticationApi.refresh('refresh-token');
  await customerAuthenticationApi.logout('refresh-token');

  expect(customerGet).toHaveBeenCalledWith('/customers/me');
  expect(customerGet).toHaveBeenCalledWith('/customers/me/authorization');
  expect(customerGet).toHaveBeenCalledWith('/customers/auth/profile');
  expect(publicPost).toHaveBeenCalledWith('/customers/auth/login', {
    email: 'customer@example.com',
    password: 'password123',
  });
  expect(publicPost).toHaveBeenCalledWith('/customers/register', {
    email: 'customer@example.com',
    password: 'password123',
  });
  expect(publicPost).toHaveBeenCalledWith('/customers/auth/refresh', {
    refreshTokenString: 'refresh-token',
  });
  // Logout must carry the session, so it goes through the authenticated client.
  expect(customerPost).toHaveBeenCalledWith('/customers/auth/logout', {
    refreshTokenString: 'refresh-token',
  });
});

test('provider API wrappers split public registration from the portal client', async () => {
  const { providerApiClient, publicApiClient } = await import('./client');
  const { providerApi } = await import('./provider/provider.api');

  const publicPost = jest
    .spyOn(publicApiClient, 'post')
    .mockResolvedValue({} as never);
  const providerGet = jest
    .spyOn(providerApiClient, 'get')
    .mockResolvedValue({} as never);
  const providerPost = jest
    .spyOn(providerApiClient, 'post')
    .mockResolvedValue({} as never);
  const providerPatch = jest
    .spyOn(providerApiClient, 'patch')
    .mockResolvedValue({} as never);

  const registration = {
    email: 'provider@example.com',
    password: 'password123',
    displayName: 'Provider',
    type: 'AGENCY' as const,
  };

  const enrollment = { type: 'AGENCY' as const, displayName: 'Provider' };

  await providerApi.register(registration);
  await providerApi.registerFromCustomer(enrollment);
  await providerApi.profile();
  await providerApi.authorization();
  await providerApi.account();
  await providerApi.createAccount(enrollment);
  await providerApi.updateAccount({ displayName: 'Renamed' });

  expect(publicPost).toHaveBeenCalledWith('/providers/register', registration);
  expect(providerPost).toHaveBeenCalledWith(
    '/providers/register/from-customer',
    enrollment,
  );
  expect(providerGet).toHaveBeenCalledWith('/providers/me');
  expect(providerGet).toHaveBeenCalledWith('/providers/me/authorization');
  expect(providerGet).toHaveBeenCalledWith('/provider/account');
  expect(providerPost).toHaveBeenCalledWith('/provider/account', enrollment);
  expect(providerPatch).toHaveBeenCalledWith('/provider/account', {
    displayName: 'Renamed',
  });
});
