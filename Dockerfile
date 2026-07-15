# ================================================================
# Stage 0: Dependencies – install all deps (including devDependencies)
# ================================================================
FROM node:24-alpine AS deps

ARG NODE_AUTH_TOKEN
ENV NODE_AUTH_TOKEN=$NODE_AUTH_TOKEN

WORKDIR /app

# Copy package manifests and .npmrc for GitHub Packages auth
COPY package*.json .npmrc ./

# Install all dependencies in a reproducible way
RUN npm ci

# Remove .npmrc (it contains credentials)
RUN rm -f .npmrc

# ================================================================
# Stage 1: Builder – compile TypeScript and build Next.js app
# ================================================================
FROM node:24-alpine AS builder

# Build-time args for Next.js public env vars (must be passed via --build-arg)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

WORKDIR /app

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy the rest of the source code
COPY . .

# Build the Next.js application (outputs standalone + static files)
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ================================================================
# Stage 2: Runner – minimal runtime image with standalone output
# ================================================================
FROM node:24-alpine AS runner

# Create a non-root user (UID 1001) for better security
RUN addgroup --gid 1001 -S nodejs && \
    adduser --uid 1001 -S nextjs -G nodejs

WORKDIR /app

# Set environment to production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy standalone output from builder
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Ensure the non-root user owns the files
RUN chown -R nextjs:nodejs /app

EXPOSE 3000

USER nextjs

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]