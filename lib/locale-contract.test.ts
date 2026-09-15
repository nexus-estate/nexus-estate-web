import {
  DEFAULT_LOCALE,
  LOCALE_KEY,
  SUPPORTED_LOCALES,
  normalizeLocale,
} from './constants';

describe('locale contract', () => {
  it('has one supported locale contract and a supported default', () => {
    expect(SUPPORTED_LOCALES).toEqual(['en', 'vi']);
    expect(SUPPORTED_LOCALES).toContain(DEFAULT_LOCALE);
    expect(LOCALE_KEY).toBe('nexus.locale');
  });

  it.each([
    [undefined, 'en'],
    ['', 'en'],
    ['fr', 'en'],
    ['en-US', 'en'],
    ['en', 'en'],
    ['vi', 'vi'],
  ])('normalizes %s to %s', (value, expected) => {
    expect(normalizeLocale(value)).toBe(expected);
  });
});
