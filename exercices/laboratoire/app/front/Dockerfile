# Stage 1: Base image (Builder)
ARG NODE_VERSION=22.12.0
FROM node:${NODE_VERSION}-alpine AS build

# Install git and other tools needed for yarn setup in alpine
RUN apk add --no-cache git

WORKDIR /app
ARG MODE
ENV ENVIRONMENT=$MODE

# --- Dependency Layer for Caching ---
# 1. Enable Corepack: This makes the system 'yarn' command execute the version
#    defined in package.json (Yarn 4.x).
RUN corepack enable && corepack prepare yarn@stable --activate

# 2. Copy only files needed for dependency installation
COPY package.json yarn.lock .yarnrc.yml ./

# 3. Force 'node-modules' linker for better compatibility with Angular CLI
RUN echo 'nodeLinker: node-modules' > .yarnrc.yml

# Install dependencies.
RUN yarn install --immutable

# 4. Copy the rest of the source code
COPY . .

# Set the PATH to ensure the 'ng' binary is easily found.
ENV PATH=/app/node_modules/.bin:$PATH

# Build the Angular application
# This step should now succeed as the entire workspace was registered during 'yarn install'.
RUN yarn run build --configuration=$ENVIRONMENT


# Stage 2: Production artifact (Serving)
FROM nginx:alpine3.20-slim AS artifact
# Copy the custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy the built Angular app from the build stage
COPY --from=build /app/dist/core/browser /usr/share/nginx/html

EXPOSE 80

# Starts Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
