# Nexus Estate Web — Developer Rules

This document describes the delivery baseline and API conventions for the
standalone Next.js web application.

## Stack and local setup

- Next.js App Router, React, TypeScript strict mode, and Tailwind CSS.
- TanStack React Query owns server state.
- Jest and Playwright cover unit and browser behavior.
- npm uses the public registry. A normal checkout needs no package token or
  private registry configuration.

```bash
npm ci
npm run dev
```

## API architecture

The dependency direction is:

```text
Page / Component
      ↓
React Query hook (when reusable server state is involved)
      ↓
Feature API module under lib/api/
      ↓
lib/api/client.ts
      ↓
nexus-estate-api
```

The feature layout is:

```text
lib/api/
├── client.ts              # shared HTTP transport
├── errors.ts              # ApiError and response normalization
├── auth/                  # auth API and auth boundary types
├── user/                  # user API and user boundary types
├── property/             # property API and property boundary types
├── listing/               # listing API and listing boundary types
├── search/                # search and recommendation reads
├── lead/                  # inquiry writes
├── payment/               # posting package/payment reads and writes
├── media/                 # upload preparation
└── admin/                 # admin-only API methods
```

Feature methods contain route knowledge. The shared client contains only
cross-cutting transport concerns: `NEXT_PUBLIC_API_URL`, JSON request and
response handling, bearer authentication, timeout, no-content responses, and
normalized errors.

Use local boundary types beside the feature API. A small amount of duplicated
DTO typing is preferable to a private package release pipeline. Do not invent
placeholder endpoints or put business rules in the web application.

## Errors

All failed HTTP responses are represented by `ApiError`:

```text
ApiError
├── status
├── code
├── message
├── details
└── requestId
```

The parser accepts both the current NestJS error shape (`message`,
`statusCode`, `error`) and the stable Nexus Estate envelope. Feature code
should display or branch on the normalized error rather than parsing response
bodies itself.

## Authentication

The current browser behavior is preserved: the access token is stored under
`nexus_access_token`, the refresh token under `nexus_refresh_token`, and the
cached user under `nexus_user`. `hooks/use-auth.ts` owns the browser session;
the shared client attaches the access token to requests. Authentication
storage changes require a separate security decision.

## UI and state rules

- Do not call `fetch` or `axios` from pages or components.
- Use `useQuery` for reads and `useMutation` for writes.
- Keep query keys stable and invalidate affected feature queries after writes.
- Preserve loading, empty, and error states.
- Keep UI changes separate from repository and transport cleanup.

## Verification

The expected local baseline is:

```bash
npm ci
npm run format:check
npm run lint
npm run type-check
npm test -- --ci --no-cache
npm run build
npm run test:e2e
docker build .
docker compose config
```

GitHub Actions repeats the quality checks, browser tests, and Docker build.
The image publishing job authenticates only to GHCR and keeps the canonical
image name `ghcr.io/nexus-estate/nexus-estate-web:<tag-or-sha>`.
