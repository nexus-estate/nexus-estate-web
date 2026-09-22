import {
  assertRuntimeEnv,
  collectEnvIssues,
  formatEnvIssues,
  getPublicEnv,
} from './env';

const validEnv: NodeJS.ProcessEnv = {
  NODE_ENV: 'production',
  WEB_PLATFORM: 'marketplace',
  NEXT_PUBLIC_API_URL: 'https://api.example.com',
  NEXT_PUBLIC_MARKETPLACE_URL: 'https://marketplace.example.com',
  NEXT_PUBLIC_PROVIDER_URL: 'https://provider.example.com',
  NEXT_PUBLIC_ADMIN_URL: 'https://admin.example.com',
};

function keysFor(env: NodeJS.ProcessEnv) {
  return collectEnvIssues(env).map((issue) => issue.key);
}

describe('environment validation', () => {
  describe('collectEnvIssues', () => {
    it('reports nothing for a complete configuration', () => {
      expect(collectEnvIssues(validEnv)).toEqual([]);
    });

    it('treats a missing platform as fatal only in production', () => {
      const withoutPlatform: NodeJS.ProcessEnv = { ...validEnv };
      delete withoutPlatform.WEB_PLATFORM;

      const dev = collectEnvIssues({
        ...withoutPlatform,
        NODE_ENV: 'development',
      });
      expect(dev.find((issue) => issue.key === 'WEB_PLATFORM')).toMatchObject({
        severity: 'warn',
      });

      const prod = collectEnvIssues({
        ...withoutPlatform,
        NODE_ENV: 'production',
      });
      expect(prod.find((issue) => issue.key === 'WEB_PLATFORM')).toMatchObject({
        severity: 'error',
      });
    });

    it('rejects an unknown platform value', () => {
      const issues = collectEnvIssues({
        ...validEnv,
        WEB_PLATFORM: 'shipping',
      });
      const issue = issues.find((item) => item.key === 'WEB_PLATFORM');
      expect(issue?.severity).toBe('error');
      expect(issue?.message).toContain('shipping');
    });

    it('warns about a missing API URL but rejects a malformed one', () => {
      // Unset values must never stop the server from booting; only invalid
      // ones are unfixable at runtime.
      const missing = collectEnvIssues({
        ...validEnv,
        NEXT_PUBLIC_API_URL: '   ',
      });
      expect(
        missing.find((i) => i.key === 'NEXT_PUBLIC_API_URL'),
      ).toMatchObject({
        severity: 'warn',
        message: expect.stringContaining('not set'),
      });

      const relative = collectEnvIssues({
        ...validEnv,
        NEXT_PUBLIC_API_URL: 'api.example.com',
      });
      expect(
        relative.find((i) => i.key === 'NEXT_PUBLIC_API_URL')?.message,
      ).toContain('api.example.com');
    });

    it('only warns about missing cross-platform origins', () => {
      const issues = collectEnvIssues({
        NODE_ENV: 'production',
        WEB_PLATFORM: 'marketplace',
        NEXT_PUBLIC_API_URL: 'https://api.example.com',
      });
      const platformIssues = issues.filter(
        (issue) =>
          issue.key.startsWith('NEXT_PUBLIC_') &&
          issue.key !== 'NEXT_PUBLIC_API_URL',
      );
      expect(platformIssues).toHaveLength(3);
      expect(platformIssues.every((issue) => issue.severity === 'warn')).toBe(
        true,
      );
    });

    it('rejects unsafe origins (credentials, query, relative)', () => {
      const unsafe = collectEnvIssues({
        ...validEnv,
        NEXT_PUBLIC_PROVIDER_URL: 'https://user:pass@provider.example.com',
      });
      expect(
        unsafe.find((i) => i.key === 'NEXT_PUBLIC_PROVIDER_URL')?.severity,
      ).toBe('error');

      const withQuery = collectEnvIssues({
        ...validEnv,
        NEXT_PUBLIC_ADMIN_URL: 'https://admin.example.com/?tenant=1',
      });
      expect(
        withQuery.find((i) => i.key === 'NEXT_PUBLIC_ADMIN_URL')?.severity,
      ).toBe('error');
    });
  });

  describe('formatEnvIssues', () => {
    it('prefixes each line with its severity and key', () => {
      expect(
        formatEnvIssues([
          { key: 'WEB_PLATFORM', severity: 'error', message: 'missing.' },
        ]),
      ).toBe('  [error] WEB_PLATFORM: missing.');
    });
  });

  describe('assertRuntimeEnv', () => {
    it('throws with the actionable list when something blocks startup', () => {
      expect(() => assertRuntimeEnv({ ...validEnv, WEB_PLATFORM: '' })).toThrow(
        /Invalid environment configuration/,
      );
    });

    it('treats warnings as fatal in production builds', () => {
      const withoutOrigins: NodeJS.ProcessEnv = {
        NODE_ENV: 'production',
        WEB_PLATFORM: 'marketplace',
        NEXT_PUBLIC_API_URL: 'https://api.example.com',
      };
      expect(() => assertRuntimeEnv(withoutOrigins)).toThrow(
        /NEXT_PUBLIC_MARKETPLACE_URL/,
      );
    });

    it('returns the non-blocking issues so callers can log them', () => {
      const env: NodeJS.ProcessEnv = {
        NODE_ENV: 'development',
        NEXT_PUBLIC_API_URL: 'https://api.example.com',
      };
      const issues = assertRuntimeEnv(env);
      expect(issues.map((issue) => issue.key)).toEqual(keysFor(env));
      expect(issues.every((issue) => issue.severity === 'warn')).toBe(true);
      expect(issues.length).toBeGreaterThan(0);
    });
  });

  describe('getPublicEnv', () => {
    const original = { ...process.env };

    afterEach(() => {
      process.env = { ...original };
    });

    it('trims configured values and defaults to an empty string', () => {
      process.env.NEXT_PUBLIC_API_URL = ' https://api.example.com ';
      delete process.env.NEXT_PUBLIC_ADMIN_URL;

      expect(getPublicEnv()).toMatchObject({
        apiUrl: 'https://api.example.com',
        adminUrl: '',
      });
    });
  });
});
