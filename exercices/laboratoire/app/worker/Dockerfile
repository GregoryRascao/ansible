# --------------------
# 1. Base Stage (Shared: Defines Node, User, and Permissions)
# --------------------
FROM node:20-alpine AS base

# --- 1A. User and Directory Setup (MUST BE RUN AS ROOT) ---
# Create non-root user 'app' and its home directory '/home/app'
RUN addgroup --system app && adduser --system -G app app
ENV HOME=/home/app
# Set the working directory
WORKDIR $HOME/app

# Enable Corepack (requires root access to create global symlinks)
RUN corepack enable && corepack prepare yarn@stable --activate

# CRUCIAL FIX: Ensure 'app' user owns their entire home directory
RUN chown -R app:app $HOME

# --- 1B. User Switch ---
# Switch to non-root user for all subsequent commands and stages
USER app
# Set a default environment variable
ENV NODE_ENV=production

# --------------------
# 2. Dependencies Stage (Target: dependencies)
# Installs all dependencies (dev and prod) as the non-root 'app' user.
# --------------------
FROM base AS dependencies
# Copy manifest files (now runs as 'app' user)
COPY package.json .yarnrc.yml yarn.lock ./
RUN yarn cache clean && yarn install

# --------------------
# 3. Build Stage (Target: builder)
# Compiles the TypeScript to JavaScript.
# --------------------
FROM dependencies AS builder
# Copy source code (runs as 'app' user)
COPY . .
# Compile the application
RUN yarn build

# *** FIX FOR YN0050: Use 'yarn workspaces focus --production' ***
# This is the modern, recommended way to strip dev dependencies for the final image.
RUN yarn workspaces focus --production && yarn cache clean

# --------------------
# 4. Development Runner Stage (Target: dev)
# For local development/debugging with hot-reloading.
# --------------------
FROM dependencies AS dev
# Switch to root to install system packages, then switch back to app
USER root
RUN apk add --no-cache bash
USER app
# Copy all source code
COPY . .
# Set the development environment
ENV NODE_ENV=development
EXPOSE 3000
CMD ["yarn", "start:dev"]

# --------------------
# 5. Production Runner Stage (Default Target: runner)
# The final, lean, and secure image for PRODUCTION or ACCEPTANCE.
# --------------------
FROM base AS runner
# The user is 'app' from the base stage
ARG MODE=production
ENV NODE_ENV=${MODE}

# Copying as 'app' user is implicit from the FROM base
COPY --chown=app:app --from=builder $HOME/app/dist ./dist
COPY --chown=app:app --from=builder $HOME/app/node_modules ./node_modules
# Copy package.json for runtime consistency
COPY package.json ./

ENV TZ=Europe/Brussels

EXPOSE 3000
CMD ["node", "dist/main.js"]
