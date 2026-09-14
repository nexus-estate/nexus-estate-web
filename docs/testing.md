# Frontend testing

Unit and contract fixtures cover realm headers, refresh isolation, backend DTO
shapes, and Provider lifecycle resolution. The current Playwright smoke suite
starts the production build and verifies the public application. Full
Customer → Provider → Administration approval flows require an isolated API and
PostgreSQL fixture environment; they must not run against shared staging data.

Before delivery, run `npm run format:check`, `npm run lint`,
`npm run type-check`, `npm test -- --ci --no-cache`, `npm run build`, and
`npm run test:e2e`. Add real-backend lifecycle coverage when the isolated stack
is available in CI.
