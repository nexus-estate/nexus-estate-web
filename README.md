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

The project depends on the private `@nexus-estate/typescript-sdk` package from
GitHub Packages. Create a local `.npmrc` before the first image build:

```bash
cp .npmrc.example .npmrc
```

Then replace the placeholder with a token that can read packages:

```ini
@nexus-estate:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_PACKAGES_TOKEN
```

The token needs permission to read packages. Both `.npmrc` and `.env` are
ignored by Git, and `.npmrc` is not copied into the Docker build context.

Copy the environment template, adjust the API URL if needed, then start the
production container:

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
Rebuild the image after changing it. If your npm config is stored elsewhere,
set `NPMRC_PATH` in `.env` to that file path.

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
