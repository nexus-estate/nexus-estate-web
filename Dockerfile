# ================================================================
# Stage 0: Base — shared configuration
# ================================================================
FROM node:24-alpine AS base

RUN addgroup --gid 1001 -S nodejs && \
    adduser --uid 1001 -S nextjs -G nodejs

WORKDIR /app

COPY package*.json ./

# ================================================================
# Stage 1: Development
# ================================================================
FROM base AS development

ENV NODE_ENV=development

RUN --mount=type=secret,id=npmrc,target=.npmrc npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]

# ================================================================
# Stage 2: Dependencies — install all deps (including devDependencies)
# ================================================================
FROM base AS deps

RUN --mount=type=secret,id=npmrc,target=.npmrc npm ci

RUN rm -f .npmrc

# ================================================================
# Stage 3: Builder — compile TypeScript and build Next.js app
# ================================================================
FROM node:24-alpine AS builder

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

COPY . .

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ================================================================
# Stage 4: Runner — minimal runtime image with standalone output
# ================================================================
FROM node:24-alpine AS runner

RUN addgroup --gid 1001 -S nodejs && \
    adduser --uid 1001 -S nextjs -G nodejs

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

RUN chown -R nextjs:nodejs /app

EXPOSE 3000

USER nextjs

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]