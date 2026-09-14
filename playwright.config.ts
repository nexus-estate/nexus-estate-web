import { defineConfig, devices } from '@playwright/test';

const e2ePort = process.env.E2E_PORT ?? '3000';

export default defineConfig({
  testDir: './e2e',
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
  webServer: {
    command: 'npm run start',
    url: `http://localhost:${e2ePort}`,
    env: { PORT: e2ePort },
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
