# ==========================================
# Frontend Dockerfile for Dokploy / Docker
# Multi-stage build: Vite build -> Nginx Alpine
# ==========================================

# Stage 1: Build static assets
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency specifications
COPY package.json package-lock.json ./

# Install dependencies with frozen lockfile
RUN npm ci

# Copy application source code
COPY . .

# Build production distribution
RUN npm run build

# Stage 2: Serve with Nginx Alpine
FROM nginx:alpine AS runner

# Remove default nginx html
RUN rm -rf /usr/share/nginx/html/*

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration for React SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
