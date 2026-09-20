import { getAdminUrl, getMarketplaceUrl, getProviderUrl } from './urls';

describe('platform URLs', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_MARKETPLACE_URL =
      'https://marketplace.example.com/';
    process.env.NEXT_PUBLIC_PROVIDER_URL = 'https://provider.example.com///';
    process.env.NEXT_PUBLIC_ADMIN_URL = 'https://admin.example.com';
  });

  it('joins platform bases and paths without double slashes', () => {
    expect(getMarketplaceUrl('/')).toBe('https://marketplace.example.com/');
    expect(getProviderUrl()).toBe('https://provider.example.com/provider');
    expect(getProviderUrl('/provider/onboarding')).toBe(
      'https://provider.example.com/provider/onboarding',
    );
    expect(getAdminUrl()).toBe('https://admin.example.com/admin');
  });

  it('rejects invalid or missing configuration', () => {
    process.env.NEXT_PUBLIC_PROVIDER_URL = 'provider.example.com';
    expect(() => getProviderUrl()).toThrow('absolute URL');

    delete process.env.NEXT_PUBLIC_ADMIN_URL;
    expect(() => getAdminUrl()).toThrow('NEXT_PUBLIC_ADMIN_URL is required');
  });

  it('rejects unsafe paths', () => {
    expect(() => getProviderUrl('//evil.example')).toThrow(
      'internal absolute paths',
    );
    expect(() => getProviderUrl('/provider\\account')).toThrow(
      'internal absolute paths',
    );
  });
});
