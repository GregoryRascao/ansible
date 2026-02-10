FROM node:20-alpine AS base

# Setup user and directory
RUN addgroup --system app && adduser --system -G app app
ENV HOME=/home/app
WORKDIR $HOME/app

# Enable Corepack and prepare Yarn
RUN corepack enable && corepack prepare yarn@stable --activate && \
    chown -R app:app $HOME

USER app
ENV NODE_ENV=production

# --- Dependencies ---
FROM base AS dependencies
COPY --chown=app:app package.json .yarnrc.yml yarn.lock ./
RUN yarn install --immutable

# --- Build Stage ---
FROM dependencies AS builder
COPY --chown=app:app . .
RUN yarn build && \
    yarn workspaces focus --production && \
    yarn cache clean

# --- Development Stage ---
FROM dependencies AS dev
USER root
RUN apk add --no-cache bash
USER app
COPY --chown=app:app . .
ENV NODE_ENV=development
EXPOSE 3000
CMD ["yarn", "start:dev"]

# --- Production Runner ---
FROM base AS runner
ARG MODE=production
ENV NODE_ENV=${MODE}
ENV TZ=Europe/Brussels

COPY --chown=app:app --from=builder $HOME/app/dist ./dist
COPY --chown=app:app --from=builder $HOME/app/node_modules ./node_modules
COPY --chown=app:app --from=builder $HOME/app/package.json ./

EXPOSE 3000
CMD ["node", "dist/main.js"]
