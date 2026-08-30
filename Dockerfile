# ================================================================
# Stage 0: Builder image – base configuration
# ================================================================
FROM node:24-alpine AS base

RUN addgroup --gid 1001 -S nodejs && \
    adduser --uid 1001 -S nextjs -G nodejs

WORKDIR /app

# Only copy package constraints initially to optimize caching
COPY package*.json ./

# ================================================================
# Stage 1: Development
# ================================================================
FROM base AS development

ENV NODE_ENV=development

# Mount .npmrc temporarily during local installations
RUN --mount=type=secret,id=npmrc,target=/app/.npmrc npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]

# ================================================================
# Stage 2: Dependencies
# ================================================================
FROM base AS deps

# Absolute target path is used to ensure npm safely picks up the auth token
RUN --mount=type=secret,id=npmrc,target=/app/.npmrc npm ci

# No manual cleanup required; secret mounts are automatically unmounted and kept out of final layers

# ================================================================
# Stage 3: Builder
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
# Stage 4: Runner – minimal runtime image with standalone output
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
