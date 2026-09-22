import nextJest from 'next/jest.js';
import type { Config } from 'jest';

const createJestConfig = nextJest({
  dir: './',
});

const config: Config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/e2e/',
  ],
  modulePathIgnorePatterns: ['<rootDir>/.next/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    // Barrels only re-export; counting them measures nothing.
    '!**/index.ts',
  ],
  /*
   * Gate the shared library layer, where a silent regression is expensive and
   * cheap to protect (pure functions, no DOM). Page components are covered by
   * the Playwright suites instead, so they are not ratio-gated here.
   * CI runs `npm test -- --coverage`; thresholds are enforced only then.
   */
  coverageThreshold: {
    // Present (and empty) because jest's type requires the key.
    global: {},
    './lib/': {
      statements: 72,
      branches: 74,
      functions: 64,
      lines: 75,
    },
  },
};

export default createJestConfig(config);
