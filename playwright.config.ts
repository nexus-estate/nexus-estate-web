import { defineConfig, devices } from '@playwright/test';

const e2ePort = process.env.E2E_PORT ?? '3000';
const integration = process.env.E2E_INTEGRATION === 'true';
const multiPlatform = process.env.E2E_MULTI_PLATFORM === 'true';
const providerPort = process.env.E2E_PROVIDER_PORT ?? '3001';
const adminPort = process.env.E2E_ADMIN_PORT ?? '3002';
const platformUrlEnv = {
  NEXT_PUBLIC_MARKETPLACE_URL:
    process.env.NEXT_PUBLIC_MARKETPLACE_URL ?? 'http://localhost:3000',
  NEXT_PUBLIC_PROVIDER_URL:
    process.env.NEXT_PUBLIC_PROVIDER_URL ?? 'http://localhost:3001',
  NEXT_PUBLIC_ADMIN_URL:
    process.env.NEXT_PUBLIC_ADMIN_URL ?? 'http://localhost:3002',
};

export default defineConfig({
  testDir: './e2e',
  testIgnore: integration
    ? []
    : ['**/platform-lifecycle.spec.ts', '**/provider-supply-lifecycle.spec.ts'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'html' : 'list',
  use: {
    baseURL: `http://localhost:${e2ePort}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: multiPlatform
    ? [
        {
          command: 'npm run start',
          url: `http://localhost:${e2ePort}`,
          env: {
            ...platformUrlEnv,
            PORT: e2ePort,
            WEB_PLATFORM: 'marketplace',
          },
          reuseExistingServer: false,
          timeout: 120_000,
        },
        {
          command: 'npm run start',
          url: `http://localhost:${providerPort}`,
          env: {
            ...platformUrlEnv,
            PORT: providerPort,
            WEB_PLATFORM: 'provider',
          },
          reuseExistingServer: false,
          timeout: 120_000,
        },
        {
          command: 'npm run start',
          url: `http://localhost:${adminPort}`,
          env: {
            ...platformUrlEnv,
            PORT: adminPort,
            WEB_PLATFORM: 'admin',
          },
          reuseExistingServer: false,
          timeout: 120_000,
        },
      ]
    : {
        command: 'npm run start',
        url: `http://localhost:${e2ePort}`,
        env: {
          ...platformUrlEnv,
          PORT: e2ePort,
          WEB_PLATFORM: process.env.WEB_PLATFORM ?? 'marketplace',
        },
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
