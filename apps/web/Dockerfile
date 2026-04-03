# ================
# Dependencies Stage
# ================
FROM node:20-alpine AS deps
WORKDIR /repo

# Copy workspace manifests
COPY package*.json ./
COPY apps/web/package*.json ./apps/web/

# Install dependencies from the workspace lockfile
RUN npm ci

# ================
# Development Stage
# ================
FROM node:20-alpine AS dev
WORKDIR /repo

COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /repo/apps/web/package.json ./apps/web/package.json
COPY apps/web ./apps/web

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=development

EXPOSE 3101

CMD ["npm", "run", "dev", "--workspace", "benify-for-ssc-gd-web"]

# ================
# Builder Stage
# ================
FROM node:20-alpine AS builder
WORKDIR /repo

# Copy dependencies from deps stage
COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /repo/package*.json ./
COPY --from=deps /repo/apps/web/package.json ./apps/web/package.json
COPY apps/web ./apps/web

# Set environment variables for build
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_BASE_URL
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}

# Build the application
RUN npm run build --workspace benify-for-ssc-gd-web

# ================
# Runner Stage
# ================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3101
ENV HOSTNAME="0.0.0.0"
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy the standalone server plus the assets relative to apps/web,
# which is where Next's generated server.js runs from in this workspace layout.
COPY --from=builder --chown=nextjs:nodejs /repo/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /repo/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /repo/apps/web/.next/static ./apps/web/.next/static

USER nextjs

EXPOSE 3101

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3101/ || exit 1

# Start the standalone server
CMD ["node", "apps/web/server.js"]
