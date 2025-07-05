# Multi-stage Dockerfile for FFR Live Backend
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S backend -u 1001

# Install dependencies stage
FROM base AS dependencies

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies)
RUN npm ci --include=dev

# Development stage
FROM base AS development

# Copy dependencies
COPY --from=dependencies /app/node_modules ./node_modules

# Copy source code
COPY . .

# Change ownership to non-root user
RUN chown -R backend:nodejs /app
USER backend

# Expose port and debug port
EXPOSE 8080 9229

# Start development server with hot reload
CMD ["npm", "run", "dev"]

# Production build stage
FROM base AS build

# Copy dependencies
COPY --from=dependencies /app/node_modules ./node_modules

# Copy source code
COPY . .

# Remove dev dependencies and build (if needed)
RUN npm prune --production

# Production stage
FROM base AS production

# Copy production dependencies and built application
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app .

# Create necessary directories
RUN mkdir -p /app/uploads /app/logs && \
    chown -R backend:nodejs /app

# Change to non-root user
USER backend

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8080/api/v1/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1))"

# Start production server
CMD ["npm", "run", "start"]