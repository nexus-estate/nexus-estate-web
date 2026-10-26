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

Copy the environment template and set the API and platform URLs for your local
services. `NEXT_PUBLIC_MARKETPLACE_URL`, `NEXT_PUBLIC_PROVIDER_URL`, and
`NEXT_PUBLIC_ADMIN_URL` are required even when running only one platform,
because navigation links are rendered in shared components.

```bash
test -f .env || cp .env.example .env
```

Restart the dev server after changing any `NEXT_PUBLIC_*` value so Next.js
embeds the new value in client code.

Then run one platform locally on its assigned port:

```bash
npm run dev:marketplace # http://localhost:3000
npm run dev:provider    # http://localhost:3003/provider
npm run dev:admin       # http://localhost:3002/admin
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Outside production, a missing `WEB_PLATFORM` temporarily falls back to
Marketplace for migration compatibility. Production requires a valid value
and fails fast otherwise.

## Local testing through Cloudflare Tunnel

In development, browser API and media requests configured with a loopback URL
(such as `NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1`) use `/api/v1`
on the frontend origin. Next.js forwards them to the local backend, so remote
browsers can test login, data fetching, and uploads through the HTTPS FE tunnel.
Production continues to use the configured public API URL.

For `npm run dev`, the proxy destination defaults to `NEXT_PUBLIC_API_URL`.
For Docker Compose, it defaults to `http://host.docker.internal:3001/api/v1`.
Set `API_PROXY_TARGET` to override the backend URL reachable from the FE server.
Keep the full API prefix in this value. The backend must be running and, for
Docker access through the host gateway, listening on an interface reachable
from the containers.

Quick Tunnel hostnames (`*.trycloudflare.com`) are allowed for dev assets/HMR.
For a named tunnel, set `DEV_ALLOWED_ORIGINS=admin.example.com` (comma-separated
hostnames without scheme or port). Set the `NEXT_PUBLIC_*` platform URLs to
their tunnel URLs when testing navigation between platforms. Each platform
still needs its own dev server and tunnel.

Restart the dev server after changing this configuration. With Compose, run
`docker compose up -d --force-recreate` to apply the new environment and host
gateway settings.

## Run with Docker Compose (local development)

The default `docker-compose.yml` runs all three platforms with `next dev`.
Start them once:

```bash
test -f .env || cp .env.example .env
docker compose config --quiet
docker compose up -d --build
docker compose ps
```

Source code is mounted directly from this checkout into every container.
Saving a page, component, stylesheet, or translation updates the running dev
servers through Next.js Fast Refresh. You do not need to rebuild or restart
Docker for ordinary source edits. All three platforms see the same source.
Container dependencies and `.next` caches use separate anonymous volumes for
each service, keeping them independent from host dependencies and each other.

| Service     | Host URL                                                         | Container port |
| ----------- | ---------------------------------------------------------------- | -------------- |
| Marketplace | [http://localhost:3000](http://localhost:3000)                   | 3000           |
| Provider    | [http://localhost:3003/provider](http://localhost:3003/provider) | 3000           |
| Admin       | [http://localhost:3002/admin](http://localhost:3002/admin)       | 3000           |

With the default local API URL, the browser calls `/api/v1` on the frontend;
the development server forwards it to the backend on host port 3001.
Compose passes the `NEXT_PUBLIC_*` values from `.env` into the development
servers. After changing these values, recreate the containers to apply them:

```bash
docker compose up -d --force-recreate
```

When changing `package.json`, `package-lock.json`, or the Dockerfile, refresh
the development image and its dependency volumes:

```bash
docker compose up -d --build --force-recreate --renew-anon-volumes
```

To inspect development logs or stop the frontend services:

```bash
docker compose logs -f marketplace provider admin
docker compose down
```

## Production Docker build

`docker-compose.prod.yml` runs the standalone production image. Select it
explicitly when testing a release or deploying:

```bash
docker compose -f docker-compose.prod.yml config --quiet
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

Both files manage the same frontend services and ports; switching modes
replaces those services. Production code and `NEXT_PUBLIC_*` values are
embedded during image build, so production changes require rebuilding the
image. `WEB_PLATFORM` remains runtime configuration. The liveness endpoint is
`GET /api/healthz`; it returns HTTP 200 without calling the backend.

Build one immutable production image with the three URLs for the environment,
then run it with three different `WEB_PLATFORM` values. Cross-platform
navigation works across origins, but Customer tokens in `localStorage` remain
origin-local; this does not provide SSO.

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
