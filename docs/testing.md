# Frontend testing

Unit and contract fixtures cover realm headers, refresh isolation, backend DTO
shapes, and Provider lifecycle resolution. The current Playwright smoke suite
starts the production build and verifies the public application. Full
Customer → Provider → Administration approval flows require an isolated API and
PostgreSQL fixture environment; they must not run against shared staging data.

Before delivery, run `npm run test:precommit`. This is the local CI-equivalent
gate: it runs formatting, i18n parity, linting, TypeScript, unit tests,
production build, browser E2E, Docker validation, and the isolated
API/PostgreSQL lifecycle. It requires a sibling `../api` checkout and Docker.
The lifecycle runner starts an ephemeral PostgreSQL container, runs migrations,
waits on the API health endpoint with a bounded timeout, runs the Playwright
suite, and always cleans up its API process and container.
