# ===================================
# Stage 1: Dependencies
# ===================================
FROM node:22-alpine AS deps

# Install pnpm globally
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY source/apps/api/package.json ./source/apps/api/

# Install dependencies only (no devDependencies for production)
RUN pnpm install --frozen-lockfile --prod

# ===================================
# Stage 2: Builder
# ===================================
FROM node:22-alpine AS builder

# Install pnpm globally
RUN npm install -g pnpm

WORKDIR /app

# Copy everything needed for build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY source/apps/api ./source/apps/api

# Install all dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile

# Generate Prisma Client
WORKDIR /app/source/apps/api
RUN pnpm prisma generate --schema=./prisma/schema.prisma

# Build the application
RUN pnpm build

# ===================================
# Stage 3: Runner (Production)
# ===================================
FROM node:22-alpine AS runner

# Install pnpm
RUN npm install -g pnpm

# Create app directory
WORKDIR /app

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/source/apps/api/node_modules ./source/apps/api/node_modules

# Copy built application
COPY --from=builder /app/source/apps/api/dist ./source/apps/api/dist
COPY --from=builder /app/source/apps/api/node_modules/.prisma ./source/apps/api/node_modules/.prisma
COPY --from=builder /app/source/apps/api/prisma ./source/apps/api/prisma

# Copy package.json for running
COPY --from=builder /app/source/apps/api/package.json ./source/apps/api/

# Set NODE_ENV to production
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Set working directory to api folder
WORKDIR /app/source/apps/api

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Run migrations and start the application
CMD ["sh", "-c", "pnpm prisma migrate deploy --schema=./prisma/schema.prisma && node dist/main"]
