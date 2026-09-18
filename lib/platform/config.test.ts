import { getPlatformTitle, parseWebPlatform } from './config';

describe('web platform configuration', () => {
  it.each(['marketplace', 'provider', 'admin'] as const)(
    'accepts %s',
    (platform) => {
      expect(parseWebPlatform(platform, { nodeEnv: 'production' })).toBe(
        platform,
      );
    },
  );

  it('uses the temporary Marketplace fallback outside production', () => {
    expect(parseWebPlatform(undefined, { nodeEnv: 'development' })).toBe(
      'marketplace',
    );
  });

  it('fails fast for a missing production platform', () => {
    expect(() =>
      parseWebPlatform(undefined, { nodeEnv: 'production' }),
    ).toThrow('WEB_PLATFORM is required in production');
  });

  it('fails fast for invalid values', () => {
    expect(() => parseWebPlatform('supply', { nodeEnv: 'production' })).toThrow(
      'Invalid WEB_PLATFORM',
    );
  });

  it('keeps platform titles explicit', () => {
    expect(getPlatformTitle('marketplace')).toBe('Nexus Estate');
    expect(getPlatformTitle('provider')).toBe('Nexus Estate Provider');
    expect(getPlatformTitle('admin')).toBe('Nexus Estate Administration');
  });
});
