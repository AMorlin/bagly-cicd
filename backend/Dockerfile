FROM node:20-slim AS base

# Install OpenSSL for Prisma and upgrade all packages to fix vulnerabilities
RUN apt-get update -y && apt-get upgrade -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 fastify

# Create uploads directory with correct ownership
RUN mkdir -p /app/uploads && chown fastify:nodejs /app/uploads

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/prisma ./prisma

# Install only production dependencies and remove npm/npx to eliminate bundled vulnerabilities (tar, cross-spawn, glob)
RUN npm ci --omit=dev && npx prisma generate && \
    npm cache clean --force && \
    rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx

USER fastify

EXPOSE 3333
ENV PORT=3333

CMD ["node", "dist/server.js"]
