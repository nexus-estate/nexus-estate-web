import { providerApiClient } from '../client';
import { promotionApi } from './promotion.api';
import { parseDurationDays } from './promotion.validation';

describe('promotion duration contract', () => {
  afterEach(() => jest.restoreAllMocks());

  it('sends only durationDays to the backend promotion route', async () => {
    const post = jest.spyOn(providerApiClient, 'post').mockResolvedValue({});
    await promotionApi.createBanner('listing-1', {
      promotionId: 'promotion-1',
      durationDays: 7,
    });
    expect(post).toHaveBeenCalledWith(
      '/listings/listing-1/promotions/promotion-1',
      { durationDays: 7 },
    );
  });

  it.each([0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])(
    'rejects invalid duration %s before sending a request',
    (durationDays) => {
      const post = jest.spyOn(providerApiClient, 'post');
      expect(() =>
        promotionApi.createBanner('listing-1', {
          promotionId: 'promotion-1',
          durationDays,
        }),
      ).toThrow(RangeError);
      expect(post).not.toHaveBeenCalled();
    },
  );

  it.each(['', '0', '-1', '1.5', '1e2', 'abc', '9007199254740992'])(
    'rejects invalid form input %s',
    (value) => expect(parseDurationDays(value)).toBeNull(),
  );

  it.each([1, 3, 7, 14, 30])('accepts %s whole days', (days) => {
    expect(parseDurationDays(String(days))).toBe(days);
  });
});
