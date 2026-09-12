This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

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

`NEXT_PUBLIC_API_URL` is embedded into the browser bundle during image build.
Rebuild the image after changing it.

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

Husky runs `npm run test:precommit` before each commit. It checks formatting,
linting, TypeScript, unit tests, and the production build. Browser e2e tests
and Docker publication remain CI checks.
