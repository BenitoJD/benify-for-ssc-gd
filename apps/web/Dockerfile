# Node.js 20 with standalone output for Next.js
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package files
COPY apps/web/package*.json ./

# Install dependencies (use npm install since there's no lock file)
RUN npm install

# Development image
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY apps/web/ .

# Build the application
RUN npm run build

# Production image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3101

ENV PORT=3101
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
