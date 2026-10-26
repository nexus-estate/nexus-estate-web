import { getApiBaseUrl } from './base-url';

describe('API URLs through a development tunnel', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, NODE_ENV: 'development' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it.each([
    'http://localhost:3001/api/v1',
    'http://127.0.0.1:50001/api/v1/',
    'http://[::1]:3001/api/v1',
  ])('routes loopback API %s through the frontend origin', (url) => {
    process.env.NEXT_PUBLIC_API_URL = url;
    expect(getApiBaseUrl()).toBe('/api/v1');
  });

  it('preserves a public API endpoint in development', () => {
    process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com/api/v1/';
    expect(getApiBaseUrl()).toBe('https://api.example.com/api/v1');
  });

  it('preserves the configured API in production', () => {
    process.env = { ...process.env, NODE_ENV: 'production' };
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001/api/v1';
    expect(getApiBaseUrl()).toBe('http://localhost:3001/api/v1');
  });

  it('does not mistake a public hostname starting with localhost for loopback', () => {
    process.env.NEXT_PUBLIC_API_URL = 'https://localhost.example.com/api/v1';
    expect(getApiBaseUrl()).toBe('https://localhost.example.com/api/v1');
  });
});
