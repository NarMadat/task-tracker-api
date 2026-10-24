# ==============================================================================
# Multi-Stage Dockerfile for Nest.js DevOps Production Deployment
# ==============================================================================

# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy dependency manifests
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy application source code and configurations
COPY tsconfig*.json ./
COPY src/ ./src/

# Compile TypeScript to JavaScript
RUN npm run build

# Prune devDependencies to keep image lean
RUN npm prune --production

# ---- Production Runner Stage ----
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=3000

# Install curl for container HEALTHCHECK
RUN apk add --no-cache curl

# Run as non-root user for security best practices
USER node

# Copy production node_modules from builder
COPY --chown=node:node --from=builder /usr/src/app/node_modules ./node_modules
# Copy compiled output
COPY --chown=node:node --from=builder /usr/src/app/dist ./dist
# Copy package.json
COPY --chown=node:node --from=builder /usr/src/app/package.json ./package.json

EXPOSE 3000

# Docker healthcheck using the /health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "dist/main.js"]
