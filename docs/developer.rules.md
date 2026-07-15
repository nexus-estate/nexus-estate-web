# Nexus Estate Web — Developer Rules

> This document is the **single source of truth** for architecture, conventions, and development rules of the Nexus Estate Web application.
> Every team member must read and follow these rules before contributing code.

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Project Structure](#2-project-structure)
3. [Naming Conventions](#3-naming-conventions)
4. [TypeScript & Type Safety](#4-typescript--type-safety)
5. [Component Rules](#5-component-rules)
6. [Styling Rules](#6-styling-rules)
7. [State Management](#7-state-management)
8. [API Integration](#8-api-integration)
9. [Authentication & Authorization](#9-authentication--authorization)
10. [Error Handling](#10-error-handling)
11. [Performance](#11-performance)
12. [Testing Rules](#12-testing-rules)
13. [Import Rules](#13-import-rules)
14. [Environment Variables](#14-environment-variables)
15. [Git & Branch Conventions](#15-git--branch-conventions)
16. [CI/CD Pipeline](#16-cicd-pipeline)
17. [Shared Contracts Integration](#17-shared-contracts-integration)
18. [Event-Driven Architecture](#18-event-driven-architecture)
19. [API Contract-First Workflow](#19-api-contract-first-workflow)

---

## 1. System Architecture

### 1.1 Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js 16 App                         │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │                  App Router                         │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │  │
│  │  │  Layouts  │  │  Pages   │  │  Loading/Error   │ │  │
│  │  └──────────┘  └──────────┘  └──────────────────┘ │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌───────────────┐   │
│  │  Components  │  │    Hooks     │  │     Lib       │   │
│  │  (UI Layer)  │  │  (Logic)     │  │  (Utilities)  │   │
│  └─────────────┘  └─────────────┘  └───────────────┘   │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │              API Client (lib/api-client.ts)          │  │
│  │         Uses @nexus-estate/typescript-sdk           │  │
│  └────────────────────────┬───────────────────────────┘  │
└───────────────────────────┼──────────────────────────────┘
                            │ HTTP/REST + JWT
                            ▼
                  ┌──────────────────┐
                  │   API Gateway    │
                  │  (NestJS :3001)  │
                  └──────────────────┘
```

### 1.2 Tech Stack

| Layer           | Technology                                  | Version |
| --------------- | ------------------------------------------- | ------- |
| Framework       | Next.js (App Router)                        | 16.x    |
| UI Library      | React                                       | 19.x    |
| Language        | TypeScript                                  | 5.x     |
| Styling         | Tailwind CSS                                | 4.x     |
| Linting         | ESLint (flat config)                        | 9.x     |
| Formatting      | Prettier                                    | 3.x     |
| Unit Testing    | Jest + Testing Library                      | 30.x    |
| E2E Testing     | Playwright                                  | 1.50+   |
| Server State    | TanStack React Query                        | 5.x     |
| API SDK         | @nexus-estate/typescript-sdk                | 1.x     |
| UI Primitives   | Custom (Button, Input, Card, Select, Badge) | —       |
| Notifications   | react-hot-toast                             | 2.x     |
| i18n            | Custom (vi/en)                              | —       |
| Node.js         | Node.js                                     | 24.x    |
| Package Manager | npm                                         | 10.x    |

### 1.3 Design Principles

- **Server-first:** Prefer Server Components; use `'use client'` only when needed.
- **Type-safe:** No `any`, strict TypeScript, all props typed, use SDK types from `@nexus-estate/typescript-sdk`.
- **Performance:** Optimize images, lazy-load below-fold, minimize client JS.
- **Accessible:** Semantic HTML, ARIA attributes, keyboard navigation.
- **Responsive:** Mobile-first design with Tailwind breakpoints.
- **Internationalized:** Full vi/en i18n support via `useTranslations()` hook.
- **Contract-first:** API contracts defined in `shared-contracts` before implementation.

---

## 2. Project Structure

```
web/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI pipeline
├── .husky/
│   └── pre-commit             # lint-staged hook
├── app/                        # Next.js App Router
│   ├── layout.tsx             # Root layout (QueryProvider + I18nProvider + AuthProvider)
│   ├── page.tsx               # Homepage (Server Component)
│   ├── globals.css            # Global styles (Tailwind)
│   ├── (auth)/                # Auth route group
│   │   ├── signin/page.tsx
│   │   └── signup/page.tsx
│   ├── (main)/                # Main app route group
│   │   ├── layout.tsx         # Shared layout (header/footer)
│   │   ├── dashboard/
│   │   ├── profile/
│   │   └── properties/
│   └── admin/
├── components/
│   ├── ui/                    # UI primitives (Button, Input, Card, Select, Badge)
│   ├── layout/                # Layout components (Header, Footer)
│   └── features/              # Feature-specific components
├── hooks/                      # Custom React hooks
│   ├── use-auth.ts            # Auth hook via SDK AuthApi
│   └── use-properties.ts      # React Query hooks for properties
├── lib/                        # Utilities & services
│   ├── api-client.ts          # SDK ApiClient + API instances
│   ├── auth-context.tsx       # Legacy auth context (AuthProvider)
│   ├── constants.ts           # App constants
│   ├── i18n.tsx               # i18n provider + useTranslations hook
│   └── query-client.tsx       # React Query provider
├── messages/                   # i18n translation files (inlined in i18n.tsx)
├── types/                      # Type re-exports
│   └── auth.ts                # SDK type re-exports
├── e2e/                        # Playwright E2E tests
├── docs/                       # Project documentation
│   ├── README.md
│   └── developer.rules.md
├── public/                     # Static assets
├── .nvmrc                      # Node 24
├── .prettierrc
├── .prettierignore
├── eslint.config.mjs
├── jest.config.ts
├── jest.setup.ts
├── playwright.config.ts
├── next.config.ts
├── postcss.config.mjs
└── tsconfig.json
```

---

## 3. Naming Conventions

### 3.1 Files & Directories

| Type          | Convention                      | Example                    |
| ------------- | ------------------------------- | -------------------------- |
| **Page**      | `page.tsx` (Next.js convention) | `app/properties/page.tsx`  |
| **Layout**    | `layout.tsx`                    | `app/(main)/layout.tsx`    |
| **Component** | `PascalCase.tsx`                | `components/ui/Button.tsx` |
| **Hook**      | `use-kebab-case.ts`             | `hooks/use-auth.ts`        |
| **Utility**   | `kebab-case.ts`                 | `lib/api-client.ts`        |
| **Test**      | `*.test.tsx` / `*.spec.ts`      | `Button.test.tsx`          |
| **i18n**      | Inline in `lib/i18n.tsx`        | —                          |

### 3.2 Component Structure

```typescript
// 1. Directive (if client)
'use client';

// 2. Imports
import { useState } from 'react';
import type { Property } from '@nexus-estate/typescript-sdk';

// 3. Props interface
interface PropertyCardProps {
  property: Property;
  variant?: 'compact' | 'full';
}

// 4. Named export
export function PropertyCard({
  property,
  variant = 'full',
}: PropertyCardProps) {
  // hooks → derived → handlers → render
}
```

---

## 4. TypeScript & Type Safety

- **`any` is PROHIBITED.** Use concrete types from SDK or define interfaces.
- **No `@ts-ignore` or `@ts-nocheck`.** Fix the type error.
- **Use SDK types** from `@nexus-estate/typescript-sdk` for all API responses.
- **No type assertions** (`as`) unless absolutely necessary.
- **No `Math.random()` in render** — use deterministic functions (e.g., hash IDs for gradients).
- **No `setState` in effect body** — use derived state or `useMemo`.

---

## 5. Component Rules

- **Default: Server Component.** Use `'use client'` only for hooks, browser APIs, event handlers.
- **One component per file.**
- **Named exports** for components (default export only for pages/layouts).
- **Props interface** for every component accepting props.
- **Colocate tests:** `Button.test.tsx` next to `Button.tsx`.
- **UI primitives** in `components/ui/` should be reusable with forwardRef.

---

## 6. Styling Rules

- **Tailwind CSS only.** No CSS modules, styled-components, inline styles.
- **Mobile-first responsive design.**
- **No `@apply`** — extract repeated patterns as components instead.
- **Extend design tokens** via `tailwind.config.ts` if needed.

---

## 7. State Management

| State Type           | Solution                                      |
| -------------------- | --------------------------------------------- |
| Server state (read)  | TanStack React Query (`useQuery`)             |
| Server state (write) | TanStack React Query (`useMutation`)          |
| Auth state           | `useAuth()` hook (SDK AuthApi + localStorage) |
| UI state (forms)     | `useState`                                    |
| URL state            | `useSearchParams`, `usePathname`              |
| i18n                 | `useTranslations()` hook from `@/lib/i18n`    |
| Toast notifications  | `react-hot-toast`                             |

---

## 8. API Integration

### 8.1 SDK Client

**Always use `@nexus-estate/typescript-sdk`** for API calls:

```typescript
// ✅ DO: Use SDK client
import { apiClient } from '@/lib/api-client';

const response = await apiClient.get<Property[]>('/properties');
const properties = response.data;

// ✅ DO: Use React Query
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

const { data, isLoading } = useQuery({
  queryKey: ['properties', filters],
  queryFn: async () => {
    const res = await apiClient.get<Property[]>('/properties');
    return res.data;
  },
});
```

### 8.2 SDK Architecture

```
lib/api-client.ts:
  - Creates Configuration with basePath + accessToken getter
  - Creates ApiClient from @nexus-estate/typescript-sdk
  - Exports: apiClient, authApi, propertiesApi, listingsApi, searchApi, mediaApi
  - Re-exports: Configuration, ApiClient

hooks/use-auth.ts:
  - Uses authApi (from SDK) for login/register/getProfile
  - Manages JWT in localStorage (nexus_access_token)
  - Manages user in localStorage (nexus_user)

hooks/use-properties.ts:
  - Uses apiClient + propertiesApi (from SDK)
  - React Query hooks: useProperties(filters), useProperty(id), useCreateProperty()
```

### 8.3 Server-side Data Fetching

In Server Components, use direct `fetch` calls (not SDK):

```typescript
// app/properties/page.tsx (Server Component)
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

async function fetchProperties() {
  const res = await fetch(`${API_BASE}/properties?limit=8`, {
    next: { revalidate: 60 }, // ISR
  });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data ?? json;
}
```

### 8.4 Shared Contracts Event Integration

The web may consume or display events from these domains:

| Event                    | Description             | What to Display         |
| ------------------------ | ----------------------- | ----------------------- |
| `listing.published`      | New listing published   | Real-time notification  |
| `listing.updated`        | Listing details changed | Toast: listing updated  |
| `listing.deleted`        | Listing removed         | Redirect/remove from UI |
| `media.ready`            | Media processed         | Show image/video        |
| `payment.completed`      | Payment successful      | Show confirmation       |
| `user.behavior_recorded` | User activity tracked   | Personalize UI          |

Web does not publish domain events — it consumes from API Gateway responses.

---

## 9. Authentication & Authorization

1. User submits credentials → SDK `authApi.login()` → returns `LoginResponse`.
2. JWT stored in `localStorage` (`nexus_access_token`).
3. User stored in `localStorage` (`nexus_user`) as JSON.
4. SDK interceptor automatically attaches `Authorization: Bearer <token>`.
5. `useAuth()` hook provides reactive `user`, `isAuthenticated`, `login`, `register`, `logout`, `getProfile`.
6. Protected routes via `ProtectedRoute` wrapper component.

### Auth Naming Convention

The SDK uses these API endpoints (v2.0 breaking changes):

- `/auth/login` (not `signin`)
- `/auth/register` (not `signup`)
- `/auth/refresh`
- `/auth/profile`

Frontend hooks use `login`, `register`, `logout` to match SDK naming.

---

## 10. Error Handling

- **Error boundaries** at route level (`error.tsx`).
- **API errors** caught by SDK interceptor → user-friendly toast messages.
- **Never swallow errors** — always log via `console.error` in dev.
- **Graceful degradation** — show fallback UI, not broken pages.

---

## 11. Performance

- **Use `next/image`** for images with proper `sizes`.
- **Dynamic imports** for heavy components (`dynamic(() => import(...))`).
- **Minimize `'use client'`** boundaries.
- **Use `loading.tsx`** for streaming/suspense.
- **ISR** for caching: `next: { revalidate: 60 }`.
- **No `Math.random()` in render** — causes hydration mismatch.
- **React Query caching** — reduces API calls.

---

## 12. Testing Rules

| Level | Tool                   | Target                   |
| ----- | ---------------------- | ------------------------ |
| Unit  | Jest + Testing Library | Components, hooks, utils |
| E2E   | Playwright             | Full user journeys       |

- **No snapshot tests.**
- **Mock API calls** via MSW or jest mocking.
- **Colocate unit tests** — `Component.test.tsx` next to `Component.tsx`.
- **E2E in `e2e/`** directory.

---

## 13. Import Rules

```typescript
// 1. React/Next.js
import { useState } from 'react';
import Link from 'next/link';

// 2. Third-party
import { useQuery } from '@tanstack/react-query';
import type { User } from '@nexus-estate/typescript-sdk';

// 3. Internal (using @/ alias)
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/lib/constants';

// 4. Relative (same directory)
import { PropertyCard } from './PropertyCard';
```

---

## 14. Environment Variables

| Variable              | Type            | Default                     |
| --------------------- | --------------- | --------------------------- |
| `NEXT_PUBLIC_API_URL` | Client + Server | `http://localhost:3001/api` |

---

## 15. Git & Branch Conventions

```
feature/<description>   → feature/property-search
fix/<description>       → fix/auth-token-expiry
chore/<description>     → chore/update-dependencies
```

Commit format: `type(scope): description` (Conventional Commits)

---

## 16. CI/CD Pipeline

```
PR / Push → CI Job: install → format:check → lint → type-check → test → build → E2E
```

CI triggered on push/PR to `main` and `develop` branches.

---

## 17. Shared Contracts Integration

### 17.1 Overview

This project uses `@nexus-estate/typescript-sdk` as the single source of truth for all API types and client code. The SDK is published to **GitHub Packages** (`npm.pkg.github.com`) from the `shared-contracts` repo.

**Package:** `@nexus-estate/typescript-sdk` (v1.x)
**Registry:** GitHub Packages (`https://npm.pkg.github.com`)
**Auth:** `.npmrc` with `NODE_AUTH_TOKEN` (set automatically in CI via `${{ secrets.GITHUB_TOKEN }}`)

**Important:** This is a multi-repo architecture. Do NOT use `file:` dependencies — they break in CI/CD. The SDK is published independently and consumed via the npm registry.

### 17.2 SDK API Clients

| API Client            | Endpoints                            | Used In               |
| --------------------- | ------------------------------------ | --------------------- |
| `AuthApi`             | login, register, refresh, getProfile | `hooks/use-auth.ts`   |
| `PropertiesApi`       | list, getById                        | Direct calls in pages |
| `ListingsApi`         | create, list, update                 | Dashboard pages       |
| `SearchApi`           | search, suggest                      | Properties search     |
| `MediaApi`            | upload, getPresignedUrl              | Listing creation      |
| `ApiClient` (generic) | get, post, put, patch, delete        | Custom API calls      |

### 17.3 SDK Types

All API types are re-exported from `@nexus-estate/typescript-sdk`:

```typescript
import type {
  User,
  Property,
  Listing,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ApiResponse,
  PaginationMeta,
} from '@nexus-estate/typescript-sdk';
```

### 17.4 SDK Update Workflow

1. Contracts change in `shared-contracts/openapi/`.
2. SDK is regenerated: `npm run generate:sdk` in shared-contracts.
3. SDK is published: `npm run publish:sdk` (pushed to GitHub Packages).
4. Web project updates dependency: `npm install @nexus-estate/typescript-sdk@latest`.
5. Update code to match any breaking changes.

**Note:** The CI pipeline in web will automatically resolve the latest version when `npm ci` runs (with `NODE_AUTH_TOKEN` from GitHub Actions secrets).

### 17.5 OpenAPI Spec Structure

```
shared-contracts/openapi/
├── public.yaml        # Public API v1.0 (buyers/renters)
├── broker.yaml        # Broker API v2.0
├── admin.yaml         # Admin API v2.0
└── common/
    ├── schemas/       # Reusable schemas (auth, user, property, listing, etc.)
    ├── parameters.yaml
    └── responses.yaml
```

### 17.6 Mock Server

For development without a running API Gateway:

```bash
cd ../shared-contracts && npm run mock:start
# Starts mock server on localhost:4010
```

Set `NEXT_PUBLIC_API_URL=http://localhost:4010/api` in `.env.local`.

---

## 18. Event-Driven Architecture

### 18.1 Domain Events

Events are defined in `shared-contracts/events/` as JSON Schemas:

| Domain            | Events                              | Description            |
| ----------------- | ----------------------------------- | ---------------------- |
| **listing**       | published, updated, deleted         | Listing lifecycle      |
| **media**         | processing_requested, ready, failed | Media processing       |
| **payment**       | created, completed, failed          | Payment lifecycle      |
| **user/behavior** | behavior_recorded                   | User activity tracking |

### 18.2 Event Envelope

Every event follows this envelope schema:

```json
{
  "event_type": "listing.published",
  "event_version": 1,
  "event_id": "uuid",
  "timestamp": "2026-07-12T12:00:00Z",
  "source": "api-gateway",
  "data": {}
}
```

### 18.3 Frontend Event Consumption

The web app consumes events indirectly through:

1. **API responses** — After mutations, invalidate queries to get fresh data.
2. **SSE / WebSocket** — Future: real-time notifications for listing updates.
3. **UI feedback** — `react-hot-toast` for success/error notifications.

---

## 19. API Contract-First Workflow

### 19.1 The Rule

**Define the contract before implementing.** All API changes must follow this order:

1. Define/update schema in `shared-contracts/openapi/`.
2. Validate with Spectral: `npm run lint:openapi`.
3. Generate SDK: `npm run generate:sdk`.
4. Implement in `api-gateway`.
5. Consume in `web` via updated SDK.

### 19.2 Error Codes

Standardized error codes defined in `shared-contracts/error-codes/`:

| Category   | Example Code | Meaning                |
| ---------- | ------------ | ---------------------- |
| Auth       | `AUTH_001`   | Invalid credentials    |
| Validation | `VAL_001`    | Required field missing |
| Business   | `BIZ_001`    | Listing limit exceeded |
| System     | `SYS_001`    | Internal server error  |

Frontend handles errors by mapping error codes to localized messages via `useTranslations()`.

---

## Appendix: Quick Reference

### Scripts

```bash
npm run dev           # Start dev server
npm run build         # Production build
npm run lint          # ESLint check
npm run lint:fix      # ESLint auto-fix
npm run type-check    # TypeScript check
npm run format        # Prettier format
npm run format:check  # Check formatting
npm test              # Unit tests
npm run test:e2e      # Playwright E2E
npm run test:all      # Full precommit: type-check + lint + format:check + test + e2e
```

### SDK Commands

```bash
cd ../shared-contracts/packages/typescript-sdk
npm run build         # Rebuild SDK after changes
```

### i18n Usage

```typescript
'use client';
import { useTranslations } from '@/lib/i18n';

export function MyComponent() {
  const { t, locale } = useTranslations();
  return <h1>{t('home.heroTitle')}</h1>;
}
```

### React Query Pattern

```typescript
'use client';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Property } from '@nexus-estate/typescript-sdk';

const { data, isLoading } = useQuery({
  queryKey: ['properties'],
  queryFn: async () => {
    const res = await apiClient.get<Property[]>('/properties');
    return res.data;
  },
});
```

### Auth Pattern

```typescript
'use client';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/Button';

export function SignInForm() {
  const { login } = useAuth();
  const handleSubmit = async () => {
    await login({ identifier: email, password });
  };
  // ...
}
```
