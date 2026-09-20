import { APP_TIME_ZONE, LOCALE_KEY } from '@/lib/constants';
import requestConfig from './request';

/**
 * Minimal doubles so the request config can be evaluated outside Next.js.
 * The `getRequestConfig` identity wrapper matches the react-server build of
 * next-intl, which jest cannot resolve from the jsdom test environment.
 */
jest.mock('next-intl/server', () => ({
  getRequestConfig: (config: unknown) => config,
}));

const mockCookieStore: Record<string, string> = {};

jest.mock('next/headers', () => ({
  cookies: jest.fn(async () => ({
    get: (name: string) =>
      name in mockCookieStore
        ? { name, value: mockCookieStore[name] }
        : undefined,
  })),
}));

const resolveRequestConfig = () =>
  requestConfig({ requestLocale: Promise.resolve(undefined) });

describe('i18n server request config', () => {
  beforeEach(() => {
    for (const key of Object.keys(mockCookieStore)) {
      delete mockCookieStore[key];
    }
  });

  it('pins the server runtime to the canonical application timezone', async () => {
    const config = await resolveRequestConfig();

    expect(config.timeZone).toBe(APP_TIME_ZONE);
  });

  it('uses UTC as the deterministic runtime timezone', () => {
    expect(APP_TIME_ZONE).toBe('UTC');
  });

  it.each([
    ['vi', 'vi'],
    ['en', 'en'],
    ['fr', 'en'],
    [undefined, 'en'],
  ])('resolves cookie %s to locale %s', async (cookieValue, expected) => {
    if (cookieValue !== undefined) {
      mockCookieStore[LOCALE_KEY] = cookieValue;
    }

    const config = await resolveRequestConfig();

    expect(config.locale).toBe(expected);
    expect(Object.keys(config.messages ?? {}).sort()).toEqual([
      'administration',
      'auth',
      'common',
      'customer',
      'provider',
    ]);
  });
});
