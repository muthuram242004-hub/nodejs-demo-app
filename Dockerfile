# ---------- Stage 1: install production dependencies ----------
FROM node:24-alpine AS deps
WORKDIR /app
COPY package*.json ./
# Use the lockfile when present (recommended), otherwise fall back to npm install
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi \
    && npm cache clean --force

# ---------- Stage 2: small runtime image ----------
FROM node:24-alpine
ENV NODE_ENV=production \
    PORT=3000
ARG APP_VERSION=dev
ENV APP_VERSION=${APP_VERSION}

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src

# Run as the non-root user that ships with the official Node image
USER node

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "src/server.js"]
