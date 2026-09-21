/**
 * @jest-environment node
 */

import { GET } from './route';

describe('legacy Marketplace listing route handler', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_PROVIDER_URL = 'https://provider.example.com';
  });

  it('responds 307 to the configured Provider origin, never a relative path', () => {
    const response = GET();

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe(
      'https://provider.example.com/provider/properties/new',
    );
  });

  it('trims and validates the configured provider base URL', () => {
    process.env.NEXT_PUBLIC_PROVIDER_URL = 'https://provider.example.com///';

    expect(GET().headers.get('location')).toBe(
      'https://provider.example.com/provider/properties/new',
    );
  });
});
