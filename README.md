# Nexus Estate Web

Nexus Estate Web is one Next.js application in one repository. A single
immutable image runs three runtime platforms selected by `WEB_PLATFORM`:

| Platform               | `WEB_PLATFORM` | Root behavior                | Owned routes                                                           |
| ---------------------- | -------------- | ---------------------------- | ---------------------------------------------------------------------- |
| Marketplace / Customer | `marketplace`  | `/` renders Marketplace      | `/`, `/properties/*`, `/profile`, `/dashboard/*`, `/signin`, `/signup` |
| Provider / Supply      | `provider`     | `/` redirects to `/provider` | `/provider/*` plus Customer auth landing                               |
| Administration / ERP   | `admin`        | `/` redirects to `/admin`    | `/admin/*`                                                             |

The current route tree uses `/provider/*` for Supply. `/dashboard/*` is a
Customer dashboard route, so it is blocked from Provider and Administration.
The request-layer platform gate in `proxy.ts` returns 404 for foreign and
unknown application routes; it is not a client-side navigation restriction.

There are two auth realms: Marketplace and Provider use the Customer realm;
Administration uses the independent Administrator realm. Provider context is
selected separately and does not create a third auth realm. Backend
authorization remains authoritative.

## Getting Started

Run a platform locally:

```bash
WEB_PLATFORM=marketplace npm run dev
WEB_PLATFORM=provider npm run dev
WEB_PLATFORM=admin npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Outside production, a missing `WEB_PLATFORM` temporarily falls back to
Marketplace for migration compatibility. Production requires a valid value
and fails fast otherwise.

## Run with Docker Compose

Copy the environment template, adjust the API URL if needed, then start the
production container. Frontend dependencies use the public npm registry; no
package token is required:

```bash
cp .env.example .env
docker compose up --build -d
docker compose ps
```

Open [http://localhost:3000](http://localhost:3000). To stop the service:

```bash
docker compose down
```

`NEXT_PUBLIC_API_URL` is embedded into the browser bundle during image build,
so rebuild after changing it. `WEB_PLATFORM` is runtime configuration and is
not a build argument. The stable liveness endpoint is `GET /api/healthz`; it
returns HTTP 200 without calling the backend. The container listens on port
`3000`.

`NEXT_PUBLIC_MARKETPLACE_URL`, `NEXT_PUBLIC_PROVIDER_URL`, and
`NEXT_PUBLIC_ADMIN_URL` are also embedded during image build. Build one
immutable image with the three URLs for the environment, then run it with the
three different `WEB_PLATFORM` values. Cross-platform navigation works across
origins, but Customer tokens in `localStorage` remain origin-local; this does
not provide SSO.

Build one image for one source SHA, then run that same image three times:

```bash
docker build --build-arg NEXT_PUBLIC_API_URL="$NEXT_PUBLIC_API_URL" \
  --build-arg NEXT_PUBLIC_MARKETPLACE_URL="$NEXT_PUBLIC_MARKETPLACE_URL" \
  --build-arg NEXT_PUBLIC_PROVIDER_URL="$NEXT_PUBLIC_PROVIDER_URL" \
  --build-arg NEXT_PUBLIC_ADMIN_URL="$NEXT_PUBLIC_ADMIN_URL" \
  -t ghcr.io/nexus-estate/nexus-estate-web:<SHA> .
docker run -e WEB_PLATFORM=marketplace ...
docker run -e WEB_PLATFORM=provider ...
docker run -e WEB_PLATFORM=admin ...
```

## API architecture

The web app owns a small local API boundary under `lib/api/`. Feature modules
define their request and response types beside their API functions, while
`lib/api/client.ts` owns the base URL, bearer token, JSON handling, timeout,
and normalized `ApiError` behavior. Pages and components use feature APIs
through React Query or a feature hook; they do not call `fetch` directly.

The backend remains the owner of the HTTP contract. If contract drift becomes
recurring, OpenAPI generation can be added as a build step without introducing
a separately published frontend SDK.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Pre-commit checks

Husky runs `npm run test:precommit` before each commit. The gate mirrors the
repository CI checks: formatting, i18n parity, linting, TypeScript, unit tests,
production build, browser E2E, Docker validation, and the isolated
API/PostgreSQL platform lifecycle. The lifecycle gate uses Docker and validates
the sibling `../api` checkout before starting the API. The Husky hook defaults
to the current local API `HEAD`, which supports committing the web changes
alongside an API feature branch. Set `NEXUS_API_ROOT` to override the API path
or `NEXUS_API_EXPECTED_REF` to explicitly test another remote branch or API
commit. Running `npm run test:precommit` directly keeps the CI-parity default
of checking the live `origin/develop` branch with `git ls-remote`. The gate
does not check out, pull, reset, or clean the sibling repository.

For pull requests, the integration workflow first looks for an API branch with
the same name as the web branch and falls back to API `develop` when no matching
branch exists. Push the API feature branch before opening the web PR when the
E2E flow depends on backend changes that are not yet in `develop`.
