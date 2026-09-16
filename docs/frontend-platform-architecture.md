# Frontend platform architecture

Nexus Estate remains one Next.js application and repository with three product
shells: Marketplace/Customer, Provider/Supply, and Administration/ERP.

There are only two authentication realms. Marketplace and Provider use the
Customer token; Provider adds a selected `X-Provider-Id` context and resolves
authorization for a `ProviderMembership`. Administration uses an independent
Administrator token. A Provider is never a third login realm.

The shared API transport owns timeout, error parsing, locale (`x-lang`), and
realm refresh coordination. Customer, Provider, and Administration API modules
own their DTOs and React Query namespaces. Frontend permission checks only shape
UX; the backend remains authoritative.

Provider context discovery for multiple memberships is not available in the
current backend. A future Customer-facing `GET /providers/me/contexts` (or
equivalent) is required before offering a context switcher. Administration
membership APIs are not used by Provider UI.

Customer navigation stays consumer-facing. Provider owns supply operations.
Administration navigation is permission-based and manages authorization across
Marketplace, ProviderMembership, and Administration subject types.

## Runtime platform boundary

The application is built once and published once per source SHA. The same
immutable image is started with one of these runtime values:

```text
WEB_PLATFORM=marketplace
WEB_PLATFORM=provider
WEB_PLATFORM=admin
```

`lib/platform/config.ts` is the only application abstraction that reads
`process.env.WEB_PLATFORM`. Invalid values fail immediately. A missing value
has a temporary Marketplace fallback in development/test to support the
frontend-first rollout, but production throws instead of silently selecting a
platform.

`proxy.ts` enforces route ownership at the request boundary. The audited
ownership is:

| Platform       | Root                    | Owned routes                                                           |
| -------------- | ----------------------- | ---------------------------------------------------------------------- |
| Marketplace    | `/`                     | `/`, `/properties/*`, `/profile`, `/dashboard/*`, `/signin`, `/signup` |
| Provider       | redirect to `/provider` | `/provider/*` and Customer auth landing                                |
| Administration | redirect to `/admin`    | `/admin/*`                                                             |

The conceptual Provider `/dashboard/*` route is not present in this source
tree; `/dashboard/*` is Customer-owned and is blocked from Provider. Foreign
and unknown application routes return 404 from the request layer. `/_next/*`,
public assets, `favicon.ico`, `robots.txt`, `sitemap.xml`, and `/api/healthz`
remain shared. Hostnames are intentionally absent from this logic; deployment
infrastructure chooses them.

## Infrastructure handoff contract

| Platform    | `WEB_PLATFORM` | Root behavior               | Owned routes                             |
| ----------- | -------------- | --------------------------- | ---------------------------------------- |
| Marketplace | `marketplace`  | render Marketplace at `/`   | customer/marketplace routes listed above |
| Provider    | `provider`     | redirect `/` to `/provider` | `/provider/*` plus Customer auth landing |
| Admin       | `admin`        | redirect `/` to `/admin`    | `/admin/*`                               |

- Health path: `GET /api/healthz` (HTTP 200, no backend dependency).
- Container port: `3000`.
- Required runtime env: `WEB_PLATFORM` in production; `NODE_ENV=production` is
  expected. `NEXT_PUBLIC_API_URL` remains the browser API URL build contract
  and is embedded during the image build.
- The shared API transport remains the owner of timeout, error parsing, locale,
  bearer attachment, and refresh coordination.
- Auth storage caveat: Customer access/refresh tokens are in
  `localStorage` under `nexus.customer.access_token` and
  `nexus.customer.refresh_token`; Administrator tokens are in
  `localStorage` under `nexus.administration.access_token` and
  `nexus.administration.refresh_token`. Provider only stores
  `nexus.provider.active_id` and sends the Customer token with
  `X-Provider-Id`. `localStorage` is origin-scoped, so Customer sessions do
  not automatically share between Marketplace and Provider hostnames. No
  cookie sharing is currently involved; a future HttpOnly/BFF session would be
  a separate auth migration.

Rollout order is frontend support with the temporary fallback, infrastructure
runtime creation, endpoint verification, legacy runtime removal, then removal
of the fallback in a later frontend change. This repository does not encode a
production hostname and does not modify the infrastructure repository.

## UI architecture

`components/ui` owns generic primitives and accessible interaction patterns
(controls, panels, tables, loading and status states). `components/portal` owns
the shared responsive application shell; Provider and Administration supply
their own translated navigation and identity context. Marketplace uses the
same tokens and primitives but keeps a consumer-oriented composition with
property imagery and more whitespace.

Pages follow `PageHeader → actions/context → content surface → loading, empty,
error, or success state`. New navigation items should be added to the owning
layout configuration and have a localized label in both catalogues. Raw route
segments, permission codes, IDs, and user-created names are never presented as
translated UI copy.

`PortalShell` owns the responsive shell, topbar, sidebar, and route-metadata
breadcrumbs shared by Provider and Administration. Navigation items declare
their matching mode (`exact` or `prefix`); exact overview routes do not stay
active on nested pages. Marketplace remains outside this ERP-oriented shell.
